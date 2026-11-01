import { Suspense } from "react";
import { listRevisions } from "@/lib/content";
import { RestoreButton } from "./RestoreButton";

const fmt = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

async function RevisionList() {
  const revisions = await listRevisions();
  if (!revisions.length) return <p className="adm-muted">Todavía no hay publicaciones.</p>;
  return (
    <div className="adm-panel">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {revisions.map((r, i) => (
            <tr key={r.id}>
              <td>
                {fmt.format(r.createdAt)} {i === 0 && <span className="adm-badge adm-badge--ok">En línea</span>}
              </td>
              <td>{r.kind === "publish" ? "Publicación" : "Restauración"}</td>
              <td style={{ textAlign: "right" }}>
                <RestoreButton id={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RevisionsPage() {
  return (
    <>
      <header className="adm-head">
        <h1>Revisiones</h1>
        <span className="adm-muted">Cada vez que publicas se guarda una copia. Restaurar la copia al borrador no cambia el sitio.</span>
      </header>
      <Suspense fallback={<p className="adm-muted">Cargando…</p>}>
        <RevisionList />
      </Suspense>
    </>
  );
}
