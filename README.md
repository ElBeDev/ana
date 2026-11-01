# Ana Aguirre — Consultoría Estratégica & Soluciones Digitales

Landing de marca personal con panel de administración. Next.js 16 + Tailwind 4 + GSAP + Lenis,
editor visual con Puck, Postgres (Neon) con Drizzle y Vercel Blob para imágenes.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y llena los valores
npm run db:migrate           # crea las tablas
npm run seed                 # crea la cuenta admin y registra las imágenes de public/img
npm run dev
```

- Sitio: http://localhost:3000
- Panel: http://localhost:3000/admin

Sin `DATABASE_URL` el sitio funciona igual con el contenido original (`src/content/defaults.ts`);
el panel sí necesita base de datos.

## Editar contenido

Todo el texto, las imágenes, el contacto y el SEO se editan en **/admin → Editor**:

- Clic en una sección (o en **Estructura**) para ver sus campos a la derecha.
- Sin nada seleccionado aparecen los **Ajustes del sitio** (contacto, menú, SEO, intro de carga).
- Formato en textos largos: `**negrita**` y `*acento serif*`.
- **Guardar borrador** no cambia el sitio · **Vista previa** lo muestra solo a quien tiene sesión ·
  **Publicar** lo pone en línea al instante. Cada publicación queda en **Revisiones**.

El orden de las secciones, el diseño y las animaciones se cambian en código
(`src/blocks/landing.ts` define el orden; los componentes están en `src/components/`).
Si se agrega un campo nuevo a una sección: tipo en `src/blocks/types.ts`, valor original en
`src/content/defaults.ts`, campo del editor en `src/editor/config.tsx` y uso en el componente.

## Base de datos

```bash
npm run db:generate   # tras cambiar src/db/schema.ts
npm run db:migrate    # aplica migraciones (usa DATABASE_URL)
```

## QA

Con el servidor de desarrollo corriendo:

```bash
npm run qa -- http://localhost:3000      # login, editor, ajustes, medios, revisiones, consola
npm run screens -- capturas http://localhost:3000   # capturas para comparar antes/después
node scripts/screens.mjs --diff capturas-antes capturas-despues
```

La QA solo se corre en local (provoca a propósito el bloqueo de login por intentos fallidos).

## Imágenes

Las originales están en `public/img/`. Las nuevas se suben desde **/admin → Medios** a Vercel Blob
(se reducen a 2400 px y se convierten a WebP en el navegador).

El plan original del sitio está en `PROYECTO.md`; el del panel, en `ADMIN-PANEL.md`.
