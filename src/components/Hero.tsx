"use client";

import { useEffect, useRef } from "react";
import { site, contactHref } from "@/content/site";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { HeroLens } from "@/components/HeroLens";
import { Pill } from "@/components/ui/Pill";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Parallax del contenido con el mouse (±0.5em)
  useEffect(() => {
    const hero = ref.current;
    if (!hero || prefersReducedMotion() || !isFinePointer()) return;
    const layer = hero.querySelector(".hero__parallax");
    const xTo = gsap.quickTo(layer, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(layer, "y", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 16);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 16);
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section className="hero" id="inicio" ref={ref} data-nav="light" data-section>
      <div className="hero__media" data-hero="media">
        <picture>
          <source media="(max-width: 767px)" srcSet="/img/hero-a-m.webp" />
          <img src="/img/hero-a.webp" alt="Ana Aguirre, consultora estratégica" fetchPriority="high" />
        </picture>
        <div className="hero__b" aria-hidden="true">
          <picture>
            <source media="(max-width: 767px)" srcSet="/img/hero-b-m.webp" />
              <img src="/img/hero-b.webp" alt="" loading="lazy" />
          </picture>
        </div>
        <HeroLens a="/img/hero-a.webp" b="/img/hero-b.webp" />
      </div>
      <div className="hero__shade" />

      <div className="hero__content">
        <div className="hero__parallax">
          <h1 className="hero__title">
            <span className="sr-only">{site.name}, </span>
            <span style={{ display: "block" }} data-hero="l1">
              Estrategia
            </span>
            <span className="serif" data-hero="l2">
              que se transforma en soluciones
            </span>
          </h1>
          <div className="hero__cta" data-hero="cta">
            <Pill href={contactHref()} variant="light" cursor="ESCRÍBEME">
              Agendar una llamada
            </Pill>
          </div>
        </div>
      </div>

      <div className="hero__bar">
        <div className="hr" style={{ opacity: 0.45 }} data-hero="line" />
        <div className="hero__bar-row">
          <span className="tag" data-hero="tag">
            {site.role}
          </span>
          <p data-hero="para">
            Más de 15 años convirtiendo necesidades empresariales e institucionales en soluciones operativas y
            digitales.
          </p>
          <span className="tag" data-hero="tag">
            Consultoría &amp; Soluciones Digitales
          </span>
        </div>
      </div>
    </section>
  );
}
