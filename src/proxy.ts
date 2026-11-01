import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session-token";

// Filtro rápido del admin. La verificación real (usuario existente) se hace con requireAdmin().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  let valid = false;
  try {
    valid = verifyToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;
  } catch {
    valid = false;
  }
  if (valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};
