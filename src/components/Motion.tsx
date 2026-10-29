"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, SplitText, EASE_MAIN, setLenis, getLenis, prefersReducedMotion } from "@/lib/motion";

const fmt = new Intl.NumberFormat("es-MX");

/**
 * Orquesta todo lo que depende del scroll: Lenis, reveals por data-attribute,
 * contadores, cambio de color del nav, marquesinas y la sección "ruido".
 */
export function Motion() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    // ---------- Scroll suave ----------
    if (!reduced) {
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7 });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      });
    }

    // Anclas internas con scroll suave
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      const target = id === "#" || id === "#inicio" ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
      history.replaceState(null, "", id === "#" ? " " : id);
    };
    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    const ctx = gsap.context(() => {
      // ---------- Color del nav según la sección ----------
      const nav = document.querySelector<HTMLElement>(".nav");
      const setTheme = (t: string) => nav && (nav.dataset.theme = t);
      document.querySelectorAll<HTMLElement>("[data-nav]").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 2.1rem",
          end: "bottom 2.1rem",
          onToggle: (self) => setTheme(self.isActive ? section.dataset.nav! : "dark"),
        });
      });

      // ---------- Pill activo del nav ----------
      document.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (!self.isActive) return;
            document.querySelectorAll(".nav-pill").forEach((p) =>
              p.classList.toggle("is-active", p.getAttribute("href") === `#${section.id}`),
            );
          },
        });
      });

      // ---------- WhatsApp flotante: aparece al salir del hero ----------
      const wa = document.querySelector(".wa");
      if (wa) {
        ScrollTrigger.create({
          trigger: ".hero",
          start: "bottom 60%",
          onEnter: () => wa.classList.add("is-visible"),
          onLeaveBack: () => wa.classList.remove("is-visible"),
        });
      }

      // ---------- Contadores ----------
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el, i) => {
        const end = Number(el.dataset.count);
        const prefix = el.dataset.prefix ?? "";
        if (reduced) {
          el.textContent = prefix + fmt.format(end);
          return;
        }
        const state = { v: 0 };
        el.textContent = prefix + "0";
        gsap.to(state, {
          v: end,
          duration: 1.6,
          ease: EASE_MAIN,
          delay: (i % 5) * 0.1,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => (el.textContent = prefix + fmt.format(Math.round(state.v))),
        });
      });

      if (reduced) return;

      // ---------- Reveals genéricos ----------
      gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: EASE_MAIN,
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
        const img = el.querySelector("img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        tl.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: EASE_MAIN }, Number(el.dataset.delay ?? 0));
        if (img) tl.from(img, { scale: 1.15, duration: 1.4, ease: EASE_MAIN }, "<");
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="draw"]').forEach((el) => {
        gsap.to(el, {
          scaleX: 1,
          duration: 1,
          ease: EASE_MAIN,
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      // Títulos: cada línea sube desde una máscara
      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(self.lines, {
              yPercent: 105,
              duration: 0.9,
              stagger: 0.08,
              ease: EASE_MAIN,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          },
        });
      });

      // Nombre gigante del footer: letras desde una máscara
      gsap.utils.toArray<HTMLElement>('[data-reveal="chars"]').forEach((el) => {
        gsap.set(el, { visibility: "visible" });
        gsap.from(el.querySelectorAll(".ch"), {
          yPercent: 140,
          duration: 1,
          stagger: 0.03,
          ease: EASE_MAIN,
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        });
      });

      // Intro: palabras de gris a tinta con el scroll
      gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { color: "#c5c9cf" },
          {
            color: "#0b1b2e",
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
      });

      // ---------- Cómo trabajo: línea que se dibuja y números que se encienden ----------
      const process = document.querySelector<HTMLElement>(".process");
      if (process) {
        const steps = process.querySelectorAll<HTMLElement>(".step");
        gsap.fromTo(
          ".process__line",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: process,
              start: "top 75%",
              end: "bottom 55%",
              scrub: true,
              onUpdate: (self) =>
                steps.forEach((s, i) => s.classList.toggle("is-on", self.progress >= i / steps.length + 0.02)),
            },
          },
        );
      }

      // ---------- Marquesinas: loop infinito que se acelera con el scroll ----------
      gsap.utils.toArray<HTMLElement>(".marquee").forEach((track) => {
        const dir = Number(track.dataset.dir ?? 1);
        const loop = gsap.fromTo(
          track,
          { xPercent: dir > 0 ? 0 : -50 },
          { xPercent: dir > 0 ? -50 : 0, duration: 35, ease: "none", repeat: -1 },
        );
        ScrollTrigger.create({
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
            gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.2, overwrite: false });
          },
        });
      });

      // ---------- Ruido → orden ----------
      const noise = document.querySelector<HTMLElement>(".noise");
      if (noise) {
        gsap.utils.toArray<HTMLElement>(".noise__img").forEach((img) => {
          gsap.to(img, {
            yPercent: -Number(img.dataset.speed ?? 40),
            ease: "none",
            scrollTrigger: { trigger: noise, start: "top bottom", end: () => `top+=${window.innerHeight * 1.2} top`, scrub: true },
          });
        });
        const mask = noise.querySelector<HTMLElement>(".noise__mask");
        const maskImg = noise.querySelector<HTMLElement>(".noise__mask img");
        // La sección mide 320svh: ~0.8 pantallas de "ruido", luego la máscara crece hasta el final.
        const scrub = { trigger: noise, start: () => `top+=${window.innerHeight * 0.8} top`, end: "bottom bottom", scrub: true };
        gsap.to(mask, { maskSize: "6000%", webkitMaskSize: "6000%", ease: "power4.in", scrollTrigger: scrub });
        gsap.to(maskImg, { scale: 1, ease: "power2.out", scrollTrigger: scrub });
        // Nav en blanco mientras la imagen revelada cubre la pantalla
        ScrollTrigger.create({
          trigger: noise,
          start: () => `top+=${window.innerHeight * 1.6} top`,
          end: "bottom top",
          onToggle: (self) => setTheme(self.isActive ? "light" : "dark"),
        });
        const lines = noise.querySelectorAll(".noise__reveal .rv");
        gsap.set(lines, { opacity: 0, y: (i) => (i === 0 ? "1em" : "1.2em") });
        ScrollTrigger.create({
          trigger: noise,
          start: () => `top+=${window.innerHeight * 1.75} top`,
          onEnter: () => gsap.to(lines, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }),
          onLeaveBack: () => gsap.to(lines, { opacity: 0, y: "1em", duration: 0.4 }),
        });
      }
    });

    // Recalcular cuando cargan fuentes e imágenes
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
