"use client";

import { useEffect, useRef } from "react";
import type { ServiceArt, ServicesProps } from "@/blocks/types";
import { useContactHref } from "@/blocks/context";
import { Pill } from "@/components/ui/Pill";

const GLYPHS = "!@#$%&*<>/{}[]0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROWS = 16;

function Art({ art, props }: { art: ServiceArt; props: ServicesProps }) {
  switch (art) {
    case "cronograma":
      return (
        <div className="svc__art">
          <div className="art-card" style={{ left: "10%", top: "16%", width: "62%", ["--r" as string]: "-6deg" }}>
            {props.artPlan.title}
            <div className="art-bars">
              <i style={{ width: "70%" }} />
              <i style={{ width: "45%", marginLeft: "30%", background: "var(--wine)" }} />
              <i style={{ width: "55%", marginLeft: "15%", background: "var(--navy)" }} />
            </div>
          </div>
          <div className="art-card" style={{ right: "8%", top: "70%", width: "46%", ["--r" as string]: "5deg" }}>
            {props.artPlan.kpiLabel}
            <b>{props.artPlan.kpiValue}</b>
          </div>
          <div className="art-card" style={{ left: "8%", bottom: "5%", width: "50%", ["--r" as string]: "-3deg" }}>
            {props.artPlan.milestone}
          </div>
        </div>
      );
    case "mockups":
      return (
        <div className="svc__art">
          <div className="mockups">
            <div className="mockup"><i /></div>
            <div className="mockup"><i /></div>
          </div>
        </div>
      );
    case "codigo":
      return (
        <div className="svc__art">
          <div className="code-rows mono">
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i}>{props.artCode}</div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="svc__art">
          <div className="courses">
            {props.artCourses.map(({ label, pct }, i) => (
              <div key={i} className="course" style={{ ["--p" as string]: `${pct}%` }}>
                {label}
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

export function Services(props: ServicesProps) {
  const grid = useRef<HTMLDivElement>(null);
  const contactHref = useContactHref();
  const code = props.artCode;

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
          row.textContent = [...code].map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
        });
        if (elapsed >= 350) {
          clearInterval(timer);
          timer = 0;
          rows.forEach((row) => (row.textContent = code));
        }
      }, 50);
    };
    const codePanel = root.querySelector<HTMLElement>('[data-art="codigo"]');
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
  }, [code]);

  return (
    <section id="servicios" data-section style={{ paddingTop: "clamp(4rem, 8vw, 7rem)" }}>
      <div className="svc-head">
        <h2 className="display" data-reveal="lines">
          {props.title}
        </h2>
        <span className="svc-count" data-reveal="up">
          {props.count}
        </span>
      </div>
      <div className="svc-grid" ref={grid} data-nav="light">
        {props.items.map((s, i) => (
          <article key={i} className="svc" data-art={s.art} tabIndex={0}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="svc__img" src={s.image} alt="" loading="lazy" />
            <div className="svc__dim" />
            <Art art={s.art} props={props} />
            <span className="svc__num tag">{s.num}</span>
            <h3 className="svc__title">{s.title}</h3>
            <div className="svc__details">
              <h3 aria-hidden="true">{s.title}</h3>
              <ul>
                {s.details.map((d, j) => (
                  <li key={j}>{d}</li>
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
