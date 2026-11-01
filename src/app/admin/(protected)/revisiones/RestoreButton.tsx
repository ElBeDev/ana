"use client";

import { useActionState } from "react";
import Link from "next/link";
import { restoreAction, type RestoreState } from "./actions";

export function RestoreButton({ id }: { id: number }) {
  const [state, action, pending] = useActionState<RestoreState, FormData>(restoreAction, {});
  if (state.ok)
    return (
      <span className="adm-ok">
        Restaurada al borrador · <Link href="/admin/editor">Abrir editor</Link>
      </span>
    );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("¿Copiar esta versión al borrador? Lo publicado no cambia hasta que publiques.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="adm-btn adm-btn--sm" disabled={pending}>
        {pending ? "Restaurando…" : "Restaurar al borrador"}
      </button>
      {state.error && <span className="adm-error"> {state.error}</span>}
    </form>
  );
}
