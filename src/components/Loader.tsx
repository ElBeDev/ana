"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_MAIN, lockScroll, prefersReducedMotion } from "@/lib/motion";

const IMAGES = ["/img/ana-blue.webp", "/img/exp-academia.webp", "/img/ana-wine.webp"];

/** Entrada del hero (7.2): nav, imagen, título, línea, párrafo, etiquetas y CTA. */
function heroIntro(start = 0) {
  const q = (k: string) => document.querySelectorAll(`[data-hero="${k}"]`);
  const up = (y: string) => ({ from: { opacity: 0, y }, to: { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" } });
  gsap.set("[data-hero]", { opacity: 1 });
  const tl = gsap.timeline({ delay: start });
  const l1 = up("1em"), l2 = up("1.2em"), tag = up("1em"), cta = up("1em");
  tl.fromTo(q("media"), { scale: 1.1 }, { scale: 1, duration: 1.2, ease: EASE_MAIN }, 0)
    .fromTo(q("nav"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.1)
    .fromTo(q("l1"), l1.from, l1.to, 0.2)
    .fromTo(q("l2"), l2.from, l2.to, 0.3)
    .fromTo(q("line"), { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0.3)
    .fromTo(q("para"), { opacity: 0 }, { opacity: 0.9, duration: 0.7, ease: "power1.out" }, 0.5)
    .fromTo(q("tag"), tag.from, tag.to, 0.6)
    .fromTo(q("cta"), cta.from, cta.to, 0.7);
  return tl;
}

export function Loader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (prefersReducedMotion()) return;
    if (html.classList.contains("no-loader") || !root.current) {
      const tl = heroIntro();
      return () => {
        tl.kill();
      };
    }

    const el = root.current;
    const imgs = el.querySelectorAll<HTMLImageElement>(".loader__img img");
    lockScroll(true);
    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = "none";
        try {
          sessionStorage.setItem("aa-intro", "1");
        } catch {}
      },
    });
    tl.from(".loader__word", { opacity: 0, y: "0.6em", duration: 0.3, ease: "power2.out" }, 0);
    imgs.forEach((img, i) => tl.set(img, { opacity: 1 }, 0.15 + i * 0.2));
    tl.to(".loader__center", { opacity: 0, duration: 0.25 }, 0.8)
      .to(".loader__panel--l", { xPercent: -100, duration: 0.6, ease: EASE_MAIN }, 0.85)
      .to(".loader__panel--r", { xPercent: 100, duration: 0.6, ease: EASE_MAIN }, 0.85)
      .add(() => lockScroll(false), 1.2);
    const hero = heroIntro(1.0);

    return () => {
      tl.kill();
      hero.kill();
      lockScroll(false);
    };
  }, []);

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader__panel loader__panel--l" />
      <div className="loader__panel loader__panel--r" />
      <div className="loader__center">
        <div className="loader__img">
          {IMAGES.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" />
          ))}
        </div>
        <div className="loader__word">
          Ana <span className="serif" style={{ textTransform: "none", fontWeight: 400 }}>Aguirre</span>
        </div>
      </div>
    </div>
  );
}
