"use client";

import { useEffect, useRef, useState } from "react";
import { experience, type Experience as Exp } from "@/content/site";
import { gsap, isFinePointer, lockScroll } from "@/lib/motion";
import { Pill, Roll } from "@/components/ui/Pill";

export function Experience() {
  const [active, setActive] = useState<Exp | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // La imagen sigue al mouse dentro de la tarjeta (±1em)
  useEffect(() => {
    if (!grid.current || !isFinePointer()) return;
    const cards = grid.current.querySelectorAll<HTMLElement>(".exp-card");
    const offs = [...cards].map((card) => {
      const inner = card.querySelector(".exp-card__inner");
      const xTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 32);
        yTo(((e.clientY - r.top) / r.height - 0.5) * 32);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      };
    });
    return () => offs.forEach((off) => off());
  }, []);

  useEffect(() => {
    if (!active) return;
    lockScroll(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section className="section" id="experiencia" data-section>
      <div className="exp-head">
        <h2 className="display" data-reveal="lines">
          Experiencia destacada
        </h2>
        <span className="small-tag" data-reveal="up">
          (2010 – 2026)
        </span>
      </div>
      <div className="hr" style={{ marginTop: "1.5rem" }} data-reveal="draw" />

      <div className="exp-grid" ref={grid}>
        {experience.map((exp, i) => (
          <button
            key={exp.id}
            type="button"
            className="exp-card"
            data-cursor="VER"
            onClick={() => setActive(exp)}
            aria-label={`Ver experiencia en ${exp.org}`}
          >
            <div className="exp-card__media" data-reveal="clip" data-delay={(i % 2) * 0.1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="exp-card__bg" src={exp.image} alt="" loading="lazy" />
              <div className="exp-card__inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="exp-card__img" src={exp.image} alt="" loading="lazy" />
              </div>
            </div>
            <div className="exp-card__meta">
              <span className="tag">{exp.org}</span>
              <span className="exp-card__more">
                <Roll>Ver detalle</Roll>
              </span>
            </div>
            <div className="exp-card__sub">
              {exp.tag} · {exp.meta} · {exp.period}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center" }}>
        <Pill href="#sobre-mi">Ver trayectoria completa</Pill>
      </div>

      <div className={`drawer ${active ? "is-open" : ""}`} aria-hidden={!active}>
        <div className="drawer__overlay" onClick={() => setActive(null)} />
        <aside
          className="drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label={active ? active.org : "Detalle"}
          data-lenis-prevent
        >
          <div className="drawer__close">
            <button
              ref={closeBtn}
              type="button"
              className="pill pill--ghost"
              onClick={() => setActive(null)}
              tabIndex={active ? 0 : -1}
            >
              Cerrar ✕
            </button>
          </div>
          {active && (
            <>
              <div className="drawer__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active.image} alt="" />
              </div>
              <span className="small-tag">
                {active.tag} · {active.period}
              </span>
              <h3>{active.org}</h3>
              {active.roles.map((role) => (
                <div key={role.title} className="drawer__role">
                  <h4>{role.title}</h4>
                  <div className="small-tag">{role.period}</div>
                  <ul>
                    {role.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
