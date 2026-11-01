import { Suspense } from "react";
import Link from "next/link";
import { getEditorState } from "@/lib/content";

const fmt = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

async function Status() {
  const { draft, published, publishedAt, draftUpdatedAt, hasUnpublishedChanges } = await getEditorState();
  const live = published ?? draft;
  const { contact } = live.root.props;
  const warnings = [
    !published && "La página todavía muestra el contenido original: publica desde el editor para que salga de la base de datos.",
    !contact.whatsapp && "Sin WhatsApp: los botones llevan a la sección de contacto y no aparece el botón flotante.",
    !contact.email && "Sin correo de contacto.",
    !contact.linkedin && "Sin LinkedIn: no aparece el botón “Ver perfil en LinkedIn”.",
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="adm-cards">
        <div className="adm-card">
          <span className="adm-muted">Sitio público</span>
          <b>{publishedAt ? `Publicado · ${fmt.format(publishedAt)}` : "Sin publicar desde el panel"}</b>
        </div>
        <div className="adm-card">
          <span className="adm-muted">Borrador</span>
          <b>
            {hasUnpublishedChanges ? (
              <span className="adm-badge adm-badge--warn">Cambios sin publicar</span>
            ) : (
              <span className="adm-badge adm-badge--ok">Igual a lo publicado</span>
            )}
          </b>
          <span className="adm-muted">Última edición · {fmt.format(draftUpdatedAt)}</span>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="adm-panel" style={{ marginTop: "1rem" }}>
          <h2>Pendientes</h2>
          <ul style={{ display: "grid", gap: "0.4rem", paddingLeft: "1rem", listStyle: "disc" }}>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="adm-muted" style={{ marginTop: "0.75rem" }}>
            Contacto y LinkedIn se llenan en el editor, en <b>Ajustes del sitio</b> (sin ninguna sección seleccionada).
          </p>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <header className="adm-head">
        <h1>Inicio</h1>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/editor" className="adm-btn adm-btn--primary">
            Editar la landing
          </Link>
          <Link href="/admin/medios" className="adm-btn">
            Subir imágenes
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn">
            Ver sitio ↗
          </a>
        </div>
      </header>
      <Suspense fallback={<p className="adm-muted">Cargando…</p>}>
        <Status />
      </Suspense>
    </>
  );
}
