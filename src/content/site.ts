// Datos fijos del sitio (no editables desde el panel). El contenido vive en la BD;
// el contenido original está en ./defaults.ts.
import type { SiteSettings } from "@/blocks/types";

export const site = {
  // En Vercel toma el dominio de producción del proyecto; cámbialo cuando haya dominio propio.
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
  timezone: "America/Mexico_City",
};

/** WhatsApp si está configurado, si no correo, si no la sección de contacto. */
export function contactHref(contact: SiteSettings["contact"], message: string = contact.message) {
  const whatsapp = contact.whatsapp.replace(/\D/g, "");
  const { email } = contact;
  if (whatsapp) return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  if (email) {
    const subject = encodeURIComponent("Contacto desde el sitio web");
    return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message)}`;
  }
  return "#contacto";
}
