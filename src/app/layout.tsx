import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const title = `${site.name} | ${site.descriptor}`;
const description =
  "Más de 15 años en gestión de proyectos, PMO, optimización de procesos, transformación digital y ecosistemas educativos. Estrategia que se transforma en soluciones.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  keywords: [
    "consultoría estratégica",
    "gestión de proyectos",
    "project manager",
    "PMO",
    "transformación digital",
    "mejora de procesos",
    "campus virtual",
    "LMS",
    "universidad corporativa",
    "capacitación",
  ],
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: site.name,
    locale: "es_MX",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0b1b2e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  alternateName: site.name,
  jobTitle: site.role,
  description,
  url: site.url,
  ...(site.contact.linkedin ? { sameAs: [site.contact.linkedin] } : {}),
  knowsAbout: site.headline,
  alumniOf: ["Universidad Insurgentes", "Academia Global"],
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
      className={`${interTight.variable} ${instrument.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preload" as="image" href="/img/hero-a.webp" media="(min-width: 768px)" />
        <link rel="preload" as="image" href="/img/hero-a-m.webp" media="(max-width: 767px)" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
