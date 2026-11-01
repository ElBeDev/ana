"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Puck, useGetPuck, type Data, type Overrides } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { fontVariables } from "@/app/fonts";
import { publishAction, saveDraftAction, type ActionResult } from "@/app/admin/editor/actions";
import type { LandingData } from "@/blocks/types";
import { editorConfig } from "./config";
import { BlobContext } from "./MediaLibrary";
import "./editor.css";

const AUTOSAVE_MS = 30_000;

type Status = {
  dirty: boolean;
  busy: "save" | "publish" | null;
  message: string;
  error: boolean;
  unpublished: boolean;
};

type EditorApi = {
  status: Status;
  save: (data: Data) => Promise<boolean>;
  publish: (data: Data) => Promise<void>;
};

const EditorContext = createContext<EditorApi | null>(null);
const useEditor = () => use(EditorContext)!;

const time = (iso: string) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

function HeaderActions() {
  const { status, save, publish } = useEditor();
  const getPuck = useGetPuck();
  const data = () => getPuck().appState.data;

  const preview = async () => {
    // Abre la pestaña antes del await para que el navegador no la bloquee
    const tab = window.open("about:blank", "_blank");
    if (await save(data())) {
      if (tab) tab.location.href = "/admin/preview";
    } else tab?.close();
  };

  return (
    <div className="ed-actions">
      <span className={`ed-status ${status.error ? "is-error" : ""}`} aria-live="polite">
        {status.message}
      </span>
      <a href="/admin" className="adm-btn adm-btn--sm">
        Salir
      </a>
      <button type="button" className="adm-btn adm-btn--sm" disabled={!!status.busy} onClick={() => save(data())}>
        {status.busy === "save" ? "Guardando…" : "Guardar borrador"}
      </button>
      <button type="button" className="adm-btn adm-btn--sm" disabled={!!status.busy} onClick={preview}>
        Vista previa ↗
      </button>
      <button
        type="button"
        className="adm-btn adm-btn--sm adm-btn--primary"
        disabled={!!status.busy || (!status.dirty && !status.unpublished)}
        onClick={() => {
          if (confirm("¿Publicar los cambios? Se verán de inmediato en el sitio.")) publish(data());
        }}
      >
        {status.busy === "publish" ? "Publicando…" : "Publicar"}
      </button>
    </div>
  );
}

/**
 * El lienzo es un iframe: le pasamos las variables de fuente del sitio a su <html> y lo
 * ponemos en modo "reduced" para que todo se vea en su estado final (sin animaciones de entrada).
 */
function CanvasFrame({ children, document: doc }: { children: ReactNode; document?: Document }) {
  useEffect(() => {
    if (!doc) return;
    const html = doc.documentElement;
    const wanted = [...fontVariables.split(" "), "antialiased", "js", "reduced", "is-editing"];
    // Puck copia las clases del <html> del panel al iframe; se vuelven a poner las del lienzo
    const apply = () => {
      if (wanted.some((c) => !html.classList.contains(c))) html.classList.add(...wanted);
    };
    apply();
    html.setAttribute("lang", "es-MX");
    const observer = new MutationObserver(apply);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [doc]);
  return <>{children}</>;
}

function HelpPanel() {
  return (
    <div className="ed-help">
      <h3>Cómo editar</h3>
      <ul>
        <li>Haz clic en una sección del lienzo (o en <b>Estructura</b>) para ver sus campos a la derecha.</li>
        <li>Sin nada seleccionado, a la derecha aparecen los <b>Ajustes del sitio</b>: contacto, menú, SEO.</li>
        <li>
          Formato en textos largos: <code>**negrita**</code> y <code>*acento serif*</code>.
        </li>
        <li>
          <b>Guardar borrador</b> no cambia el sitio. <b>Vista previa</b> lo muestra solo a ti.{" "}
          <b>Publicar</b> lo pone en línea.
        </li>
        <li>El orden y el diseño de las secciones se cambian en código.</li>
      </ul>
    </div>
  );
}

const overrides: Partial<Overrides> = {
  headerActions: () => <HeaderActions />,
  iframe: CanvasFrame,
};

const plugins = [{ name: "blocks", label: "Ayuda", render: HelpPanel }];

const dictionary = {
  "header-undo": "deshacer",
  "header-redo": "rehacer",
  "header-toggle-leftsidebar": "Mostrar/ocultar panel izquierdo",
  "header-toggle-rightsidebar": "Mostrar/ocultar panel derecho",
  "header-toggle-menubar": "Mostrar/ocultar menú",
  "action-selectparent": "Seleccionar contenedor",
  "label-page": "Ajustes del sitio",
  "label-component": "Sección",
  "outline-empty": "Sin secciones",
  "outline-item-collapse": "Contraer",
  "outline-item-expand": "Expandir",
  "outline-header-title": "Estructura",
  "outline-header-collapseall": "Contraer todo",
  "field-readonly": "Solo lectura",
  "field-arrayitem-summary": "Elemento {index}",
  "field-arrayitem-duplicate": "Duplicar",
  "field-arrayitem-delete": "Quitar",
  "viewport-zoom-in": "Acercar",
  "viewport-zoom-out": "Alejar",
  "viewport-zoom-auto": "{zoom}% (auto)",
  "viewport-toggle-menu": "Tamaños de pantalla",
  "viewport-switch": "Ver en {label}",
  "viewport-switch-default": "Cambiar tamaño",
  "plugin-outline": "Estructura",
  "plugin-fields": "Campos",
  "layout-maximize": "maximizar",
  "layout-minimize": "minimizar",
  "loader-loading": "cargando",
};

const viewports = [
  { width: 1440, label: "Desktop", icon: "Monitor" as const },
  { width: 991, label: "Tablet", icon: "Tablet" as const },
  { width: 390, label: "Móvil", icon: "Smartphone" as const },
];

export function Editor({
  initialData,
  initialUnpublished,
  draftUpdatedAt,
  blobEnabled,
}: {
  initialData: LandingData;
  initialUnpublished: boolean;
  draftUpdatedAt: string;
  blobEnabled: boolean;
}) {
  const [status, setStatus] = useState<Status>({
    dirty: false,
    busy: null,
    message: initialUnpublished ? `Borrador sin publicar · ${time(draftUpdatedAt)}` : "Todo publicado",
    error: false,
    unpublished: initialUnpublished,
  });
  const latest = useRef<Data>(initialData as unknown as Data);
  const saved = useRef(JSON.stringify(initialData));
  const dirty = useRef(false);
  const busy = useRef(false);

  const run = useCallback(async (kind: "save" | "publish", data: Data): Promise<boolean> => {
    if (busy.current) return false;
    busy.current = true;
    setStatus((s) => ({ ...s, busy: kind }));
    const sent = data;
    let result: ActionResult;
    try {
      result = kind === "save" ? await saveDraftAction(sent) : await publishAction(sent);
    } catch {
      result = { ok: false, error: "Sin conexión con el servidor." };
    }
    busy.current = false;
    if (result.ok) {
      saved.current = JSON.stringify(sent);
      // Si hubo cambios mientras se guardaba, siguen pendientes
      const stillDirty = JSON.stringify(latest.current) !== saved.current;
      dirty.current = stillDirty;
      setStatus({
        dirty: stillDirty,
        busy: null,
        error: false,
        unpublished: kind === "save" || stillDirty,
        message: kind === "save" ? `Borrador guardado · ${time(result.at)}` : `Publicado · ${time(result.at)}`,
      });
      return true;
    }
    setStatus((s) => ({ ...s, busy: null, error: true, message: result.error }));
    return false;
  }, []);

  const api = useMemo<EditorApi>(
    () => ({
      status,
      save: (data) => run("save", data),
      publish: async (data) => {
        await run("publish", data);
      },
    }),
    [status, run],
  );

  // Autoguardado
  useEffect(() => {
    const id = setInterval(() => {
      if (dirty.current && !busy.current) run("save", latest.current);
    }, AUTOSAVE_MS);
    return () => clearInterval(id);
  }, [run]);

  // Ctrl/Cmd+S guarda; avisar antes de salir con cambios sin guardar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        run("save", latest.current);
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [run]);

  return (
    <EditorContext value={api}>
      <BlobContext value={blobEnabled}>
        <div className="ed">
          <Puck
            config={editorConfig}
            data={initialData as unknown as Data}
            onChange={(data) => {
              latest.current = data;
              const isDirty = JSON.stringify(data) !== saved.current;
              if (isDirty === dirty.current) return;
              dirty.current = isDirty;
              setStatus((s) => ({
                ...s,
                dirty: isDirty,
                error: false,
                message: isDirty ? "Cambios sin guardar" : s.unpublished ? "Borrador guardado" : "Todo publicado",
              }));
            }}
            permissions={{ insert: false, drag: false, duplicate: false, delete: false, edit: true }}
            overrides={overrides}
            plugins={plugins}
            dictionary={dictionary}
            viewports={viewports}
            ui={{ plugin: { current: "outline" } }}
            headerTitle="Landing · Ana Aguirre"
            iframe={{ enabled: true, waitForStyles: true }}
          />
        </div>
      </BlobContext>
    </EditorContext>
  );
}
