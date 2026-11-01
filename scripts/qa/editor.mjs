// QA del editor: editar → guardar borrador → vista previa → publicar → sitio público.
//   node --env-file=.env.local scripts/qa/editor.mjs [url]
// Deja el contenido como estaba (vuelve a publicar el título original).
import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const step = (m) => console.log("✓", m);
const browser = await chromium.launch();

async function login(context) {
  const page = await context.newPage();
  await page.goto(`${base}/admin/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${base}/admin`);
  return page;
}

async function publicTitle() {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(base);
  const t = await p.locator('[data-hero="l1"]').textContent();
  await ctx.close();
  return t.trim();
}

const admin = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await login(admin);
page.on("dialog", (d) => d.accept());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`${base}/admin/editor`);
const canvas = page.frameLocator("iframe");
await canvas.locator('[data-hero="l1"]').waitFor();
const original = (await canvas.locator('[data-hero="l1"]').textContent()).trim();
step(`editor carga el lienzo (título actual: "${original}")`);

// Seleccionar el Hero desde la Estructura y editar el título
await page.getByRole("button", { name: "Hero" }).first().click();
const field = page.locator(`input[name="titleSans"]`).filter({ visible: true });
await field.fill("PRUEBA EDITOR");
await canvas.getByText("PRUEBA EDITOR").first().waitFor();
step("al editar un campo el lienzo se actualiza en vivo");

await page.locator(".ed-status", { hasText: "Cambios sin guardar" }).waitFor();
step("marca “cambios sin guardar”");

// Las acciones de creación/borrado no existen
assert.equal(await page.getByRole("button", { name: /Duplicar|Duplicate/ }).count(), 0);
assert.equal(await page.getByRole("button", { name: /^Delete$|^Borrar$/ }).count(), 0);
step("no hay acciones para duplicar o borrar secciones");

await page.getByRole("button", { name: "Guardar borrador" }).click();
await page.locator(".ed-status", { hasText: "Borrador guardado" }).waitFor();
assert.equal(await publicTitle(), original);
step("guardar borrador no cambia el sitio público");

const preview = await admin.newPage();
await preview.goto(`${base}/admin/preview`);
await preview.waitForURL(`${base}/`);
assert.equal((await preview.locator('[data-hero="l1"]').textContent()).trim(), "PRUEBA EDITOR");
await preview.locator(".preview-bar").waitFor();
step("vista previa muestra el borrador con la barra de vista previa");
await preview.goto(`${base}/admin/preview?off`);
assert.equal((await preview.locator('[data-hero="l1"]').textContent()).trim(), original);
await preview.close();
step("salir de la vista previa vuelve a lo publicado");

await page.getByRole("button", { name: "Publicar" }).click();
await page.locator(".ed-status", { hasText: "Publicado" }).waitFor();
assert.equal(await publicTitle(), "PRUEBA EDITOR");
step("publicar actualiza el sitio público de inmediato");

// Recarga del editor: el borrador persiste
await page.reload();
await page.frameLocator("iframe").getByText("PRUEBA EDITOR").first().waitFor();
step("el contenido persiste al recargar el editor");

// Restaurar
await page.getByRole("button", { name: "Hero" }).first().click();
await page.locator(`input[name="titleSans"]`).filter({ visible: true }).fill(original);
await page.locator(".ed-status", { hasText: "Cambios sin guardar" }).waitFor();
await page.getByRole("button", { name: "Publicar" }).click();
await page.locator(".ed-status", { hasText: "Publicado" }).waitFor();
assert.equal(await publicTitle(), original);
step("contenido original restaurado");

assert.deepEqual(errors, []);
step("sin errores de JavaScript en el editor");
await browser.close();
