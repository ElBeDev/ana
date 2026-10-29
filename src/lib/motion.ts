"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

gsap.config({ nullTargetWarn: false });

// outQuart, la curva principal de la referencia
export const EASE_MAIN = "power4.out";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.body.classList.toggle("is-locked", locked);
}

export function prefersReducedMotion() {
  return document.documentElement.classList.contains("reduced");
}

/** Desktop con puntero fino: aquí van cursor, lente WebGL y parallax de mouse. */
export function isFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches;
}

export { gsap, ScrollTrigger, SplitText };
