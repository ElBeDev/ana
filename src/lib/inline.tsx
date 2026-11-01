import { Fragment } from "react";

// Formato mínimo para textos editables: **negrita** y *acento serif*.
// Se convierte a elementos de React; nunca se inserta HTML.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return (
            <span key={i} className="serif">
              {part.slice(1, -1)}
            </span>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Respeta los saltos de línea como <br />. */
export function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <Inline text={line} />
        </Fragment>
      ))}
    </>
  );
}

/** Párrafos separados por una línea en blanco. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Texto plano (para alt, metadata, etc.). */
export function plain(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}
