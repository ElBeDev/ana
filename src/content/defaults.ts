// Documento inicial de la landing: el contenido original del sitio.
// Se usa para crear el registro en la BD y como respaldo si la BD no responde.
import type { LandingData } from "@/blocks/types";

export const defaultLanding: LandingData = {
  root: {
    props: {
      identity: {
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
      },
      contact: {
        whatsapp: "",
        email: "",
        linkedin: "",
        message: "Hola Ana, vi tu sitio y me gustaría platicar sobre un proyecto.",
      },
      seo: {
        title: "Ana Aguirre | Consultoría Estratégica & Soluciones Digitales",
        description:
          "Más de 15 años en gestión de proyectos, PMO, optimización de procesos, transformación digital y ecosistemas educativos. Estrategia que se transforma en soluciones.",
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
      },
      nav: {
        links: [
          { label: "Inicio", href: "#inicio" },
          { label: "Experiencia", href: "#experiencia" },
          { label: "Servicios", href: "#servicios" },
          { label: "Sobre mí", href: "#sobre-mi" },
          { label: "Contacto", href: "#contacto" },
        ],
        cta: "Agendar llamada",
      },
      loader: {
        images: [{ src: "/img/ana-blue.webp" }, { src: "/img/exp-academia.webp" }, { src: "/img/ana-wine.webp" }],
        wordSans: "Ana",
        wordSerif: "Aguirre",
      },
      whatsappFloat: true,
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "hero",
        titleSans: "Estrategia",
        titleSerif: "que se transforma en soluciones",
        leftTag: "Senior Project Manager",
        paragraph:
          "Más de 15 años convirtiendo necesidades empresariales e institucionales en soluciones operativas y digitales.",
        rightTag: "Consultoría & Soluciones Digitales",
        cta: "Agendar una llamada",
        alt: "Ana Aguirre, consultora estratégica",
        imageA: "/img/hero-a.webp",
        imageAMobile: "/img/hero-a-m.webp",
        imageB: "/img/hero-b.webp",
        imageBMobile: "/img/hero-b-m.webp",
      },
    },
    {
      type: "Intro",
      props: {
        id: "intro",
        label: "(Sobre mí)",
        text: "Soy Ana Aguirre. Conecto la estrategia de negocio con soluciones operativas y tecnológicas *que sí se ejecutan.*",
        statsTitle: "Trayectoria que conecta estrategia, equipos y ejecución.",
        stats: [
          { prefix: "", value: 15, suffix: "+", label: "años de experiencia en proyectos, operaciones y aprendizaje" },
          { prefix: "", value: 10, suffix: "+", label: "proyectos de licitación pública y privada coordinados" },
          { prefix: "", value: 5, suffix: "", label: "líneas educativas articuladas en un ecosistema online" },
          { prefix: "", value: 15, suffix: "", label: "profesionales liderados en un mismo equipo" },
          { prefix: "", value: 3000, suffix: "+", label: "estudiantes dentro del alcance de estrategias de atención y seguimiento" },
        ],
      },
    },
    {
      type: "Experience",
      props: {
        id: "experience",
        title: "Experiencia destacada",
        period: "(2010 – 2026)",
        moreLabel: "Ver detalle",
        buttonLabel: "Ver trayectoria completa",
        buttonHref: "#sobre-mi",
        closeLabel: "Cerrar ✕",
        scopeLabel: "Alcance destacado",
        items: [
          {
            org: "Academia Global",
            period: "2022 – 2026",
            image: "/img/exp-academia.webp",
            headline: "De la estrategia a la operación de campus digitales",
            summary:
              "Coordinación de proyectos, procesos y equipos para la operación de cinco líneas educativas y la implementación de campus corporativos.",
            detail:
              "Conecté la estrategia académica con la ejecución diaria de un ecosistema de educación online. Articulé el trabajo entre equipos académicos, tecnológicos, comerciales y administrativos para dar seguimiento a prioridades, resolver bloqueos y asegurar la continuidad de los proyectos.\n\nParticipé en la creación y puesta en marcha de campus para clientes corporativos, traduciendo sus necesidades en requerimientos, actividades y entregables. Mi contribución abarcó la planeación, el seguimiento operativo, la estandarización de procesos y la consolidación de información para la toma de decisiones.",
            scope:
              "Cinco líneas educativas: bachillerato, licenciaturas, ingenierías, maestrías y certificaciones. Participación en proyectos para organizaciones como Bayer, Coppel, Alpura, INDEX y GRG.",
            roles: [
              { title: "Líder de planeación y gestión de proyectos", period: "Feb 2026 – Sep 2026" },
              { title: "PM en Dirección de Estrategia Académica", period: "Abr 2022 – Feb 2026" },
            ],
          },
          {
            org: "Universidad Insurgentes",
            period: "2020 – 2022",
            image: "/img/exp-insurgentes.webp",
            headline: "Procesos e información para la continuidad estudiantil",
            summary:
              "Coordinación de estrategias de atención y seguimiento para una comunidad de más de 3,000 estudiantes de bachillerato y licenciatura.",
            detail:
              "Coordiné estrategias de acompañamiento estudiantil que conectaban la atención individual con las necesidades de operación de la institución. Organicé mecanismos de seguimiento para identificar situaciones de riesgo y orientar acciones de continuidad académica.\n\nDesarrollé reportes ejecutivos y procesos de evaluación de la atención, además de colaborar en la revisión de los sistemas de evaluación y acreditación. Complementé este trabajo con asesoramiento y capacitación docente en herramientas digitales y prácticas educativas.",
            scope:
              "Una matrícula de más de 3,000 estudiantes y coordinación con docentes y áreas académicas para atender necesidades de permanencia, transición y seguimiento.",
            roles: [{ title: "Coordinadora de Orientación Educativa", period: "Feb 2020 – Mar 2022" }],
          },
          {
            org: "Espacios en Red y Servicios",
            period: "2015 – 2019",
            image: "/img/exp-espacios.webp",
            headline: "De la licitación a la ejecución del proyecto",
            summary:
              "Coordinación integral de proyectos públicos y privados: propuestas, documentación, equipos de especialistas y seguimiento de entregables.",
            detail:
              "Coordiné proyectos desde la integración de propuestas para licitaciones hasta su implementación y seguimiento. Traduje los requerimientos de cada contratación en planes de trabajo, recursos y entregables, articulando la documentación administrativa con la ejecución operativa.\n\nLideré al equipo interno de proyectos y coordiné la contratación y participación de capacitadores externos según las necesidades de cada servicio. Esta experiencia fortaleció mi capacidad para gestionar proyectos con múltiples participantes y exigencias documentales específicas.",
            scope:
              "Más de 10 proyectos de licitación pública y privada, un equipo directo de cinco profesionales y una red de más de 20 capacitadores. Participación en proyectos para ASA, Microsoft, CONACYT y otras instituciones públicas.",
            roles: [{ title: "Coordinadora de proyectos especiales", period: "Ene 2015 – Dic 2019" }],
          },
          {
            org: "LUTAN",
            period: "2010 – 2015",
            image: "/img/exp-lutan.webp",
            headline: "Del modelo educativo a su implementación en el aula",
            summary:
              "Coordinación de equipos, contenidos y recursos para implementar programas de robótica educativa y capacitación docente.",
            detail:
              "Coordiné la implementación de proyectos de robótica educativa, conectando el diseño de contenidos con la preparación de los docentes y las condiciones de operación en el aula.\n\nLideré la asignación de responsabilidades y recursos de un equipo de 15 profesionales, y participé en el desarrollo de planes y contenidos alineados con los marcos curriculares de la SEP. También acompañé procesos comerciales mediante demostraciones y asesoría técnica para explicar el valor y las posibilidades del modelo educativo.",
            scope:
              "Liderazgo de 15 profesionales, formación docente y coordinación de los recursos humanos y materiales necesarios para ejecutar los programas.",
            roles: [{ title: "Coordinadora de planificación estratégica", period: "Ene 2010 – Ene 2015" }],
          },
        ],
      },
    },
    {
      type: "Services",
      props: {
        id: "services",
        title: "Cómo puedo ayudarte",
        count: "(04)",
        items: [
          {
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
            note: "",
            art: "cronograma",
          },
          {
            num: "02",
            title: "Desarrollo web y aplicaciones",
            details: ["Sitios corporativos", "Landing pages", "Aplicaciones", "Plataformas a la medida"],
            cta: "Necesito una solución digital",
            message: "Hola Ana, vi tu sitio y necesito una solución digital (sitio web, app o plataforma).",
            image: "/img/svc-2.webp",
            note: "En colaboración con especialistas en desarrollo tecnológico.",
            art: "mockups",
          },
          {
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
            art: "codigo",
          },
          {
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
            note: "",
            art: "cursos",
          },
        ],
        artPlan: {
          title: "Cronograma",
          kpiLabel: "Avance vs. plan",
          kpiValue: "87%",
          milestone: "✓ Hito: tablero de control",
        },
        artCode: "KPI 98% · SLA 24H · FLUJO → AUTO · DATA ✓ · 011 1000 · IA · ETL → TABLERO · OK",
        artCourses: [
          { label: "Campus virtual", pct: 72 },
          { label: "Universidad corporativa", pct: 88 },
          { label: "Certificación", pct: 54 },
        ],
      },
    },
    {
      type: "Process",
      props: {
        id: "process",
        title: "De lo que necesitas *a lo que funciona*",
        lead: "¿Una idea por desarrollar o un proceso que te complica el trabajo? Te ayudo a convertirlo en acciones claras.",
        steps: [
          { title: "Entendemos tu necesidad", text: "Identificamos qué quieres lograr y qué te está frenando." },
          { title: "Trazamos la ruta", text: "Definimos acciones, responsables, recursos y tiempos." },
          { title: "Lo ponemos en marcha", text: "Coordino la implementación con tu equipo y los especialistas necesarios." },
          { title: "Revisamos y ajustamos", text: "Evaluamos avances y dejamos herramientas para dar continuidad." },
        ],
      },
    },
    {
      type: "Noise",
      props: {
        id: "noise",
        text: "En un mundo lleno de\npendientes",
        images: [
          { src: "/img/noise-notes.webp" },
          { src: "/img/noise-inbox.webp" },
          { src: "/img/noise-chat.webp" },
          { src: "/img/noise-cal.webp" },
          { src: "/img/noise-sheet.webp" },
          { src: "/img/noise-todo.webp" },
        ],
        revealImage: "/img/hero-b.webp",
        revealSans: "Convierte la estrategia",
        revealSerif: "en resultados",
      },
    },
    {
      type: "About",
      props: {
        id: "about",
        label: "(Sobre mí)",
        titleSans: "Ana",
        titleSerif: "Aguirre",
        photo: "/img/ana-retrato.webp",
        alt: "Retrato de Ana Margarita Aguirre Quintanar",
        bio: "Soy **Ana Margarita Aguirre Quintanar**, profesional en Pedagogía con Maestría en Dirección de Negocios y más de 15 años de trayectoria en gestión de proyectos, operaciones y soluciones de educación digital. He coordinado iniciativas multidisciplinarias, proyectos corporativos, procesos de implementación y equipos de trabajo en organizaciones corporativas, educativas y públicas, conectando necesidades estratégicas con la ejecución operativa.\n\nHoy pongo esa experiencia al servicio de organizaciones que buscan estructurar, modernizar o impulsar sus proyectos, mediante un enfoque de consultoría que integra estrategia, gestión y colaboración tecnológica especializada.",
        skills: [
          "Diagnóstico y planeación estratégica",
          "Gestión integral de proyectos",
          "Optimización de procesos",
          "Coordinación de equipos y especialistas",
          "Definición de requerimientos de negocio",
          "Coordinación de soluciones digitales",
          "Diseño de proyectos educativos y capacitación",
          "Indicadores y seguimiento de resultados",
        ],
        timelineLabel: "Trayectoria",
        linkedinLabel: "Ver perfil en LinkedIn",
        cta: "Platiquemos",
      },
    },
    {
      type: "Organizations",
      props: {
        id: "organizations",
        title: "Organizaciones con las que *he colaborado*",
        row1: [
          "Bayer",
          "Coppel",
          "Alpura",
          "Toks",
          "GRG",
          "Index",
          "Microsoft",
          "Academia Global",
          "Universidad Insurgentes",
          "LUTAN",
        ],
        row2: [
          "ASA",
          "CONACYT",
          "SECFIN",
          "Secretaría de Salud de Querétaro",
          "Alcaldía Milpa Alta",
          "Alcaldía Benito Juárez",
          "Sistema Penitenciario de Sinaloa",
        ],
        note: "Proyectos realizados como parte de los equipos de Academia Global, Universidad Insurgentes, Espacios en Red y Servicios y LUTAN.",
      },
    },
    {
      type: "Education",
      props: {
        id: "education",
        title: "Formación",
        rows: [
          { title: "Diplomado en Inteligencia Artificial, Liderazgo y Cultura Digital", org: "Academia Global", year: "2026" },
          { title: "Maestría en Dirección de Negocios", org: "Academia Global", year: "2023 – 2025" },
          { title: "Diplomado en Liderazgo Situacional y Directivo", org: "Academia Global", year: "2023" },
          { title: "Licenciatura en Pedagogía", org: "Universidad Insurgentes", year: "2013" },
        ],
        toolsLabel: "Herramientas",
        tools: ["monday.com", "Asana", "Moodle", "ChatGPT y herramientas de IA"],
        competenciesLabel: "Otras competencias",
        competencies: [
          "Gestión de partes interesadas",
          "KPIs",
          "Dashboard reporting",
          "Analítica de datos",
          "Corporate Learning",
          "Diseño instruccional",
          "Gestión del cambio",
          "Licitaciones",
          "Negociación",
        ],
      },
    },
    {
      type: "Contact",
      props: {
        id: "contact",
        image: "/img/ana-ink.webp",
        cycle: [
          { src: "/img/ana-blue.webp" },
          { src: "/img/exp-academia.webp" },
          { src: "/img/ana-wine.webp" },
          { src: "/img/svc-3.webp" },
          { src: "/img/exp-insurgentes.webp" },
        ],
        lead: "Cuéntame tu proyecto y lo convertimos *en una solución.*",
        button: "Empecemos",
        copyright: "Todos los derechos reservados · Ana Aguirre © 2026",
        bigSans: "ANA",
        bigSerif: "Aguirre",
      },
    },
  ],
};
