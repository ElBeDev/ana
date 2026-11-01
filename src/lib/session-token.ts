// Token de sesión firmado: "<userId>.<expira en ms>.<firma>". Sin dependencias de Next
// para poder usarlo tanto en proxy.ts como en el servidor.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "aa_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET falta o es muy corto (mínimo 32 caracteres)");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createToken(userId: number) {
  const payload = `${userId}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

/** Devuelve el id del usuario si la firma es válida y no ha expirado. */
export function verifyToken(token: string | undefined): number | null {
  if (!token) return null;
  const [id, exp, signature] = token.split(".");
  if (!id || !exp || !signature) return null;
  const expected = Buffer.from(sign(`${id}.${exp}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (Number(exp) < Date.now()) return null;
  const userId = Number(id);
  return Number.isInteger(userId) ? userId : null;
}
