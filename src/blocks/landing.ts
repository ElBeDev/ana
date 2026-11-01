import type { BlockType } from "./types";

/** Orden fijo de las secciones. Cambiarlo es un cambio de código, no del panel. */
export const LANDING_BLOCKS: BlockType[] = [
  "Hero",
  "Intro",
  "Experience",
  "Services",
  "Process",
  "Noise",
  "About",
  "Organizations",
  "Education",
  "Contact",
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  Hero: "Hero",
  Intro: "Presentación y cifras",
  Experience: "Experiencia destacada",
  Services: "Cómo puedo ayudarte",
  Process: "Cómo trabajo",
  Noise: "Ruido → orden",
  About: "Sobre mí",
  Organizations: "Organizaciones",
  Education: "Formación",
  Contact: "Contacto y footer",
};
