import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <div className="adm-logo">
          <b>ANA</b> <span className="serif">Aguirre</span>
        </div>
        <p className="adm-muted">Panel de administración</p>
        <LoginForm />
      </div>
    </main>
  );
}
