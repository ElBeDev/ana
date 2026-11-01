"use client";

import { useState } from "react";
import { FieldLabel, type Field } from "@puckeditor/core";
import { MediaField } from "./MediaField";

// Atajos para declarar campos de Puck con etiquetas en español.

export const text = (label: string): Field => ({ type: "text", label });

export const area = (label: string): Field => ({ type: "textarea", label });

export const num = (label: string, min?: number, max?: number): Field => ({ type: "number", label, min, max });

export const yesNo = (label: string): Field => ({
  type: "radio",
  label,
  options: [
    { label: "Sí", value: true },
    { label: "No", value: false },
  ],
});

export const image = (label: string): Field => ({
  type: "custom",
  label,
  render: ({ value, onChange, readOnly, field }) => (
    <FieldLabel label={field.label ?? label} el="div" readOnly={readOnly}>
      <MediaField value={value ?? ""} onChange={onChange} readOnly={readOnly} />
    </FieldLabel>
  ),
});

/** Lista de textos cortos: uno por línea. Se guarda como string[]. */
export const lines = (label: string): Field => ({
  type: "custom",
  label,
  render: ({ value, onChange, readOnly, field, id }) => (
    <FieldLabel label={`${field.label ?? label} · uno por línea`} el="div" readOnly={readOnly}>
      <LinesInput id={id} value={value ?? []} onChange={onChange} readOnly={readOnly} />
    </FieldLabel>
  ),
});

function LinesInput({
  id,
  value,
  onChange,
  readOnly,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  readOnly?: boolean;
}) {
  const joined = value.join("\n");
  const [draft, setDraft] = useState(joined);
  const [synced, setSynced] = useState(joined);
  const [focused, setFocused] = useState(false);

  // Si el valor cambia desde fuera (deshacer, restaurar) se refleja aquí. Mientras se escribe no:
  // el valor de Puck llega con retraso y movería el cursor.
  if (joined !== synced && !focused) {
    setSynced(joined);
    if (toLines(draft).join("\n") !== joined) setDraft(joined);
  }

  return (
    <textarea
      id={id}
      className="ed-lines"
      value={draft}
      readOnly={readOnly}
      rows={Math.min(Math.max(value.length + 1, 3), 12)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setDraft(toLines(draft).join("\n"));
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(toLines(e.target.value));
      }}
    />
  );
}

function toLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
