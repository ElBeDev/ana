// QA de ajustes del sitio: contacto, SEO y menú se editan, se publican y llegan al sitio.
//   node --env-file=.env.local scripts/qa/settings.mjs [url]
// Al final vuelve a dejar los valores originales y publica.
import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const step = (m) => console.log("✓", m);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on("dialog", (d) => d.accept());
await page.goto(`${base}/admin/login`);
await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL(`${base}/admin`);

await page.goto(`${base}/admin/editor`);
const canvas = page.frameLocator("iframe");
await canvas.locator('[data-hero="l1"]').waitFor();
const field = (name) => page.locator(`[name="${name}"]`).filter({ visible: true }).first();
await field("contact.whatsapp").waitFor();
step("sin nada seleccionado se ven los Ajustes del sitio");

const original = {
  whatsapp: await field("contact.whatsapp").inputValue(),
  linkedin: await field("contact.linkedin").inputValue(),
  title: await field("seo.title").inputValue(),
  cta: await field("nav.cta").inputValue(),
};

await field("contact.whatsapp").fill("+52 1 55 1234 5678");
await field("contact.linkedin").fill("https://www.linkedin.com/in/qa-prueba");
await field("seo.title").fill("QA · título de prueba");
await field("nav.cta").fill("Escríbeme QA");
await canvas.locator(".nav__cta", { hasText: "Escríbeme QA" }).first().waitFor();
const heroHref = await canvas.locator(".hero__cta a").getAttribute("href");
assert.match(heroHref, /^https:\/\/wa\.me\/5215512345678\?text=/);
step("el lienzo usa el nuevo WhatsApp en los CTAs y el nuevo texto del menú");

await page.getByRole("button", { name: "Publicar" }).click();
await page.locator(".ed-status", { hasText: "Publicado" }).waitFor();

const pub = await browser.newPage();
await pub.goto(base);
assert.equal(await pub.title(), "QA · título de prueba");
assert.match(await pub.locator(".wa").getAttribute("href"), /^https:\/\/wa\.me\/5215512345678/);
assert.match(await pub.locator(".hero__cta a").getAttribute("href"), /wa\.me\/5215512345678/);
assert.equal(await pub.locator('.footer-links a[href="https://www.linkedin.com/in/qa-prueba"]').count(), 1);
const ld = JSON.parse(await pub.locator('script[type="application/ld+json"]').textContent());
assert.deepEqual(ld.sameAs, ["https://www.linkedin.com/in/qa-prueba"]);
step("publicado: <title>, botón flotante de WhatsApp, CTAs, LinkedIn del footer y JSON-LD actualizados");
assert.equal(
  (await page.evaluate(() => fetch("/").then((r) => r.text()))).includes("+52 1 55"),
  false,
);
step("el número se guarda limpio (solo dígitos)");

// Restaurar
await field("contact.whatsapp").fill(original.whatsapp);
await field("contact.linkedin").fill(original.linkedin);
await field("seo.title").fill(original.title);
await field("nav.cta").fill(original.cta);
await page.locator(".ed-status", { hasText: "Cambios sin guardar" }).waitFor();
await page.getByRole("button", { name: "Publicar" }).click();
await page.locator(".ed-status", { hasText: "Publicado" }).waitFor();
await pub.goto(base);
assert.equal(await pub.title(), original.title);
assert.equal(await pub.locator(".wa").count(), original.whatsapp ? 1 : 0);
step("valores originales restaurados");
await browser.close();
