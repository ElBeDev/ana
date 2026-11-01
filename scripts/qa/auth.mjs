// QA del login: node --env-file=.env.local scripts/qa/auth.mjs [url]
import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const browser = await chromium.launch();
const page = await browser.newPage();
const step = (m) => console.log("✓", m);

await page.goto(`${base}/admin`);
assert.equal(new URL(page.url()).pathname, "/admin/login");
step("sin sesión redirige a /admin/login");

await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', "contraseña-incorrecta");
await page.click('button[type="submit"]');
await page.locator(".adm-error").waitFor();
assert.match(await page.locator(".adm-error").textContent(), /incorrectos/);
step("contraseña incorrecta muestra error");

await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(`${base}/admin`);
await page.getByRole("heading", { name: "Inicio" }).waitFor();
step("credenciales correctas entran al dashboard");

const cookie = (await page.context().cookies()).find((c) => c.name === "aa_admin");
assert.ok(cookie?.httpOnly, "cookie httpOnly");
assert.equal(cookie.sameSite, "Lax");
step("cookie de sesión httpOnly + SameSite=Lax");

// Cookie manipulada → fuera
await page.context().addCookies([{ ...cookie, value: cookie.value.replace(/^\d+/, "999") }]);
await page.goto(`${base}/admin`);
assert.equal(new URL(page.url()).pathname, "/admin/login");
step("cookie manipulada es rechazada");

await page.context().addCookies([cookie]);
await page.goto(`${base}/admin`);
await page.getByRole("button", { name: "Salir" }).click();
await page.waitForURL(`${base}/admin/login`);
await page.goto(`${base}/admin`);
assert.equal(new URL(page.url()).pathname, "/admin/login");
step("salir cierra la sesión");

// Límite: tras 5 fallos (más el de arriba) el login se bloquea aunque la contraseña sea correcta
for (let i = 0; i < 5; i++) {
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', `mala-${i}`);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.querySelector(".adm-error") && !document.querySelector("button[disabled]"));
}
await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForFunction(() => /Demasiados/.test(document.querySelector(".adm-error")?.textContent ?? ""));
step("bloquea tras demasiados intentos fallidos");

await browser.close();
