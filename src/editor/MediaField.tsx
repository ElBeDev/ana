"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MediaLibrary } from "./MediaLibrary";

// Campo de imagen del editor: vista previa + elegir de la biblioteca (o subir) + URL manual.
export function MediaField({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ed-media">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="ed-media__thumb" />
      ) : (
        <div className="ed-media__thumb ed-media__thumb--empty">Sin imagen</div>
      )}
      {!readOnly && (
        <div className="ed-media__buttons">
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => setOpen(true)}>
            Cambiar imagen
          </button>
        </div>
      )}
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        aria-label="URL de la imagen"
        placeholder="/img/archivo.webp o https://…"
      />
      {open &&
        createPortal(
          <div className="adm ml-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de medios">
            <div className="ml-modal__backdrop" onClick={() => setOpen(false)} />
            <div className="ml-modal__panel">
              <div className="ml-modal__head">
                <h2>Elige una imagen</h2>
                <button type="button" className="adm-btn adm-btn--sm" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
              </div>
              <MediaLibrary
                mode="picker"
                selected={value}
                onSelect={(url) => {
                  onChange(url);
                  setOpen(false);
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
