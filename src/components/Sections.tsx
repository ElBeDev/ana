"use client";

import type {
  AboutProps,
  EducationProps,
  IntroProps,
  NoiseProps,
  OrganizationsProps,
  ProcessProps,
} from "@/blocks/types";
import { useBlock, useContactHref, useSettings } from "@/blocks/context";
import { Inline, Lines, paragraphs } from "@/lib/inline";
import { Pill } from "@/components/ui/Pill";

export function Intro(props: IntroProps) {
  return (
    <section className="section intro" id="sobre" aria-label="Presentación">
      <span className="small-tag" data-reveal="up">
        {props.label}
      </span>
      <p className="intro__text" data-scrub-words>
        <Inline text={props.text} />
      </p>
      {props.statsTitle && (
        <h2 className="stats__title" data-reveal="up">
          {props.statsTitle}
        </h2>
      )}
      <div className="stats">
        {props.stats.map((s, i) => (
          <div key={i} className="stat" data-reveal="up">
            <div className="stat__num" data-count={s.value} data-prefix={s.prefix} data-suffix={s.suffix}>
              {s.prefix}
              {s.value.toLocaleString("es-MX")}
              {s.suffix}
            </div>
            <p className="stat__label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Process(props: ProcessProps) {
  return (
    <section className="section" id="proceso" aria-labelledby="proceso-title">
      <h2 className="display" id="proceso-title" data-reveal="lines">
        <Inline text={props.title} />
      </h2>
      {props.lead && (
        <p className="process__lead" data-reveal="up">
          {props.lead}
        </p>
      )}
      <div className="process">
        <div className="process__track" />
        <div className="process__line" />
        {props.steps.map((p, i) => (
          <div key={i} className="step">
            <div className="step__num">0{i + 1}</div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Posición de cada imagen del ruido (las imágenes se editan en el panel; el acomodo es diseño).
// depth "far": más chica, desenfocada y lenta; "near": más grande, nítida y rápida
const NOISE = [
  { left: "4%", top: "8%", w: 19, depth: "near", speed: 80 },
  { left: "70%", top: "5%", w: 22, depth: "near", speed: 60 },
  { left: "36%", top: "3%", w: 15, depth: "far", speed: 35 },
  { left: "13%", top: "62%", w: 14, depth: "far", speed: 25 },
  { left: "58%", top: "66%", w: 16, depth: "far", speed: 30 },
  { left: "79%", top: "62%", w: 18, depth: "near", speed: 90 },
];

export function Noise(props: NoiseProps) {
  return (
    <section className="noise" aria-label="De los pendientes a los resultados">
      <div className="noise__stage">
        {NOISE.map((n, i) =>
          props.images[i]?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            className="noise__img"
            src={props.images[i].src}
            alt=""
            loading="lazy"
            data-speed={n.speed}
            data-depth={n.depth}
            style={{ left: n.left, top: n.top, ["--w" as string]: `${n.w}vw` }}
          />
          ) : null,
        )}
        <div className="noise__text">
          <h2 className="display" data-reveal="lines">
            <Lines text={props.text} />
          </h2>
        </div>
        <div className="noise__mask">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.revealImage} alt="" loading="lazy" />
          <div className="noise__reveal">
            <h2 className="display">
              <span className="rv" style={{ display: "block" }}>
                {props.revealSans}
              </span>
              <span className="rv serif" style={{ display: "block" }}>
                {props.revealSerif}
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About(props: AboutProps) {
  const { contact } = useSettings();
  const contactHref = useContactHref();
  const experience = useBlock("Experience")?.items ?? [];
  const roles = experience.flatMap((e) => e.roles.map((r) => ({ ...r, org: e.org })));
  return (
    <section className="section" id="sobre-mi" data-section>
      <div className="about">
        <div className="about__photo" data-reveal="clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.photo} alt={props.alt} loading="lazy" />
        </div>
        <div>
          <span className="small-tag" data-reveal="up">
            {props.label}
          </span>
          <h2 className="display" style={{ marginTop: "0.75rem" }} data-reveal="lines">
            {props.titleSans} <span className="serif">{props.titleSerif}</span>
          </h2>
          <div className="about__bio">
            {paragraphs(props.bio).map((p, i) => (
              <p key={i} data-reveal="up">
                <Inline text={p} />
              </p>
            ))}
          </div>
          <div className="skills" data-reveal="up">
            {props.skills.map((s, i) => (
              <span key={i} className="chip">
                {s}
              </span>
            ))}
          </div>

          <div className="timeline">
            <span className="small-tag">{props.timelineLabel}</span>
            {roles.map((r, i) => (
              <div key={i} className="timeline__row" data-reveal="up">
                <span className="timeline__role">{r.title}</span>
                <span className="timeline__period">{r.period}</span>
                <span className="timeline__org">{r.org}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {contact.linkedin && (
              <Pill href={contact.linkedin} cursor="LINKEDIN">
                {props.linkedinLabel}
              </Pill>
            )}
            <Pill href={contactHref()} variant="ghost" cursor="ESCRÍBEME">
              {props.cta}
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Organizations(props: OrganizationsProps) {
  const { row1, row2 } = props;
  const track = (items: string[]) => [...items, ...items, ...items, ...items];
  return (
    <section className="orgs" data-nav="light" aria-labelledby="orgs-title">
      <div className="orgs__head">
        <h2 className="display" id="orgs-title" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }} data-reveal="lines">
          <Inline text={props.title} />
        </h2>
      </div>
      <div className="marquee" data-dir="1" aria-hidden="true">
        {track(row1).map((o, i) => (
          <span key={i}>{o}</span>
        ))}
      </div>
      <div className="marquee" data-dir="-1" aria-hidden="true">
        {track(row2).map((o, i) => (
          <span key={i}>{o}</span>
        ))}
      </div>
      <p className="sr-only">{[...row1, ...row2].join(", ")}</p>
      <p className="orgs__note">{props.note}</p>
    </section>
  );
}

export function Education(props: EducationProps) {
  return (
    <section className="section" id="formacion" aria-labelledby="formacion-title">
      <h2 className="display" id="formacion-title" data-reveal="lines">
        {props.title}
      </h2>
      <div style={{ marginTop: "2rem" }}>
        <div className="hr" data-reveal="draw" />
        {props.rows.map((e, i) => (
          <div key={i} className="edu-row">
            <span className="edu-row__title" data-reveal="up">
              {e.title}
            </span>
            <span className="edu-row__org" data-reveal="up">
              {e.org}
            </span>
            <span className="edu-row__year" data-reveal="up">
              {e.year}
            </span>
            <div className="hr" data-reveal="draw" data-delay={i * 0.1} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: "3rem", display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
        <div data-reveal="up">
          <span className="small-tag">{props.toolsLabel}</span>
          <div className="skills" style={{ marginTop: "0.75rem" }}>
            {props.tools.map((t, i) => (
              <span key={i} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div data-reveal="up">
          <span className="small-tag">{props.competenciesLabel}</span>
          <div className="skills" style={{ marginTop: "0.75rem" }}>
            {props.competencies.map((t, i) => (
              <span key={i} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhatsAppFloat() {
  const { contact, whatsappFloat } = useSettings();
  const contactHref = useContactHref();
  if (!contact.whatsapp || !whatsappFloat) return null;
  return (
    <a className="wa" href={contactHref()} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.4.1.1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3z" />
      </svg>
    </a>
  );
}
