// QA de dashboard, revisiones y cuenta.
//   node --env-file=.env.local scripts/qa/admin.mjs [url]
// Necesita al menos dos publicaciones (las crea scripts/qa/editor.mjs). Deja todo como estaba.
import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const step = (m) => console.log("✓", m);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("dialog", (d) => d.accept());

async function login(password) {
  await page.goto(`${base}/admin/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}
await login(ADMIN_PASSWORD);
await page.waitForURL(`${base}/admin`);

await page.locator(".adm-card", { hasText: "Sitio público" }).waitFor();
await page.locator(".adm-card", { hasText: "Borrador" }).waitFor();
step("dashboard muestra estado del sitio y del borrador");

// Revisiones
await page.goto(`${base}/admin/revisiones`);
const rows = page.locator(".adm-table tbody tr");
await rows.first().waitFor();
assert.ok((await rows.count()) >= 2, "hay al menos dos revisiones");
await rows.first().locator(".adm-badge", { hasText: "En línea" }).waitFor();
step(`${await rows.count()} revisiones, la más reciente marcada “En línea”`);

const publicTitle = async () => {
  const p = await browser.newPage();
  await p.goto(base);
  const t = (await p.locator('[data-hero="l1"]').textContent()).trim();
  await p.close();
  return t;
};
const before = await publicTitle();

// Restaurar la penúltima (la de "PRUEBA EDITOR" de la QA del editor) solo cambia el borrador
await rows.nth(1).getByRole("button", { name: "Restaurar al borrador" }).click();
await rows.nth(1).locator(".adm-ok", { hasText: "Restaurada" }).waitFor();
assert.equal(await publicTitle(), before);
await page.goto(`${base}/admin`);
await page.locator(".adm-badge", { hasText: "Cambios sin publicar" }).waitFor();
step("restaurar copia al borrador sin tocar el sitio y el dashboard lo marca");

// Volver a dejar el borrador como lo publicado
await page.goto(`${base}/admin/revisiones`);
await rows.first().getByRole("button", { name: "Restaurar al borrador" }).click();
await rows.first().locator(".adm-ok").waitFor();
await page.goto(`${base}/admin`);
await page.locator(".adm-badge", { hasText: "Igual a lo publicado" }).waitFor();
step("restaurar la versión en línea deja el borrador igual a lo publicado");

// Cuenta
const temp = `Temporal-${Date.now()}`;
await page.goto(`${base}/admin/cuenta`);
await page.fill('input[name="current"]', "incorrecta-123");
await page.fill('input[name="next"]', temp);
await page.fill('input[name="confirm"]', temp);
await page.click('.adm-main button[type="submit"]');
await page.locator(".adm-error", { hasText: "no es correcta" }).waitFor();
step("rechaza la contraseña actual incorrecta");

await page.fill('input[name="current"]', ADMIN_PASSWORD);
await page.fill('input[name="next"]', temp);
await page.fill('input[name="confirm"]', temp);
await page.click('.adm-main button[type="submit"]');
await page.locator(".adm-ok", { hasText: "actualizada" }).waitFor();
await page.getByRole("button", { name: "Salir" }).click();
await page.waitForURL(`${base}/admin/login`);
await login(temp);
await page.waitForURL(`${base}/admin`);
step("cambia la contraseña y se puede entrar con la nueva");

await page.goto(`${base}/admin/cuenta`);
await page.fill('input[name="current"]', temp);
await page.fill('input[name="next"]', ADMIN_PASSWORD);
await page.fill('input[name="confirm"]', ADMIN_PASSWORD);
await page.click('.adm-main button[type="submit"]');
await page.locator(".adm-ok", { hasText: "actualizada" }).waitFor();
step("contraseña original restaurada");
await browser.close();
