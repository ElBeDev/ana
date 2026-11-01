// Recorre la landing con animaciones activas y falla si hay errores en consola.
//   node scripts/qa/console.mjs [url]
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const errors = [];
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport });
  page.on("console", (m) => m.type() === "error" && errors.push(`[${viewport.width}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${viewport.width}] ${e.message}`));
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(800);
  await page.close();
}
await browser.close();
if (errors.length) {
  console.log(errors.join("\n"));
  process.exit(1);
}
console.log("✓ sin errores de consola (desktop y móvil, con animaciones)");
