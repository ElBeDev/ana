"use client";

import { useEffect, useRef } from "react";
import type { HeroProps } from "@/blocks/types";
import { useContactHref, useSettings } from "@/blocks/context";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { HeroLens } from "@/components/HeroLens";
import { Pill } from "@/components/ui/Pill";

export function Hero(props: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { identity } = useSettings();
  const contactHref = useContactHref();

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
          <source media="(max-width: 767px)" srcSet={props.imageAMobile} />
          <img src={props.imageA} alt={props.alt} fetchPriority="high" />
        </picture>
        <div className="hero__b" aria-hidden="true">
          <picture>
            <source media="(max-width: 767px)" srcSet={props.imageBMobile} />
              <img src={props.imageB} alt="" loading="lazy" />
          </picture>
        </div>
        <HeroLens a={props.imageA} b={props.imageB} />
      </div>
      <div className="hero__shade" />

      <div className="hero__content">
        <div className="hero__parallax">
          <h1 className="hero__title">
            <span className="sr-only">{identity.name}, </span>
            <span style={{ display: "block" }} data-hero="l1">
              {props.titleSans}
            </span>
            <span className="serif" data-hero="l2">
              {props.titleSerif}
            </span>
          </h1>
          <div className="hero__cta" data-hero="cta">
            <Pill href={contactHref()} variant="light" cursor="ESCRÍBEME">
              {props.cta}
            </Pill>
          </div>
        </div>
      </div>

      <div className="hero__bar">
        <div className="hr" style={{ opacity: 0.45 }} data-hero="line" />
        <div className="hero__bar-row">
          <span className="tag" data-hero="tag">
            {props.leftTag}
          </span>
          <p data-hero="para">{props.paragraph}</p>
          <span className="tag" data-hero="tag">
            {props.rightTag}
          </span>
        </div>
      </div>
    </section>
  );
}
