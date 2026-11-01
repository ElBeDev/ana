"use client";

import { useEffect, useRef, useState } from "react";
import { useContactHref, useSettings } from "@/blocks/context";
import { lockScroll } from "@/lib/motion";
import { Pill, Roll } from "@/components/ui/Pill";

export function Nav() {
  const [open, setOpen] = useState(false);
  const { identity, contact, nav } = useSettings();
  const contactHref = useContactHref();
  const LINKS = nav.links;
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

  const { whatsapp, email, linkedin } = contact;

  return (
    <>
      <header className="nav" data-theme="light" data-hero="nav">
        <a href="#inicio" className="logo" aria-label="Ana Aguirre, inicio">
          <b>ANA</b>
          <span className="serif">Aguirre</span>
        </a>
        <nav className="nav__pills" aria-label="Principal">
          {LINKS.map((l, i) => (
            <a key={i} href={l.href} className="nav-pill">
              <span>{l.label}</span>
            </a>
          ))}
          <Pill href={contactHref()} className="nav__cta" cursor="ESCRÍBEME">
            {nav.cta}
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
            {LINKS.map((l, i) => (
              <a key={i} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
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
                <span style={{ display: "block", marginTop: "0.5rem", opacity: 0.6 }}>{identity.role}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
