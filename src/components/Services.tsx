"use client";

import { useEffect, useRef } from "react";
import { services, contactHref } from "@/content/site";
import { Pill } from "@/components/ui/Pill";

const CODE = "KPI 98% · SLA 24H · FLUJO → AUTO · DATA ✓ · 011 1000 · IA · ETL → TABLERO · OK";
const GLYPHS = "!@#$%&*<>/{}[]0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROWS = 16;

function Art({ id }: { id: string }) {
  switch (id) {
    case "consultoria":
      return (
        <div className="svc__art">
          <div className="art-card" style={{ left: "10%", top: "16%", width: "62%", ["--r" as string]: "-6deg" }}>
            Cronograma
            <div className="art-bars">
              <i style={{ width: "70%" }} />
              <i style={{ width: "45%", marginLeft: "30%", background: "var(--wine)" }} />
              <i style={{ width: "55%", marginLeft: "15%", background: "var(--navy)" }} />
            </div>
          </div>
          <div className="art-card" style={{ right: "8%", top: "60%", width: "46%", ["--r" as string]: "5deg" }}>
            Avance vs. plan
            <b>87%</b>
          </div>
          <div className="art-card" style={{ left: "8%", bottom: "8%", width: "50%", ["--r" as string]: "-3deg" }}>
            ✓ Hito: tablero de control
          </div>
        </div>
      );
    case "desarrollo":
      return (
        <div className="svc__art">
          <div className="mockups">
            <div className="mockup"><i /></div>
            <div className="mockup"><i /></div>
            <div className="mockup"><i /></div>
          </div>
        </div>
      );
    case "transformacion":
      return (
        <div className="svc__art">
          <div className="code-rows mono">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i}>{CODE}</div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="svc__art">
          <div className="courses">
            {[
              ["Campus virtual", "72%"],
              ["Universidad corporativa", "88%"],
              ["Certificación", "54%"],
            ].map(([t, p]) => (
              <div key={t} className="course" style={{ ["--p" as string]: p }}>
                {t}
                <div className="bar">
                  <i />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export function Services() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    const panels = [...root.querySelectorAll<HTMLElement>(".svc")];

    // Scramble del panel 03: caracteres aleatorios a 20 fps durante 350 ms
    const rows = root.querySelectorAll<HTMLElement>(".code-rows div");
    let timer = 0;
    const scramble = () => {
      if (timer) return;
      let elapsed = 0;
      timer = window.setInterval(() => {
        elapsed += 50;
        rows.forEach((row) => {
          row.textContent = [...CODE].map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
        });
        if (elapsed >= 350) {
          clearInterval(timer);
          timer = 0;
          rows.forEach((row) => (row.textContent = CODE));
        }
      }, 50);
    };
    const codePanel = root.querySelector<HTMLElement>('[data-id="transformacion"]');
    codePanel?.addEventListener("pointerenter", scramble);
    codePanel?.addEventListener("pointerleave", scramble);

    // Sin hover (táctil o pantalla chica): el panel activo es el que está en pantalla
    const noHover = window.matchMedia("(hover: none), (max-width: 767px)").matches;
    let io: IntersectionObserver | undefined;
    if (noHover) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target as HTMLElement;
            if (entry.intersectionRatio >= 0.6 && !el.classList.contains("is-active")) {
              panels.forEach((p) => p.classList.toggle("is-active", p === el));
              root.classList.add("has-active");
              if (el === codePanel) scramble();
            } else if (entry.intersectionRatio < 0.35 && el.classList.contains("is-active")) {
              el.classList.remove("is-active");
              if (!panels.some((p) => p.classList.contains("is-active"))) root.classList.remove("has-active");
            }
          });
        },
        { threshold: [0, 0.35, 0.6] },
      );
      panels.forEach((p) => io!.observe(p));
    }

    return () => {
      clearInterval(timer);
      io?.disconnect();
      codePanel?.removeEventListener("pointerenter", scramble);
      codePanel?.removeEventListener("pointerleave", scramble);
    };
  }, []);

  return (
    <section id="servicios" data-section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)" }}>
      <div className="svc-head">
        <h2 className="display" data-reveal="lines">
          Cómo puedo ayudarte
        </h2>
        <span className="svc-count" data-reveal="up">
          (04)
        </span>
      </div>
      <div className="svc-grid" ref={grid} data-nav="light">
        {services.map((s) => (
          <article key={s.id} className="svc" data-id={s.id} tabIndex={0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="svc__img" src={s.image} alt="" loading="lazy" />
            <div className="svc__dim" />
            <Art id={s.id} />
            <span className="svc__num tag">{s.num}</span>
            <h3 className="svc__title">{s.title}</h3>
            <div className="svc__details">
              <h3 aria-hidden="true">{s.title}</h3>
              <ul>
                {s.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <Pill href={contactHref(s.message)} variant="light" cursor="ESCRÍBEME">
                {s.cta}
              </Pill>
              {s.note ? <p className="svc__note">{s.note}</p> : <span />}
            </div>
            <div className="svc__shade" />
          </article>
        ))}
      </div>
    </section>
  );
}
