"use client";

import { createContext, use, useEffect, useRef, useState, useTransition } from "react";
import { deleteMediaAction, listMediaAction, updateAltAction } from "@/app/admin/media-actions";
import type { MediaItem } from "@/lib/media";
import { uploadImage } from "./upload";

/** Si hay Vercel Blob configurado (lo decide el servidor). */
export const BlobContext = createContext(false);

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaLibrary({
  mode,
  initial,
  selected,
  onSelect,
}: {
  mode: "page" | "picker";
  initial?: MediaItem[];
  selected?: string;
  onSelect?: (url: string) => void;
}) {
  const blobEnabled = use(BlobContext);
  const [items, setItems] = useState<MediaItem[] | null>(initial ?? null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) return;
    listMediaAction().then((r) => (r.ok ? setItems(r.data) : setMessage({ text: r.error, error: true })));
  }, [initial]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    const added: MediaItem[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      try {
        added.push(await uploadImage(file, blobEnabled));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `${file.name}: no se pudo subir`);
      }
    }
    setItems((current) => [...added, ...(current ?? [])]);
    setUploading(false);
    if (input.current) input.current.value = "";
    if (errors.length) setMessage({ text: errors.join(" · "), error: true });
    else setMessage({ text: added.length === 1 ? "Imagen subida" : `${added.length} imágenes subidas` });
    if (mode === "picker" && added.length === 1 && !errors.length) onSelect?.(added[0].url);
  };

  const remove = (item: MediaItem) => {
    if (!confirm(`¿Quitar “${item.filename}” de la biblioteca?`)) return;
    startTransition(async () => {
      const r = await deleteMediaAction(item.id);
      if (r.ok) {
        setItems((current) => current?.filter((i) => i.id !== item.id) ?? null);
        setMessage({ text: "Imagen quitada" });
      } else setMessage({ text: r.error, error: true });
    });
  };

  const saveAlt = (item: MediaItem, alt: string) => {
    if (alt === item.alt) return;
    startTransition(async () => {
      const r = await updateAltAction(item.id, alt);
      if (r.ok) setItems((current) => current?.map((i) => (i.id === item.id ? { ...i, alt } : i)) ?? null);
      else setMessage({ text: r.error, error: true });
    });
  };

  const visible = (items ?? []).filter((i) =>
    `${i.filename} ${i.alt}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="ml">
      <div className="ml__bar">
        <input type="search" placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className="adm-btn adm-btn--primary" disabled={uploading} onClick={() => input.current?.click()}>
          {uploading ? "Subiendo…" : "Subir imágenes"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={mode === "page"}
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
      {message && <p className={message.error ? "adm-error" : "adm-ok"}>{message.text}</p>}
      {!blobEnabled && (
        <p className="adm-muted ml__note">Modo local: las imágenes se guardan en public/uploads (en producción van a Vercel Blob).</p>
      )}
      {items === null ? (
        <p className="adm-muted">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="adm-muted">No hay imágenes.</p>
      ) : (
        <ul className="ml__grid">
          {visible.map((item) => (
            <li key={item.id} className={`ml__item ${selected === item.url ? "is-selected" : ""}`}>
              {mode === "picker" ? (
                <button type="button" className="ml__thumb" onClick={() => onSelect?.(item.url)} title={item.filename}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.alt} loading="lazy" />
                </button>
              ) : (
                <a className="ml__thumb" href={item.url} target="_blank" rel="noopener noreferrer" title="Ver original">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.alt} loading="lazy" />
                </a>
              )}
              <div className="ml__meta">
                <span className="ml__name" title={item.filename}>
                  {item.filename}
                </span>
                <span className="adm-muted">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {kb(item.size)}
                </span>
                {mode === "page" && (
                  <>
                    <input
                      type="text"
                      defaultValue={item.alt}
                      placeholder="Descripción (alt)"
                      aria-label={`Descripción de ${item.filename}`}
                      onBlur={(e) => saveAlt(item, e.target.value)}
                    />
                    <div className="ml__actions">
                      <button
                        type="button"
                        className="adm-link"
                        onClick={() => navigator.clipboard?.writeText(item.url).then(() => setMessage({ text: "URL copiada" }))}
                      >
                        Copiar URL
                      </button>
                      <button type="button" className="adm-link adm-btn--danger" onClick={() => remove(item)}>
                        Quitar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
