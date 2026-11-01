// Crea (o actualiza la contraseña de) la cuenta admin a partir de ADMIN_EMAIL y ADMIN_PASSWORD,
// y registra en la biblioteca de medios las imágenes originales de public/img.
//   npm run seed
// El documento de la landing se crea solo la primera vez que se abre el editor.
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import sharp from "sharp";
import { adminUsers, media } from "../src/db/schema.ts";
import { hashPassword } from "../src/lib/password.ts";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Faltan DATABASE_URL, ADMIN_EMAIL o ADMIN_PASSWORD");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error("ADMIN_PASSWORD debe tener al menos 10 caracteres");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1, prepare: false });
const db = drizzle(sql);

const email = ADMIN_EMAIL.trim().toLowerCase();
const passwordHash = await hashPassword(ADMIN_PASSWORD);
await db
  .insert(adminUsers)
  .values({ email, name: ADMIN_NAME ?? "Ana Aguirre", passwordHash })
  .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } });

console.log(`Admin listo: ${email}`);

const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
const dir = path.join(process.cwd(), "public", "img");
let added = 0;
for (const file of (await readdir(dir)).sort()) {
  const contentType = TYPES[path.extname(file).toLowerCase()];
  if (!contentType) continue;
  const full = path.join(dir, file);
  const [{ size }, meta] = await Promise.all([stat(full), sharp(full).metadata()]);
  const rows = await db
    .insert(media)
    .values({
      url: `/img/${file}`,
      pathname: `img/${file}`,
      filename: file,
      contentType,
      size,
      width: meta.width ?? null,
      height: meta.height ?? null,
    })
    .onConflictDoNothing()
    .returning({ id: media.id });
  added += rows.length;
}
console.log(`Biblioteca: ${added} imágenes originales registradas`);
await sql.end();
