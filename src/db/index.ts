import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

// Una conexión por instancia; en Neon se usa la URL con pooler.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };
const sql = url ? (globalForDb.sql ??= postgres(url, { max: 5, prepare: false })) : null;

export const db = sql ? drizzle(sql, { schema }) : null;

/** Para código que no puede funcionar sin BD (admin). El sitio público usa el respaldo. */
export function requireDb() {
  if (!db) throw new Error("Falta DATABASE_URL");
  return db;
}

export { schema };
