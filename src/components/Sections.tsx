import {
  site,
  stats,
  steps,
  skills,
  experience,
  organizations,
  education,
  tools,
  competencies,
  contactHref,
} from "@/content/site";
import { Pill } from "@/components/ui/Pill";

export function Intro() {
  return (
    <section className="section intro" id="sobre" aria-label="Presentación">
      <span className="small-tag" data-reveal="up">
        (Sobre mí)
      </span>
      <p className="intro__text" data-scrub-words>
        Soy Ana Aguirre. Conecto la estrategia de negocio con soluciones operativas y tecnológicas{" "}
        <span className="serif">que sí se ejecutan.</span>
      </p>
      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat" data-reveal="up">
            <div className="stat__num" data-count={s.value} data-prefix={s.prefix}>
              {s.prefix}
              {s.value.toLocaleString("es-MX")}
            </div>
            <p className="stat__label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="section" id="proceso" aria-labelledby="proceso-title">
      <h2 className="display" id="proceso-title" data-reveal="lines">
        Cómo <span className="serif">trabajo</span>
      </h2>
      <div className="process">
        <div className="process__track" />
        <div className="process__line" />
        {steps.map((p, i) => (
          <div key={p.title} className="step">
            <div className="step__num">0{i + 1}</div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// depth "far": más chica, desenfocada y lenta; "near": más grande, nítida y rápida
const NOISE = [
  { src: "notes", left: "4%", top: "8%", w: 19, depth: "near", speed: 80 },
  { src: "inbox", left: "70%", top: "5%", w: 22, depth: "near", speed: 60 },
  { src: "chat", left: "36%", top: "3%", w: 15, depth: "far", speed: 35 },
  { src: "cal", left: "13%", top: "62%", w: 14, depth: "far", speed: 25 },
  { src: "sheet", left: "58%", top: "66%", w: 16, depth: "far", speed: 30 },
  { src: "todo", left: "79%", top: "62%", w: 18, depth: "near", speed: 90 },
];

export function Noise() {
  return (
    <section className="noise" aria-label="De los pendientes a los resultados">
      <div className="noise__stage">
        {NOISE.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={n.src}
            className="noise__img"
            src={`/img/noise-${n.src}.webp`}
            alt=""
            loading="lazy"
            data-speed={n.speed}
            data-depth={n.depth}
            style={{ left: n.left, top: n.top, ["--w" as string]: `${n.w}vw` }}
          />
        ))}
        <div className="noise__text">
          <h2 className="display" data-reveal="lines">
            En un mundo lleno de
            <br />
            pendientes
          </h2>
        </div>
        <div className="noise__mask">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/hero-b.webp" alt="" loading="lazy" />
          <div className="noise__reveal">
            <h2 className="display">
              <span className="rv" style={{ display: "block" }}>
                Convierte la estrategia
              </span>
              <span className="rv serif" style={{ display: "block" }}>
                en resultados
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  const roles = experience.flatMap((e) => e.roles.map((r) => ({ ...r, org: e.org })));
  return (
    <section className="section" id="sobre-mi" data-section>
      <div className="about">
        <div className="about__photo" data-reveal="clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/ana-retrato.webp" alt="Retrato de Ana Margarita Aguirre Quintanar" loading="lazy" />
        </div>
        <div>
          <span className="small-tag" data-reveal="up">
            (Sobre mí)
          </span>
          <h2 className="display" style={{ marginTop: "0.75rem" }} data-reveal="lines">
            Ana <span className="serif">Aguirre</span>
          </h2>
          <div className="about__bio">
            <p data-reveal="up">
              Soy <strong>{site.fullName}</strong>, profesional en Pedagogía con Maestría en Dirección de Negocios y más
              de 15 años de trayectoria en gestión de proyectos, operaciones y soluciones de educación digital. He
              coordinado iniciativas multidisciplinarias, proyectos corporativos, procesos de implementación y equipos
              de trabajo en organizaciones corporativas, educativas y públicas, conectando necesidades estratégicas con
              la ejecución operativa.
            </p>
            <p data-reveal="up">
              Hoy pongo esa experiencia al servicio de organizaciones que buscan estructurar, modernizar o impulsar sus
              proyectos, mediante un enfoque de consultoría que integra estrategia, gestión y colaboración tecnológica
              especializada.
            </p>
          </div>
          <div className="skills" data-reveal="up">
            {skills.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>

          <div className="timeline">
            <span className="small-tag">Trayectoria</span>
            {roles.map((r) => (
              <div key={r.title} className="timeline__row" data-reveal="up">
                <span className="timeline__role">{r.title}</span>
                <span className="timeline__period">{r.period}</span>
                <span className="timeline__org">{r.org}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {site.contact.linkedin && (
              <Pill href={site.contact.linkedin} cursor="LINKEDIN">
                Ver perfil en LinkedIn
              </Pill>
            )}
            <Pill href={contactHref()} variant="ghost" cursor="ESCRÍBEME">
              Platiquemos
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Organizations() {
  const row1 = [...organizations.corporate, ...organizations.education];
  const row2 = organizations.public;
  const track = (items: string[]) => [...items, ...items, ...items, ...items];
  return (
    <section className="orgs" data-nav="light" aria-labelledby="orgs-title">
      <div className="orgs__head">
        <h2 className="display" id="orgs-title" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }} data-reveal="lines">
          Organizaciones con las que <span className="serif">he colaborado</span>
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
      <p className="orgs__note">Proyectos realizados como parte de los equipos de Academia Global, Universidad Insurgentes, Espacios en Red y Servicios y LUTAN.</p>
    </section>
  );
}

export function Education() {
  return (
    <section className="section" id="formacion" aria-labelledby="formacion-title">
      <h2 className="display" id="formacion-title" data-reveal="lines">
        Formación
      </h2>
      <div style={{ marginTop: "2rem" }}>
        <div className="hr" data-reveal="draw" />
        {education.map((e, i) => (
          <div key={e.title} className="edu-row">
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
          <span className="small-tag">Herramientas</span>
          <div className="skills" style={{ marginTop: "0.75rem" }}>
            {tools.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div data-reveal="up">
          <span className="small-tag">Otras competencias</span>
          <div className="skills" style={{ marginTop: "0.75rem" }}>
            {competencies.map((t) => (
              <span key={t} className="chip">
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
  if (!site.contact.whatsapp) return null;
  return (
    <a className="wa" href={contactHref()} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.4.1.1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3z" />
      </svg>
    </a>
  );
}
