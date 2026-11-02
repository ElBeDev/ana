// Forma del documento editable de la landing (lo que guarda Puck).
// Texto con formato: **negrita** y *acento serif* (ver lib/inline.tsx).

export type SiteSettings = {
  identity: {
    name: string;
    fullName: string;
    role: string;
    descriptor: string;
    tagline: string;
    headline: string[];
  };
  contact: {
    whatsapp: string; // formato internacional sin "+" ni espacios
    email: string;
    linkedin: string;
    message: string; // mensaje general de WhatsApp/correo
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    links: { label: string; href: string }[];
    cta: string;
  };
  loader: { images: { src: string }[]; wordSans: string; wordSerif: string };
  whatsappFloat: boolean;
};

export type HeroProps = {
  titleSans: string;
  titleSerif: string;
  leftTag: string;
  paragraph: string;
  rightTag: string;
  cta: string;
  alt: string;
  imageA: string;
  imageAMobile: string;
  imageB: string;
  imageBMobile: string;
};

export type Stat = { value: number; prefix: string; suffix: string; label: string };
export type IntroProps = { label: string; text: string; statsTitle: string; stats: Stat[] };

export type Role = { title: string; period: string }; // alimenta la trayectoria de "Sobre mí"
export type ExperienceItem = {
  org: string;
  period: string;
  image: string;
  headline: string; // título de la tarjeta y del detalle
  summary: string; // texto de la tarjeta
  detail: string; // párrafos separados por una línea en blanco
  scope: string; // "Alcance destacado"
  roles: Role[];
};
export type ExperienceProps = {
  title: string;
  period: string;
  moreLabel: string;
  buttonLabel: string;
  buttonHref: string;
  closeLabel: string;
  scopeLabel: string;
  items: ExperienceItem[];
};

export type ServiceArt = "cronograma" | "mockups" | "codigo" | "cursos";
export type ServiceItem = {
  num: string;
  title: string;
  details: string[];
  cta: string;
  message: string;
  image: string;
  note: string;
  art: ServiceArt;
};
export type ServicesProps = {
  title: string;
  count: string;
  items: ServiceItem[];
  artPlan: { title: string; kpiLabel: string; kpiValue: string; milestone: string };
  artCode: string;
  artCourses: { label: string; pct: number }[];
};

export type ProcessProps = { title: string; lead: string; steps: { title: string; text: string }[] };

export type NoiseProps = {
  text: string; // los saltos de línea se respetan
  images: { src: string }[];
  revealImage: string;
  revealSans: string;
  revealSerif: string;
};

export type AboutProps = {
  label: string;
  titleSans: string;
  titleSerif: string;
  photo: string;
  alt: string;
  bio: string; // párrafos separados por una línea en blanco
  skills: string[];
  timelineLabel: string;
  linkedinLabel: string;
  cta: string;
};

export type OrganizationsProps = {
  title: string;
  row1: string[];
  row2: string[];
  note: string;
};

export type EducationProps = {
  title: string;
  rows: { title: string; org: string; year: string }[];
  toolsLabel: string;
  tools: string[];
  competenciesLabel: string;
  competencies: string[];
};

export type ContactProps = {
  image: string;
  cycle: { src: string }[];
  lead: string;
  button: string;
  copyright: string;
  bigSans: string;
  bigSerif: string;
};

export type BlockProps = {
  Hero: HeroProps;
  Intro: IntroProps;
  Experience: ExperienceProps;
  Services: ServicesProps;
  Process: ProcessProps;
  Noise: NoiseProps;
  About: AboutProps;
  Organizations: OrganizationsProps;
  Education: EducationProps;
  Contact: ContactProps;
};

export type BlockType = keyof BlockProps;

export type LandingBlock = { [K in BlockType]: { type: K; props: BlockProps[K] & { id: string } } }[BlockType];

export type LandingData = {
  root: { props: SiteSettings };
  content: LandingBlock[];
};
