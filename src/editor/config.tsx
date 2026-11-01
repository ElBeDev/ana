"use client";

import type { ComponentType, ReactNode } from "react";
import { createUsePuck, type Config, type Fields } from "@puckeditor/core";
import { BLOCK_COMPONENTS } from "@/blocks/components";
import { BLOCK_LABELS, LANDING_BLOCKS } from "@/blocks/landing";
import { LandingProvider } from "@/blocks/context";
import type { BlockProps, BlockType, LandingData, SiteSettings } from "@/blocks/types";
import { defaultLanding } from "@/content/defaults";
import { Nav } from "@/components/Nav";
import { area, image, lines, num, text, yesNo } from "./fields";

const FORMAT = "**negrita**, *serif*";

const FIELDS: { [K in BlockType]: Fields<BlockProps[K]> } = {
  Hero: {
    titleSans: text("Título (sans, mayúsculas)"),
    titleSerif: text("Título (serif)"),
    cta: text("Botón"),
    leftTag: text("Etiqueta izquierda"),
    paragraph: area("Párrafo central"),
    rightTag: text("Etiqueta derecha"),
    imageA: image("Foto principal · desktop"),
    imageAMobile: image("Foto principal · móvil"),
    imageB: image("Foto que revela el cursor · desktop"),
    imageBMobile: image("Foto que revela el cursor · móvil"),
    alt: text("Descripción de la foto (accesibilidad)"),
  },
  Intro: {
    label: text("Etiqueta"),
    text: area(`Texto grande (${FORMAT})`),
    stats: {
      type: "array",
      label: "Cifras",
      min: 3,
      max: 6,
      arrayFields: { prefix: text("Prefijo (+, ~…)"), value: num("Número", 0), label: text("Texto") },
      defaultItemProps: { prefix: "+", value: 10, label: "Nueva cifra" },
      getItemSummary: (s) => `${s.prefix}${s.value} ${s.label}`,
    },
  },
  Experience: {
    title: text("Título"),
    period: text("Periodo"),
    items: {
      type: "array",
      label: "Tarjetas",
      min: 1,
      max: 8,
      arrayFields: {
        org: text("Organización"),
        tag: text("Etiqueta"),
        meta: text("Detalle"),
        period: text("Periodo"),
        image: image("Imagen"),
        roles: {
          type: "array",
          label: "Puestos",
          min: 1,
          arrayFields: { title: text("Puesto"), period: text("Periodo"), points: lines("Logros") },
          defaultItemProps: { title: "Puesto", period: "", points: [] },
          getItemSummary: (r) => r.title,
        },
      },
      defaultItemProps: {
        org: "Organización",
        tag: "",
        meta: "",
        period: "",
        image: "/img/exp-academia.webp",
        roles: [{ title: "Puesto", period: "", points: [] }],
      },
      getItemSummary: (e) => e.org,
    },
    moreLabel: text("Texto “ver detalle” de cada tarjeta"),
    buttonLabel: text("Botón final"),
    buttonHref: text("Destino del botón final (#ancla o URL)"),
    closeLabel: text("Botón para cerrar el detalle"),
  },
  Services: {
    title: text("Título"),
    count: text("Contador"),
    items: {
      type: "array",
      label: "Paneles",
      min: 4,
      max: 4,
      arrayFields: {
        num: text("Número"),
        title: text("Título"),
        details: lines("Detalles"),
        cta: text("Botón"),
        message: area("Mensaje de WhatsApp/correo del botón"),
        note: text("Nota al pie (opcional)"),
        image: image("Imagen de fondo"),
        art: {
          type: "select",
          label: "Animación decorativa",
          options: [
            { label: "Cronograma y KPI", value: "cronograma" },
            { label: "Pantallas (mockups)", value: "mockups" },
            { label: "Código que se reordena", value: "codigo" },
            { label: "Cursos con progreso", value: "cursos" },
          ],
        },
      },
      getItemSummary: (s) => `${s.num} · ${s.title}`,
    },
    artPlan: {
      type: "object",
      label: "Animación “Cronograma y KPI”",
      objectFields: {
        title: text("Tarjeta 1"),
        kpiLabel: text("Tarjeta 2 · texto"),
        kpiValue: text("Tarjeta 2 · cifra"),
        milestone: text("Tarjeta 3"),
      },
    },
    artCode: text("Animación “Código” · texto"),
    artCourses: {
      type: "array",
      label: "Animación “Cursos”",
      min: 1,
      max: 4,
      arrayFields: { label: text("Curso"), pct: num("Progreso %", 0, 100) },
      defaultItemProps: { label: "Curso", pct: 50 },
      getItemSummary: (c) => `${c.label} · ${c.pct}%`,
    },
  },
  Process: {
    title: text(`Título (${FORMAT})`),
    steps: {
      type: "array",
      label: "Pasos",
      min: 4,
      max: 4,
      arrayFields: { title: text("Título"), text: area("Texto") },
      getItemSummary: (s) => s.title,
    },
  },
  Noise: {
    text: area("Texto del “ruido” (los saltos de línea se respetan)"),
    images: {
      type: "array",
      label: "Imágenes del “ruido”",
      min: 6,
      max: 6,
      arrayFields: { src: image("Imagen") },
      getItemSummary: (_i, index) => `Imagen ${(index ?? 0) + 1}`,
    },
    revealImage: image("Imagen que se revela con la “A”"),
    revealSans: text("Texto revelado (sans)"),
    revealSerif: text("Texto revelado (serif)"),
  },
  About: {
    label: text("Etiqueta"),
    titleSans: text("Título (sans)"),
    titleSerif: text("Título (serif)"),
    photo: image("Foto"),
    alt: text("Descripción de la foto (accesibilidad)"),
    bio: area(`Biografía (párrafos separados por una línea en blanco; ${FORMAT})`),
    skills: lines("Habilidades"),
    timelineLabel: text("Título de la trayectoria (sale de Experiencia)"),
    linkedinLabel: text("Botón de LinkedIn (aparece si hay LinkedIn en Ajustes)"),
    cta: text("Botón de contacto"),
  },
  Organizations: {
    title: text(`Título (${FORMAT})`),
    row1: lines("Fila 1"),
    row2: lines("Fila 2"),
    note: area("Nota al pie"),
  },
  Education: {
    title: text("Título"),
    rows: {
      type: "array",
      label: "Programas",
      arrayFields: { title: text("Programa"), org: text("Institución"), year: text("Año") },
      defaultItemProps: { title: "Programa", org: "", year: "" },
      getItemSummary: (r) => r.title,
    },
    toolsLabel: text("Título de herramientas"),
    tools: lines("Herramientas"),
    competenciesLabel: text("Título de competencias"),
    competencies: lines("Competencias"),
  },
  Contact: {
    lead: area(`Frase (${FORMAT})`),
    button: text("Botón"),
    image: image("Imagen en reposo (se muestra en blanco y negro)"),
    cycle: {
      type: "array",
      label: "Imágenes que ciclan al pasar por el botón",
      min: 1,
      max: 8,
      arrayFields: { src: image("Imagen") },
      defaultItemProps: { src: "/img/ana-blue.webp" },
      getItemSummary: (_i, index) => `Imagen ${(index ?? 0) + 1}`,
    },
    copyright: text("Derechos reservados"),
    bigSans: text("Nombre gigante (sans)"),
    bigSerif: text("Nombre gigante (serif)"),
  },
};

const ROOT_FIELDS: Fields<SiteSettings> = {
  identity: {
    type: "object",
    label: "Identidad",
    objectFields: {
      name: text("Nombre de marca"),
      fullName: text("Nombre completo"),
      role: text("Puesto"),
      descriptor: text("Descriptor"),
      tagline: text("Frase de marca"),
      headline: lines("Titular de LinkedIn (para buscadores)"),
    },
  },
  contact: {
    type: "object",
    label: "Contacto",
    objectFields: {
      whatsapp: text("WhatsApp (formato 5215512345678)"),
      email: text("Correo"),
      linkedin: text("URL de LinkedIn"),
      message: area("Mensaje general de WhatsApp/correo"),
    },
  },
  whatsappFloat: yesNo("Botón flotante de WhatsApp"),
  nav: {
    type: "object",
    label: "Menú",
    objectFields: {
      links: {
        type: "array",
        label: "Links",
        min: 1,
        max: 7,
        arrayFields: { label: text("Texto"), href: text("Destino (#ancla o URL)") },
        defaultItemProps: { label: "Link", href: "#inicio" },
        getItemSummary: (l) => l.label,
      },
      cta: text("Botón del menú"),
    },
  },
  seo: {
    type: "object",
    label: "Buscadores y redes (SEO)",
    objectFields: {
      title: text("Título de la página"),
      description: area("Descripción"),
      keywords: lines("Palabras clave"),
    },
  },
  loader: {
    type: "object",
    label: "Intro de carga",
    objectFields: {
      wordSans: text("Nombre (sans)"),
      wordSerif: text("Nombre (serif)"),
      images: {
        type: "array",
        label: "Imágenes",
        min: 3,
        max: 3,
        arrayFields: { src: image("Imagen") },
        getItemSummary: (_i, index) => `Imagen ${(index ?? 0) + 1}`,
      },
    },
  },
};

const usePuck = createUsePuck();

/** En el lienzo, las secciones leen ajustes y datos cruzados del documento vivo. */
function CanvasRoot({ children }: { children: ReactNode }) {
  const data = usePuck((s) => s.appState.data) as unknown as LandingData;
  return (
    <LandingProvider data={data} editing>
      <Nav />
      <main>{children}</main>
    </LandingProvider>
  );
}

function strip<P>(props: P & { puck?: unknown; editMode?: unknown; id?: unknown }) {
  const rest = { ...props };
  delete rest.puck;
  delete rest.editMode;
  delete rest.id;
  return rest as P;
}

const defaultsByType = Object.fromEntries(defaultLanding.content.map((b) => [b.type, b.props])) as {
  [K in BlockType]: BlockProps[K] & { id: string };
};

function blockConfig<K extends BlockType>(type: K) {
  const Component = BLOCK_COMPONENTS[type] as ComponentType<BlockProps[K]>;
  return {
    label: BLOCK_LABELS[type],
    fields: FIELDS[type],
    defaultProps: strip(defaultsByType[type]),
    render: (props: BlockProps[K]) => <Component {...strip(props)} />,
  };
}

export const editorConfig = {
  root: {
    fields: ROOT_FIELDS,
    defaultProps: defaultLanding.root.props,
    render: CanvasRoot,
  },
  components: Object.fromEntries(LANDING_BLOCKS.map((type) => [type, blockConfig(type)])),
} as unknown as Config;
