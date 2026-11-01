"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import type { ContactProps } from "@/blocks/types";
import { useContactHref, useSettings } from "@/blocks/context";
import { Inline } from "@/lib/inline";
import { gsap } from "@/lib/motion";
import { Pill, Roll } from "@/components/ui/Pill";

function CdmxTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("es-MX", { timeZone: site.timezone, hour: "2-digit", minute: "2-digit", hour12: true });
    const update = () => setTime(f.format(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return <span>CDMX {time}</span>;
}

export function Contact(props: ContactProps) {
  const mask = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLDivElement>(null);
  const { identity, contact } = useSettings();
  const contactHref = useContactHref();
  const cycleKey = props.cycle.map((c) => c.src).join("|");

  // Imagen enmascarada: en reposo en B/N; en hover del botón cicla imágenes a color cada 600 ms
  useEffect(() => {
    const root = mask.current;
    const trigger = btn.current;
    if (!root || !trigger) return;
    const imgs = [...root.querySelectorAll<HTMLImageElement>("img")];
    const base = imgs[0];
    const colored = imgs.slice(1);
    let i = 0;
    let loop = 0;
    const show = (img: HTMLImageElement) => {
      imgs.forEach((el) => el.classList.toggle("is-active", el === img));
      gsap.fromTo(img, { scale: 1.05 }, { scale: 1, duration: 0.25, ease: "power2.out" });
    };
    const enter = () => {
      clearInterval(loop);
      show(colored[i]);
      loop = window.setInterval(() => {
        i = (i + 1) % colored.length;
        show(colored[i]);
      }, 600);
    };
    const leave = () => {
      clearInterval(loop);
      show(base);
    };
    trigger.addEventListener("pointerenter", enter);
    trigger.addEventListener("pointerleave", leave);
    return () => {
      clearInterval(loop);
      trigger.removeEventListener("pointerenter", enter);
      trigger.removeEventListener("pointerleave", leave);
    };
  }, [cycleKey]);

  const { whatsapp, email, linkedin } = contact;

  return (
    <footer className="contact" id="contacto" data-section>
      <div className="contact__center">
        <div className="contact__mask" ref={mask} data-reveal="up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.image} alt="" className="is-active is-bw" loading="lazy" />
          {props.cycle.map(({ src }, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading="lazy" />
          ))}
        </div>
        <p className="contact__lead" data-reveal="up">
          <Inline text={props.lead} />
        </p>
        <div ref={btn} data-reveal="up">
          <Pill href={contactHref()} cursor="ESCRÍBEME">
            {props.button}
          </Pill>
        </div>
      </div>

      <div className="footer-links">
        <div className="footer-links__row">
          {linkedin ? (
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              <Roll>LinkedIn</Roll>
            </a>
          ) : (
            <span>{identity.role}</span>
          )}
          {whatsapp && (
            <a href={contactHref()} target="_blank" rel="noopener noreferrer">
              <Roll>WhatsApp</Roll>
            </a>
          )}
          <span>{identity.descriptor}</span>
        </div>
        <div className="footer-links__row">
          {email ? (
            <a href={`mailto:${email}`}>
              <Roll>{email}</Roll>
            </a>
          ) : (
            <a href="#inicio">
              <Roll>Volver arriba</Roll>
            </a>
          )}
          <span className="muted">{props.copyright}</span>
          <CdmxTime />
        </div>
      </div>

      <div className="bigname" data-reveal="chars" aria-hidden="true">
        <b>
          {[...props.bigSans].map((c, i) => (
            <span key={i} className="ch">
              {c}
            </span>
          ))}
        </b>
        <span className="serif">
          {[...props.bigSerif].map((c, i) => (
            <span key={i} className="ch">
              {c}
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}
