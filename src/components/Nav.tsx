"use client";

import { useEffect, useRef, useState } from "react";
import { site, contactHref } from "@/content/site";
import { lockScroll } from "@/lib/motion";
import { Pill, Roll } from "@/components/ui/Pill";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#experiencia", label: "Experiencia" },
  { href: "#servicios", label: "Servicios" },
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#contacto", label: "Contacto" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    // No tocar el scroll en el montaje: el loader puede tenerlo bloqueado.
    if (!touched.current) {
      touched.current = true;
      return;
    }
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const { whatsapp, email, linkedin } = site.contact;

  return (
    <>
      <header className="nav" data-theme="light" data-hero="nav">
        <a href="#inicio" className="logo" aria-label="Ana Aguirre, inicio">
          <b>ANA</b>
          <span className="serif">Aguirre</span>
        </a>
        <nav className="nav__pills" aria-label="Principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-pill">
              <span>{l.label}</span>
            </a>
          ))}
          <Pill href={contactHref()} className="nav__cta" cursor="ESCRÍBEME">
            Agendar llamada
          </Pill>
        </nav>
        <button
          type="button"
          className="burger"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div id="menu" className={`menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="menu__inner">
          <nav className="menu__links" aria-label="Menú móvil">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="menu__cols">
            <div>
              <div className="small-tag">Contacto</div>
              {whatsapp && (
                <a href={contactHref()} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                  <Roll>WhatsApp</Roll>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} tabIndex={open ? 0 : -1}>
                  <Roll>{email}</Roll>
                </a>
              )}
              {!whatsapp && !email && (
                <a href="#contacto" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                  <Roll>Escríbeme</Roll>
                </a>
              )}
            </div>
            <div>
              <div className="small-tag">Social</div>
              {linkedin ? (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                  <Roll>LinkedIn</Roll>
                </a>
              ) : (
                <span style={{ display: "block", marginTop: "0.5rem", opacity: 0.6 }}>{site.role}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
