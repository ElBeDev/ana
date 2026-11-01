import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { and, eq, gte, or } from "drizzle-orm";
import { requireDb, schema } from "@/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, createToken, verifyToken } from "@/lib/session-token";

export type Admin = { id: number; email: string; name: string };

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function getAdmin(): Promise<Admin | null> {
  await connection(); // la validación compara la expiración con la hora actual
  const userId = verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const [user] = await requireDb()
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, userId));
  return user ?? null;
}

/** Verificación real de sesión: va en layouts protegidos, Server Actions y Route Handlers. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const db = requireDb();
  const ip = `ip:${await clientIp()}`;
  const mail = `email:${email}`;
  const since = new Date(Date.now() - WINDOW_MS);

  const failures = await db
    .select({ key: schema.loginAttempts.key })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.success, false),
        gte(schema.loginAttempts.createdAt, since),
        or(eq(schema.loginAttempts.key, ip), eq(schema.loginAttempts.key, mail)),
      ),
    );
  const count = (key: string) => failures.filter((f) => f.key === key).length;
  if (count(ip) >= MAX_FAILURES || count(mail) >= MAX_FAILURES) {
    return { ok: false, error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." };
  }

  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  await db.insert(schema.loginAttempts).values([
    { key: ip, success: valid },
    { key: mail, success: valid },
  ]);
  if (!user || !valid) return { ok: false, error: "Correo o contraseña incorrectos." };

  await db.update(schema.adminUsers).set({ lastLoginAt: new Date() }).where(eq(schema.adminUsers.id, user.id));
  (await cookies()).set(SESSION_COOKIE, createToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function changePassword(adminId: number, current: string, next: string): Promise<LoginResult> {
  if (next.length < 10) return { ok: false, error: "La nueva contraseña debe tener al menos 10 caracteres." };
  const db = requireDb();
  const [user] = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.id, adminId));
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  await db
    .update(schema.adminUsers)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(schema.adminUsers.id, adminId));
  return { ok: true };
}
