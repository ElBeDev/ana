// QA de medios: subir → reducir/convertir → alt → elegir en el editor → no se puede borrar en uso → borrar.
//   node --env-file=.env.local scripts/qa/media.mjs [url]
import { chromium } from "playwright";
import sharp from "sharp";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const step = (m) => console.log("✓", m);

// Foto de prueba de 3600×2400 (JPG pesado)
const dir = await mkdtemp(path.join(tmpdir(), "qa-media-"));
const photo = path.join(dir, "qa-foto-grande.jpg");
const noise = Buffer.alloc(3600 * 2400 * 3);
for (let i = 0; i < noise.length; i++) noise[i] = (i * 2654435761) % 251;
await sharp(noise, { raw: { width: 3600, height: 2400, channels: 3 } }).jpeg({ quality: 92 }).toFile(photo);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on("dialog", (d) => d.accept());
await page.goto(`${base}/admin/login`);
await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(`${base}/admin`);

await page.goto(`${base}/admin/medios`);
await page.locator(".ml__item").first().waitFor();
const before = await page.locator(".ml__item").count();
assert.ok(before >= 23, "las imágenes originales están en la biblioteca");
step(`biblioteca con ${before} imágenes (incluye las originales de /img)`);

await page.setInputFiles('input[type="file"]', photo);
await page.locator(".adm-ok", { hasText: "Imagen subida" }).waitFor({ timeout: 30000 });
const item = page.locator(".ml__item").first();
const meta = await item.locator(".ml__meta").textContent();
assert.match(meta, /2400×1600/);
assert.match(meta, /qa-foto-grande/);
const url = await item.locator("img").getAttribute("src");
assert.match(url, /\.webp$/);
step(`subida: 3600×2400 JPG → 2400×1600 WebP (${url})`);

await item.locator('input[type="text"]').fill("Foto de prueba QA");
await item.locator('input[type="text"]').blur();
await page.waitForTimeout(800);
await page.reload();
assert.equal(await page.locator(".ml__item").first().locator('input[type="text"]').inputValue(), "Foto de prueba QA");
step("el alt se guarda");

// Usarla en el editor
await page.goto(`${base}/admin/editor`);
const canvas = page.frameLocator("iframe");
await canvas.locator('[data-hero="l1"]').waitFor();
await page.getByRole("button", { name: "Sobre mí" }).first().click();
await page.getByRole("button", { name: "Cambiar imagen" }).filter({ visible: true }).first().click();
await page.locator(".ml-modal .ml__item").first().waitFor();
await page.locator(`.ml-modal img[src="${url}"]`).click();
await canvas.locator(`.about__photo img[src="${url}"]`).waitFor();
step("elegida desde el editor, el lienzo la muestra");
await page.getByRole("button", { name: "Guardar borrador" }).click();
await page.locator(".ed-status", { hasText: "Borrador guardado" }).waitFor();

// No se puede borrar mientras se usa
await page.goto(`${base}/admin/medios`);
await page.locator(`.ml__item:has(img[src="${url}"]) button`, { hasText: "Quitar" }).click();
await page.locator(".adm-error", { hasText: "se está usando" }).waitFor();
step("no deja borrar una imagen en uso");

// Quitarla del borrador y borrarla
await page.goto(`${base}/admin/editor`);
await page.frameLocator("iframe").locator('[data-hero="l1"]').waitFor();
await page.getByRole("button", { name: "Sobre mí" }).first().click();
await page.locator('input[aria-label="URL de la imagen"]').filter({ visible: true }).first().fill("/img/ana-retrato.webp");
await page.getByRole("button", { name: "Guardar borrador" }).click();
await page.locator(".ed-status", { hasText: "Borrador guardado" }).waitFor();
await page.goto(`${base}/admin/medios`);
await page.locator(`.ml__item:has(img[src="${url}"]) button`, { hasText: "Quitar" }).click();
await page.locator(".adm-ok", { hasText: "Imagen quitada" }).waitFor();
assert.equal(await page.locator(`.ml__item img[src="${url}"]`).count(), 0);
step("ya sin uso, se borra");

await browser.close();
