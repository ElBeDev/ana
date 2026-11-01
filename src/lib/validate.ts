// Normaliza un documento que llega del editor antes de guardarlo:
// - la estructura (tipos y orden de secciones) debe ser exactamente la de LANDING_BLOCKS
// - cada valor se ajusta a la forma del contenido original (defaults): lo que sobra se descarta,
//   lo que falta se completa, y los tipos se respetan
// - URLs solo con protocolos seguros
import { LANDING_BLOCKS } from "@/blocks/landing";
import type { LandingData } from "@/blocks/types";
import { defaultLanding } from "@/content/defaults";

const MAX_TEXT = 5000;
const URL_KEYS = new Set([
  "image",
  "imageA",
  "imageAMobile",
  "imageB",
  "imageBMobile",
  "photo",
  "revealImage",
  "src",
  "href",
  "buttonHref",
  "linkedin",
]);

// Imágenes obligatorias: si llega vacía o inválida se conserva la original.
const IMAGE_KEYS = new Set(["image", "imageA", "imageAMobile", "imageB", "imageBMobile", "photo", "revealImage", "src"]);

export class InvalidContentError extends Error {}

export function safeUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("#") || (v.startsWith("/") && !v.startsWith("//"))) return v;
  try {
    const url = new URL(v);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function conform(template: unknown, value: unknown, key = ""): unknown {
  if (typeof template === "string") {
    if (typeof value !== "string") return template;
    const text = value.slice(0, MAX_TEXT);
    if (URL_KEYS.has(key)) return safeUrl(text) || (IMAGE_KEYS.has(key) ? template : "");
    if (key === "whatsapp") return text.replace(/\D/g, "");
    if (key === "email") return text.trim();
    return text;
  }
  if (typeof template === "number") {
    const n = typeof value === "string" ? Number(value) : value;
    return typeof n === "number" && Number.isFinite(n) ? n : template;
  }
  if (typeof template === "boolean") return typeof value === "boolean" ? value : template;
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    const item = template[0];
    return value.slice(0, 50).map((v) => conform(item, v, key));
  }
  if (template && typeof template === "object") {
    const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    return Object.fromEntries(
      Object.entries(template).map(([k, t]) => [k, k in source ? conform(t, source[k], k) : t]),
    );
  }
  return template;
}

export function normalizeLanding(input: unknown): LandingData {
  const data = input as Partial<LandingData> | null;
  const content = Array.isArray(data?.content) ? data.content : [];
  const types = content.map((b) => b?.type);
  if (types.length !== LANDING_BLOCKS.length || types.some((t, i) => t !== LANDING_BLOCKS[i])) {
    throw new InvalidContentError("La estructura de la página no coincide con la definida en código.");
  }
  return {
    root: { props: conform(defaultLanding.root.props, data?.root?.props) as LandingData["root"]["props"] },
    content: content.map((block, i) => {
      const base = defaultLanding.content[i];
      const props = conform(base.props, block.props) as typeof base.props;
      return { type: base.type, props: { ...props, id: base.props.id } } as LandingData["content"][number];
    }),
  };
}
