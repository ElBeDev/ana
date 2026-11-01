// Capturas de página completa (desktop y móvil) para comparar antes/después de un cambio.
//   node scripts/screens.mjs <carpeta> [url]
//   node scripts/screens.mjs --diff <carpetaA> <carpetaB>
// Se captura con movimiento reducido para que no haya animaciones a medias.
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

async function capture(dir, url) {
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    // Fuerza la carga de imágenes lazy recorriendo la página
    await page.evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await wait(40);
      }
      window.scrollTo(0, 0);
      await Promise.race([Promise.all([...document.images].map((img) => img.decode().catch(() => {}))), wait(5000)]);
    });
    // La hora en vivo cambia entre capturas
    await page.addStyleTag({ content: ".footer-links__row > span:last-child { visibility: hidden }" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, `${vp.name}.png`), fullPage: true });
    await context.close();
  }
  await browser.close();
  console.log(`Capturas en ${dir}`);
}

async function diff(a, b) {
  let failed = false;
  for (const file of (await readdir(a)).filter((f) => f.endsWith(".png"))) {
    const [ia, ib] = await Promise.all([
      sharp(path.join(a, file)).raw().ensureAlpha().toBuffer({ resolveWithObject: true }),
      sharp(path.join(b, file)).raw().ensureAlpha().toBuffer({ resolveWithObject: true }),
    ]);
    if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height) {
      console.log(`✗ ${file}: tamaño distinto ${ia.info.width}×${ia.info.height} vs ${ib.info.width}×${ib.info.height}`);
      failed = true;
      continue;
    }
    let changed = 0;
    for (let i = 0; i < ia.data.length; i += 4) {
      const d =
        Math.abs(ia.data[i] - ib.data[i]) + Math.abs(ia.data[i + 1] - ib.data[i + 1]) + Math.abs(ia.data[i + 2] - ib.data[i + 2]);
      if (d > 24) changed++;
    }
    const pct = (changed / (ia.data.length / 4)) * 100;
    const ok = pct < 0.1;
    if (!ok) failed = true;
    console.log(`${ok ? "✓" : "✗"} ${file}: ${pct.toFixed(3)}% de píxeles distintos`);
  }
  process.exit(failed ? 1 : 0);
}

const [, , first, second, third] = process.argv;
if (first === "--diff") await diff(second, third);
else await capture(first ?? "screens", second ?? "http://localhost:3000");
