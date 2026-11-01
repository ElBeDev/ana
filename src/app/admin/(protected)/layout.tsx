import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const instant = false;

const NAV = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/editor", label: "Editor" },
  { href: "/admin/medios", label: "Medios" },
  { href: "/admin/revisiones", label: "Revisiones" },
  { href: "/admin/cuenta", label: "Cuenta" },
];

async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-logo">
          <b>ANA</b> <span className="serif">Aguirre</span>
        </Link>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer">
            Ver sitio ↗
          </a>
        </nav>
        <div className="adm-side__foot">
          <span className="adm-muted">{admin.name}</span>
          <form action={logoutAction}>
            <button type="submit" className="adm-link">
              Salir
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

export default function ProtectedLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="adm-loading">Cargando…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
