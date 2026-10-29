"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

/** Cursor con blur que sigue al mouse con inercia, se estira con la velocidad y muestra texto contextual. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !isFinePointer()) return;
    const dot = el.querySelector<HTMLElement>(".cursor__dot")!;
    const text = el.querySelector<HTMLElement>(".cursor__text")!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let lx = 0, ly = 0;

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      const speed = Math.min(Math.hypot(dx, dy) / 60, 0.35);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (!el.classList.contains("has-text")) {
        gsap.to(dot, { rotate: angle, scaleX: 1 + speed, scaleY: 1 - speed * 0.6, duration: 0.3, overwrite: "auto" });
      }
      el.classList.remove("is-hidden");
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      const label = t?.dataset.cursor;
      if (label) {
        text.textContent = label;
        el.classList.add("has-text");
        gsap.to(dot, { rotate: 0, scaleX: 1, scaleY: 1, duration: 0.3, overwrite: "auto" });
      } else {
        el.classList.remove("has-text");
      }
    };
    const onLeave = () => el.classList.add("is-hidden");

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor is-hidden" ref={ref} aria-hidden="true">
      <div className="cursor__dot">
        <span className="cursor__text" />
      </div>
    </div>
  );
}
