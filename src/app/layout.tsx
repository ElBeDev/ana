import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
};

export const viewport: Viewport = {
  themeColor: "#0b1b2e",
};

// Corre antes del primer pintado: activa los estados iniciales de animación y
// salta el loader en visitas repetidas o con movimiento reducido.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduced');
try{if(sessionStorage.getItem('aa-intro'))d.classList.add('no-loader')}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${fontVariables} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
