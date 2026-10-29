type PillProps = {
  href: string;
  children: string;
  variant?: "dark" | "light" | "ghost";
  className?: string;
  cursor?: string;
};

/** Botón pill con relleno circular y letras alternas en hover. */
export function Pill({ href, children, variant = "dark", className = "", cursor }: PillProps) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const variantClass = variant === "light" ? "pill--light" : variant === "ghost" ? "pill--ghost" : "";
  return (
    <a
      href={href}
      className={`pill ${variantClass} ${className}`}
      data-cursor={cursor}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Chars text={children} />
    </a>
  );
}

export function Chars({ text }: { text: string }) {
  const letters = [...text];
  return (
    <span className="chars">
      <span className="sr-only">{text}</span>
      <span className="chars__a" aria-hidden="true">
        {letters.map((c, i) => (
          <i key={i}>{c}</i>
        ))}
      </span>
      <span className="chars__b" aria-hidden="true">
        {letters.map((c, i) => (
          <i key={i}>{c}</i>
        ))}
      </span>
    </span>
  );
}

/** Texto que "rueda" en hover: sube y entra una copia desde abajo. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
