import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { requireDb, schema } from "@/db";
import { getEditorState } from "@/lib/content";

export type MediaItem = typeof schema.media.$inferSelect;

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_BYTES = 8 * 1024 * 1024;

/** Con token de Blob se sube a Vercel Blob; sin él (solo en desarrollo) a public/uploads. */
export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};
const isLocalUpload = (url: string) => url.startsWith("/uploads/");

export async function listMedia(): Promise<MediaItem[]> {
  return requireDb().select().from(schema.media).orderBy(desc(schema.media.createdAt), desc(schema.media.id));
}

type NewMedia = {
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
};

export async function registerMedia(item: NewMedia) {
  // Solo se registran archivos de nuestro Blob o de la carpeta local de desarrollo
  if (!isBlobUrl(item.url) && !isLocalUpload(item.url)) throw new Error("URL de archivo no permitida");
  if (!ALLOWED_TYPES.includes(item.contentType)) throw new Error("Tipo de archivo no permitido");
  const [row] = await requireDb()
    .insert(schema.media)
    .values({
      url: item.url,
      pathname: item.pathname.slice(0, 500),
      filename: item.filename.slice(0, 200),
      contentType: item.contentType,
      size: Math.max(0, Math.round(item.size)),
      width: item.width ? Math.round(item.width) : null,
      height: item.height ? Math.round(item.height) : null,
    })
    .onConflictDoNothing()
    .returning();
  return row;
}

/** Subida local para desarrollo (sin token de Blob). */
export async function saveLocalUpload(file: File) {
  if (process.env.NODE_ENV === "production") throw new Error("Configura BLOB_READ_WRITE_TOKEN para subir archivos");
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Tipo de archivo no permitido");
  if (file.size > MAX_BYTES) throw new Error("El archivo pesa más de 8 MB");
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const base = path.parse(file.name).name.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60) || "imagen";
  const name = `${base}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}`, pathname: `uploads/${name}` };
}

export async function updateAlt(id: number, alt: string) {
  await requireDb().update(schema.media).set({ alt: alt.slice(0, 300) }).where(eq(schema.media.id, id));
}

/** Dónde se usa una URL: en el borrador y/o en lo publicado. */
export async function mediaUsage(url: string) {
  const { draft, published } = await getEditorState();
  return {
    draft: JSON.stringify(draft).includes(JSON.stringify(url)),
    published: published ? JSON.stringify(published).includes(JSON.stringify(url)) : false,
  };
}

export async function deleteMedia(id: number) {
  const database = requireDb();
  const [item] = await database.select().from(schema.media).where(eq(schema.media.id, id));
  if (!item) return;
  const usage = await mediaUsage(item.url);
  if (usage.draft || usage.published) throw new Error("La imagen se está usando en la página; cámbiala antes de borrarla.");
  if (isBlobUrl(item.url) && blobEnabled()) await del(item.url);
  // Los archivos de /img y /uploads se quedan en disco; solo se quitan de la biblioteca
  await database.delete(schema.media).where(eq(schema.media.id, id));
}
