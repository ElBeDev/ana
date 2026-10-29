// Contenido de la landing. Todo el texto y los datos de contacto viven aquí.

export const site = {
  name: "Ana Aguirre",
  fullName: "Ana Margarita Aguirre Quintanar",
  role: "Senior Project Manager",
  descriptor: "Consultoría Estratégica & Soluciones Digitales",
  tagline: "Estrategia que se transforma en soluciones.",
  headline: [
    "Operations & Process Improvement",
    "Digital Transformation",
    "Strategic Planning",
    "Cross-functional Leadership",
  ],
  url: "https://ana-aguirre.vercel.app", // TODO: dominio definitivo
  timezone: "America/Mexico_City",

  // TODO: datos reales de contacto. Mientras estén vacíos, los CTAs llevan a #contacto
  // y los links del footer no se muestran.
  contact: {
    whatsapp: "", // formato internacional sin "+" ni espacios, ej. "5215512345678"
    email: "",
    linkedin: "",
  },
};

export const generalMessage =
  "Hola Ana, vi tu sitio y me gustaría platicar sobre un proyecto.";

/** WhatsApp si está configurado, si no correo, si no la sección de contacto. */
export function contactHref(message: string = generalMessage) {
  const { whatsapp, email } = site.contact;
  if (whatsapp) return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  if (email) {
    const subject = encodeURIComponent("Contacto desde el sitio web");
    return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message)}`;
  }
  return "#contacto";
}

export const stats = [
  { value: 15, prefix: "+", label: "años de trayectoria" },
  { value: 3000, prefix: "+", label: "estudiantes en estrategias de atención y retención" },
  { value: 10, prefix: "+", label: "licitaciones con 100% de cumplimiento normativo" },
  { value: 5, prefix: "", label: "programas educativos gestionados" },
  { value: 20, prefix: "+", label: "capacitadores coordinados por proyecto" },
];

export type Experience = {
  id: string;
  org: string;
  tag: string;
  meta: string;
  period: string;
  image: string;
  roles: { title: string; period: string; points: string[] }[];
};

export const experience: Experience[] = [
  {
    id: "academia",
    org: "Academia Global",
    tag: "Campus online corporativos",
    meta: "PMO · Gestión de portafolio académico",
    period: "2022 – 2026",
    image: "/img/exp-academia.webp",
    roles: [
      {
        title: "Líder de planeación y gestión de proyectos",
        period: "Feb 2026 – Sep 2026",
        points: [
          "Planeación, coordinación transversal y seguimiento del portafolio de proyectos académicos del ecosistema de campus online.",
          "Gobernanza y control: cronogramas, hitos, flujos de trabajo, control de versiones y reportes para decisiones ejecutivas.",
          "Estandarización de prácticas operativas y enlace entre Dirección Académica, Operación y procesos administrativos.",
          "Gestión de riesgos y resolución de incidencias operativas.",
        ],
      },
      {
        title: "PM en Dirección de Estrategia Académica",
        period: "Abr 2022 – Feb 2026",
        points: [
          "Dirección operativa de 5 programas educativos: Preparatoria, Licenciatura, Ingeniería, Maestrías y Certificaciones.",
          "Arquitectura operativa y supervisión de los programas de Maestría y Bachillerato.",
          "Operación de campus online para cuentas institucionales como Bayer, Coppel, Alpura, GRG, Toks, Index y el Sistema Penitenciario de Sinaloa; despliegue inicial de Index y GRG.",
          "Puente táctico para resolver bloqueos entre las PM de cada área y los departamentos de soporte.",
        ],
      },
    ],
  },
  {
    id: "insurgentes",
    org: "Universidad Insurgentes",
    tag: "+3,000 estudiantes",
    meta: "Retención · KPIs · Reportes ejecutivos",
    period: "2020 – 2022",
    image: "/img/exp-insurgentes.webp",
    roles: [
      {
        title: "Coordinadora de Orientación Educativa",
        period: "Feb 2020 – Mar 2022",
        points: [
          "Estrategias de atención, transición y continuidad académica para más de 3,000 estudiantes de Bachillerato y Licenciatura.",
          "Metodologías analíticas y reportes ejecutivos orientados a la retención estudiantil.",
          "Diseño de mecanismos de evaluación y seguimiento; auditoría del sistema de evaluación y acreditación.",
          "Capacitación docente en herramientas digitales y metodologías innovadoras.",
        ],
      },
    ],
  },
  {
    id: "espacios",
    org: "Espacios en Red y Servicios",
    tag: "+10 licitaciones",
    meta: "Gobierno · Cumplimiento · Equipos",
    period: "2015 – 2019",
    image: "/img/exp-espacios.webp",
    roles: [
      {
        title: "Coordinadora de proyectos especiales",
        period: "Ene 2015 – Dic 2019",
        points: [
          "Más de 10 proyectos de licitación pública y privada vía Compranet, con 100% de cumplimiento normativo y legal.",
          "Cuentas como ASA, Microsoft, CONACYT, SECFIN, Secretaría de Salud de Querétaro y alcaldías de la CDMX.",
          "Liderazgo de un equipo de 5 profesionales y coordinación de más de 20 capacitadores externos.",
        ],
      },
    ],
  },
  {
    id: "lutan",
    org: "LUTAN",
    tag: "Robótica educativa",
    meta: "Equipo de 15 · Diseño instruccional SEP",
    period: "2010 – 2015",
    image: "/img/exp-lutan.webp",
    roles: [
      {
        title: "Coordinadora de planificación estratégica",
        period: "Ene 2010 – Ene 2015",
        points: [
          "Dirección de un equipo de 15 profesionales en robótica educativa y capacitación docente.",
          "Diseño instruccional de planes de estudio alineados a los marcos curriculares de la SEP.",
          "Administración de recursos materiales y humanos por proyecto.",
          "Consultoría técnica en el cierre de ventas corporativas.",
        ],
      },
    ],
  },
];

export type Service = {
  id: string;
  num: string;
  title: string;
  details: string[];
  cta: string;
  message: string;
  image: string;
  note?: string;
};

export const services: Service[] = [
  {
    id: "consultoria",
    num: "01",
    title: "Consultoría estratégica y gestión de proyectos",
    details: [
      "Diagnóstico operativo",
      "Estructuración de iniciativas",
      "Procesos y cronogramas",
      "Indicadores",
      "Coordinación de equipos",
    ],
    cta: "Quiero estructurar mi proyecto",
    message: "Hola Ana, vi tu sitio y me interesa la consultoría estratégica para estructurar un proyecto.",
    image: "/img/svc-1.webp",
  },
  {
    id: "desarrollo",
    num: "02",
    title: "Desarrollo web y aplicaciones",
    details: ["Sitios corporativos", "Landing pages", "Aplicaciones", "Plataformas a la medida"],
    cta: "Necesito una solución digital",
    message: "Hola Ana, vi tu sitio y necesito una solución digital (sitio web, app o plataforma).",
    image: "/img/svc-2.webp",
    note: "En colaboración con especialistas en desarrollo tecnológico.",
  },
  {
    id: "transformacion",
    num: "03",
    title: "Transformación digital y optimización",
    details: [
      "Digitalización de procesos",
      "Automatización",
      "Tableros de control",
      "Integración de herramientas",
      "Inteligencia artificial",
    ],
    cta: "Quiero optimizar mi operación",
    message: "Hola Ana, vi tu sitio y quiero optimizar y digitalizar la operación de mi organización.",
    image: "/img/svc-3.webp",
    note: "Sujeto a evaluación técnica.",
  },
  {
    id: "educacion",
    num: "04",
    title: "Ecosistemas educativos y capacitación",
    details: [
      "Campus virtuales",
      "Universidades corporativas",
      "Proyectos LMS (Moodle)",
      "Modelos académicos",
      "Centros de capacitación y certificación",
    ],
    cta: "Quiero desarrollar un proyecto educativo",
    message: "Hola Ana, vi tu sitio y quiero desarrollar un proyecto educativo o de capacitación.",
    image: "/img/svc-4.webp",
  },
];

export const process = [
  { title: "Diagnóstico", text: "Entender la necesidad, el contexto y los objetivos." },
  { title: "Planeación", text: "Definir alcance, procesos, cronograma, hitos e indicadores." },
  { title: "Ejecución", text: "Implementar con el equipo y los especialistas adecuados, resolviendo bloqueos." },
  { title: "Seguimiento", text: "Medir, reportar y ajustar con mejora continua." },
];

export const skills = [
  "PMO",
  "Optimización de procesos",
  "Transformación digital e IA",
  "Liderazgo de equipos y gestión transversal",
  "Planificación estratégica",
];

export const organizations = {
  corporate: ["Bayer", "Coppel", "Alpura", "Toks", "GRG", "Index", "Microsoft"],
  public: [
    "ASA",
    "CONACYT",
    "SECFIN",
    "Secretaría de Salud de Querétaro",
    "Alcaldía Milpa Alta",
    "Alcaldía Benito Juárez",
    "Sistema Penitenciario de Sinaloa",
  ],
  education: ["Academia Global", "Universidad Insurgentes", "LUTAN"],
};

export const education = [
  { title: "Diplomado en Inteligencia Artificial, Liderazgo y Cultura Digital", org: "Academia Global", year: "2026" },
  { title: "Maestría en Dirección de Negocios", org: "Academia Global", year: "2023 – 2025" },
  { title: "Diplomado en Liderazgo Situacional y Directivo", org: "Academia Global", year: "2023" },
  { title: "Licenciatura en Pedagogía", org: "Universidad Insurgentes", year: "2013" },
];

export const tools = ["monday.com", "Asana", "Moodle", "ChatGPT y herramientas de IA"];

export const competencies = [
  "Gestión de partes interesadas",
  "KPIs",
  "Dashboard reporting",
  "Analítica de datos",
  "Corporate Learning",
  "Diseño instruccional",
  "Gestión del cambio",
  "Licitaciones",
  "Negociación",
];
