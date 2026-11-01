import { Suspense } from "react";
import { getAdmin } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

async function AccountInfo() {
  const admin = await getAdmin();
  return (
    <p className="adm-muted" style={{ marginBottom: "1rem" }}>
      Sesión de <b>{admin?.name}</b> · {admin?.email}
    </p>
  );
}

export default function AccountPage() {
  return (
    <>
      <header className="adm-head">
        <h1>Cuenta</h1>
      </header>
      <div className="adm-panel">
        <Suspense fallback={null}>
          <AccountInfo />
        </Suspense>
        <h2>Cambiar contraseña</h2>
        <PasswordForm />
      </div>
    </>
  );
}
