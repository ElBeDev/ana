"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "./actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="adm-form" style={{ maxWidth: "24rem" }} key={state.ok ? "ok" : "form"}>
      <label>
        Contraseña actual
        <input name="current" type="password" autoComplete="current-password" required />
      </label>
      <label>
        Nueva contraseña (mínimo 10 caracteres)
        <input name="next" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      <label>
        Confirmar nueva contraseña
        <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      {state.error && <p className="adm-error">{state.error}</p>}
      {state.ok && <p className="adm-ok">Contraseña actualizada.</p>}
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
