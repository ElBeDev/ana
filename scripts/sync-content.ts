// Copia contenido de src/content/defaults.ts al documento de la BD (borrador y publicado),
// para cuando un cambio de textos o de forma se hace en código.
//   npm run content:sync -- Intro Experience About.skills          (muestra qué cambiaría)
//   npm run content:sync -- Intro Experience About.skills --apply  (lo guarda)
// "Bloque" reemplaza todas las props de la sección; "Bloque.campo" solo ese campo.
// Al aplicar se guarda una revisión. El sitio lo muestra tras el siguiente despliegue
// o al publicar desde el panel (la caché de la landing no se invalida desde aquí).
import { isDeepStrictEqual } from "node:util";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { content, revisions } from "../src/db/schema.ts";
import { defaultLanding } from "../src/content/defaults.ts";

type Doc = { root: unknown; content: { type: string; props: Record<string, unknown> }[] };

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const targets = args.filter((a) => !a.startsWith("--"));
if (!process.env.DATABASE_URL || !targets.length) {
  console.error("Uso: npm run content:sync -- <Bloque|Bloque.campo>... [--apply]  (requiere DATABASE_URL)");
  process.exit(1);
}

function patch(doc: Doc): string[] {
  const changed: string[] = [];
  for (const target of targets) {
    const [type, key] = target.split(".");
    const block = doc.content.find((b) => b.type === type);
    const base = defaultLanding.content.find((b) => b.type === type)?.props as Record<string, unknown> | undefined;
    if (!block || !base || (key && !(key in base))) throw new Error(`No existe ${target}`);
    const next = key ? { ...block.props, [key]: base[key] } : { ...base };
    // jsonb reordena las llaves: se compara sin importar el orden
    if (!isDeepStrictEqual(next, block.props)) {
      block.props = next;
      changed.push(target);
    }
  }
  return changed;
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
const db = drizzle(sql);
const [row] = await db.select().from(content).where(eq(content.id, "landing"));
if (!row) {
  console.log("No hay documento en la BD: el editor lo creará desde defaults al abrirse.");
  await sql.end();
  process.exit(0);
}

const draft = structuredClone(row.draft) as Doc;
const published = row.published ? (structuredClone(row.published) as Doc) : null;
const draftChanged = patch(draft);
const publishedChanged = published ? patch(published) : [];
console.log(`Borrador: ${draftChanged.join(", ") || "sin cambios"}`);
console.log(`Publicado: ${published ? publishedChanged.join(", ") || "sin cambios" : "(nunca publicado)"}`);

if (apply && (draftChanged.length || publishedChanged.length)) {
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(content)
      .set({ draft, draftUpdatedAt: now, ...(publishedChanged.length ? { published, publishedAt: now } : {}) })
      .where(eq(content.id, "landing"));
    if (publishedChanged.length) await tx.insert(revisions).values({ contentId: "landing", data: published, kind: "publish" });
  });
  console.log("Guardado.");
} else if (!apply) {
  console.log("Nada guardado (agrega --apply).");
}
await sql.end();
