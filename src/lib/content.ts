import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db, requireDb, schema } from "@/db";
import type { LandingData } from "@/blocks/types";
import { defaultLanding } from "@/content/defaults";
import { normalizeLanding } from "@/lib/validate";

const ID = "landing";
export const LANDING_TAG = "landing";

/**
 * Contenido que ve el sitio: el publicado, o el borrador si hay Draft Mode (vista previa).
 * Con Draft Mode la caché se omite, así que `preview` solo es true en esas peticiones.
 */
export async function getLanding(): Promise<{ data: LandingData; preview: boolean }> {
  "use cache";
  cacheTag(LANDING_TAG);
  cacheLife("max");
  const { isEnabled: preview } = await draftMode();
  if (!db) return { data: defaultLanding, preview };
  try {
    const [row] = await db.select().from(schema.content).where(eq(schema.content.id, ID));
    const doc = preview ? row?.draft : row?.published;
    return { data: doc ? normalizeLanding(doc) : defaultLanding, preview };
  } catch (error) {
    console.error("No se pudo leer el contenido; se usa el respaldo", error);
    return { data: defaultLanding, preview };
  }
}

export type EditorState = {
  draft: LandingData;
  published: LandingData | null;
  draftUpdatedAt: Date;
  publishedAt: Date | null;
  hasUnpublishedChanges: boolean;
};

/** Estado para el panel. Crea el registro con el contenido original la primera vez. */
export async function getEditorState(): Promise<EditorState> {
  const database = requireDb();
  let [row] = await database.select().from(schema.content).where(eq(schema.content.id, ID));
  if (!row) {
    [row] = await database
      .insert(schema.content)
      .values({ id: ID, draft: defaultLanding, published: null })
      .onConflictDoNothing()
      .returning();
    row ??= (await database.select().from(schema.content).where(eq(schema.content.id, ID)))[0];
  }
  const draft = normalizeLanding(row.draft);
  const published = row.published ? normalizeLanding(row.published) : null;
  return {
    draft,
    published,
    draftUpdatedAt: row.draftUpdatedAt,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: !published || JSON.stringify(draft) !== JSON.stringify(published),
  };
}

export async function saveDraft(input: unknown) {
  const draft = normalizeLanding(input);
  await getEditorState();
  await requireDb()
    .update(schema.content)
    .set({ draft, draftUpdatedAt: new Date() })
    .where(eq(schema.content.id, ID));
  return draft;
}

/** Publica el documento recibido (y lo deja también como borrador). Quien llama invalida la caché. */
export async function publishLanding(input: unknown) {
  const data = normalizeLanding(input);
  await getEditorState();
  const now = new Date();
  const database = requireDb();
  await database.transaction(async (tx) => {
    await tx
      .update(schema.content)
      .set({ draft: data, published: data, draftUpdatedAt: now, publishedAt: now })
      .where(eq(schema.content.id, ID));
    await tx.insert(schema.revisions).values({ contentId: ID, data, kind: "publish" });
  });
  return data;
}

export async function listRevisions(limit = 50) {
  return requireDb()
    .select({ id: schema.revisions.id, kind: schema.revisions.kind, createdAt: schema.revisions.createdAt })
    .from(schema.revisions)
    .where(eq(schema.revisions.contentId, ID))
    .orderBy(desc(schema.revisions.createdAt))
    .limit(limit);
}

/** Copia una revisión al borrador; lo publicado no cambia hasta que se publique. */
export async function restoreRevision(id: number) {
  const database = requireDb();
  const [rev] = await database.select().from(schema.revisions).where(eq(schema.revisions.id, id));
  if (!rev) throw new Error("Revisión no encontrada");
  return saveDraft(rev.data);
}
