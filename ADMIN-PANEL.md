# Admin Panel tipo Elementor — Plan e implementación
### Landing de Ana Aguirre · Next.js 16.4 + React 19.3 + GSAP + Lenis + Puck

> **Estado:** construido y verificado · commit `8093309` en `admin-panel` · Neon (`ana-db`) y Blob (`ana-media`) conectados a Vercel, tablas creadas y admin creado · preview lista · **falta pasar a producción** (sección 9, pasos 5–7).
> Este archivo se actualiza al terminar cada fase (tablero en la sección 1).

---

## 0. Decisiones aprobadas

| Tema | Decisión |
|---|---|
| **Motor del editor** | **Puck** (`@puckeditor/core`, MIT), versión fijada **0.23.0** (0.24.0 salió el 2026-10-29; se espera a que madure). |
| **Libertad** | **Solo edición.** Se edita el contenido de lo que ya existe: textos, imágenes, listas, links, datos de contacto y SEO. **No** se agregan, mueven, duplican ni borran secciones desde el panel; eso se hace con código. |
| **Páginas** | Solo la landing (`/`). |
| **Usuarios** | Una sola cuenta: **Ana como admin**. Cualquier otro cambio lo hacemos en código. Sin roles. |
| **Base de datos** | **Neon Postgres** (Marketplace de Vercel) + **Drizzle ORM**, driver `postgres`. En local: Postgres 14 de Homebrew. Todo queda en GitHub (`ElBeDev/ana`) + Vercel. |
| **Archivos** | **Vercel Blob** público, con subida directa desde el navegador. |
| **Entrega** | Todo junto (F0–F6), actualizando este archivo y re-verificando cada fase al terminarla. |

**Fuera de alcance (se hace en código):** agregar/mover/quitar secciones, páginas nuevas, colores y tipografías, más usuarios o roles, plantillas, CSS por bloque.

---

## 1. Tablero de avance

| Fase | Contenido | Estado |
|---|---|---|
| F0 · Spike | Puck instalado y compatible, API revisada, entorno local | ✅ |
| F1 · Infra | BD + migraciones, auth, `proxy.ts`, login, layout del admin, seed | ✅ |
| F2 · Contenido a props | Componentes reciben props, contenido sale de la BD con caché, sin cambios visuales | ✅ |
| F3 · Editor | Puck solo-edición, campos, lienzo con estilos reales, borrador, vista previa, publicar | ✅ |
| F4 · Medios | Subida a Blob, biblioteca, selector de imagen, alt | ✅ (Blob real se prueba al desplegar) |
| F5 · Ajustes del sitio | Identidad, contacto, SEO, navegación, loader, WhatsApp | ✅ |
| F6 · Revisiones y cierre | Historial + restaurar, cambio de contraseña, dashboard, QA e2e, documentación | ✅ (el despliegue lo haces tú: sección 9) |

Leyenda: ⏳ pendiente · 🔧 en curso · ✅ hecho y verificado

---

## 2. Diagnóstico del sitio (punto de partida)

- **Next.js 16.4.3** con `cacheComponents: true` y `partialPrefetching: true`. **React 19.3**, **Tailwind 4**, **GSAP 3.15** (ScrollTrigger + SplitText), **Lenis**.
- Una sola página (`src/app/page.tsx`): Loader, Motion, Cursor, Nav, 9 secciones, footer de contacto y WhatsApp flotante.
- Sin BD, sin auth, sin API. Contenido en `src/content/site.ts` y textos fijos dentro de los componentes.

**Textos fijos que se vuelven editables:**

| Componente | Qué tiene fijo |
|---|---|
| `Hero.tsx` | Título sans/serif, párrafo, etiqueta derecha, CTA, imágenes A/B (desktop y móvil), alt |
| `Sections.tsx › Intro` | Etiqueta, texto grande con acento serif |
| `Sections.tsx › Process` | Título |
| `Sections.tsx › Noise` | 6 imágenes del "ruido", textos, imagen revelada |
| `Sections.tsx › About` | Foto, etiqueta, título, bio, CTAs |
| `Sections.tsx › Organizations` | Título, nota |
| `Sections.tsx › Education` | Títulos de bloque |
| `Experience.tsx` | Título, periodo, textos de botones |
| `Services.tsx` | Título, contador, arte decorativo de cada panel (cronograma, código, cursos) |
| `Contact.tsx` | Imágenes (B/N + ciclo), frase, botón, copyright, nombre gigante |
| `Nav.tsx` | Links, CTA |
| `Loader.tsx` | 3 imágenes, wordmark |
| `layout.tsx` | Description, keywords, JSON-LD |

**Por qué solo-edición es lo correcto aquí:** `Motion.tsx` anima buscando `.noise`, `.process`, `.marquee` y `data-*` en el DOM, una vez al montar. Las secciones tienen coreografías únicas (lente WebGL, máscara "A" con 320svh de scroll). Mover o duplicar secciones las rompería.

---

## 3. Arquitectura

```
┌──────────────────────────── Navegador ─────────────────────────────┐
│  /admin/editor  (Puck, client)          /   (sitio público, RSC)    │
│  · panel Estructura (sin arrastrar)     · renderLanding(publicado)  │
│  · iframe con los componentes reales    · Motion / Lenis / Cursor   │
│  · panel de campos                                                  │
└──────────┬─────────────────────────────────────────▲───────────────┘
           │ Server Actions                          │ 'use cache' + cacheTag('landing')
           ▼                                         │
   ┌──────────────────────┐   updateTag('landing')   │
   │ src/lib/content.ts   │──────────────────────────┘
   │ src/lib/auth.ts      │
   └──────┬────────┬──────┘
          ▼        ▼
     Postgres     Vercel Blob
   (Neon / local)
```

### 3.1 Un solo documento
Todo el contenido es **un documento Puck** (`Data`):

```ts
{
  root:    { props: SiteSettings },   // identidad, contacto, SEO, nav, loader, WhatsApp
  content: [                          // orden fijo, definido en código
    { type: "Hero",          props: {...} },
    { type: "Intro",         props: {...} },
    { type: "Experience",    props: {...} },
    { type: "Services",      props: {...} },
    { type: "Process",       props: {...} },
    { type: "Noise",         props: {...} },
    { type: "About",         props: {...} },
    { type: "Organizations", props: {...} },
    { type: "Education",     props: {...} },
    { type: "Contact",       props: {...} },
  ]
}
```

- Los **ajustes del sitio** van en `root`: en Puck aparecen al no tener ningún bloque seleccionado.
- **Orden fijo:** `LANDING_BLOCKS` en código. Al guardar, el servidor rechaza cualquier documento cuyo `content` no tenga exactamente esos tipos en ese orden.
- **Formato de texto:** `**negrita**` y `*acento serif*` (la firma visual: palabra en Instrument Serif dentro de un título). Se renderiza con React, nunca como HTML.
- **Imágenes:** URL (de Blob o de `/img/...`) elegidas desde la biblioteca.
- **Respaldo:** `src/content/defaults.ts` arma el documento inicial desde `site.ts` + los textos fijos actuales. Si la BD no responde o está vacía, el sitio usa ese respaldo.

### 3.2 Rutas
```
src/app/
├── layout.tsx                   ← <html>, fuentes (fonts.ts), bootScript, metadataBase
├── page.tsx                     ← landing: getLanding() + metadata + JSON-LD + barra de vista previa
├── admin/
│   ├── layout.tsx               ← admin.css, noindex
│   ├── actions.ts               ← logout (también apaga la vista previa)
│   ├── media-actions.ts         ← Server Actions de la biblioteca
│   ├── login/                   ← page, LoginForm, actions
│   ├── preview/route.ts         ← activa/desactiva Draft Mode (requiere sesión)
│   ├── editor/                  ← page (Puck a pantalla completa, fuera del layout con menú) + actions
│   └── (protected)/
│       ├── layout.tsx           ← menú lateral + requireAdmin() dentro de Suspense
│       ├── page.tsx             ← dashboard
│       ├── medios/page.tsx
│       ├── revisiones/          ← page, RestoreButton, actions
│       └── cuenta/              ← page, PasswordForm, actions
├── api/upload/route.ts          ← handleUpload de @vercel/blob/client
src/proxy.ts                     ← verifica la firma de la cookie en /admin/* y /api/upload
```

### 3.3 Código nuevo
```
src/
├── blocks/
│   ├── types.ts                 ← props de cada sección y SiteSettings
│   ├── landing.ts               ← LANDING_BLOCKS (orden fijo) y nombres en español
│   ├── components.ts            ← tipo de sección → componente
│   ├── context.tsx              ← LandingProvider, useSettings, useBlock, useContactHref
│   └── render.tsx               ← <Landing>: secciones + loader, nav, cursor, WhatsApp
├── content/
│   ├── site.ts                  ← url, zona horaria, contactHref()
│   └── defaults.ts              ← contenido original (seed + respaldo)
├── editor/
│   ├── config.tsx               ← config de Puck: campos de cada sección + root
│   ├── Editor.tsx               ← <Puck> solo-edición, header, autoguardado, lienzo
│   ├── fields.tsx               ← text, area, num, yesNo, image, lines
│   ├── MediaField.tsx           ← campo de imagen con biblioteca en modal
│   ├── MediaLibrary.tsx         ← biblioteca (página y selector)
│   ├── upload.ts                ← reducir/convertir y subir (Blob o local)
│   └── editor.css
├── db/ schema.ts · index.ts
├── lib/
│   ├── auth.ts                  ← sesión, requireAdmin, login con límite, changePassword
│   ├── session-token.ts         ← token firmado (también lo usa proxy.ts)
│   ├── password.ts              ← scrypt
│   ├── content.ts               ← getLanding (caché), getEditorState, saveDraft, publishLanding, revisiones
│   ├── media.ts                 ← biblioteca, subida local, uso, borrado
│   ├── validate.ts              ← estructura fija + forma + URLs seguras
│   └── inline.tsx               ← **negrita** / *serif* / saltos de línea
scripts/
├── seed.ts                      ← admin + imágenes de public/img en la biblioteca
├── screens.mjs                  ← capturas y diff visual
└── qa/                          ← all, console, editor, settings, media, admin, auth
drizzle/0000_init.sql            ← migración inicial
.env.example
```

## 4. Modelo de datos

```
admin_users     id, email (único), name, password_hash, created_at, last_login_at
content         id = 'landing', draft jsonb, published jsonb,
                draft_updated_at, published_at
revisions       id, data jsonb, kind ('publish'|'restore'), note, created_at
media           id, url, pathname, filename, content_type, size, width, height, alt, created_at
login_attempts  id, key (ip|email), success, created_at
```

---

## 5. Editor (Puck en modo solo-edición)

- `permissions = { insert: false, drag: false, duplicate: false, delete: false, edit: true }`.
- La barra izquierda muestra **Estructura** (árbol para saltar a una sección) y **Ayuda** (cómo editar, formato de texto); el cajón de componentes no existe. Los textos se editan en el panel derecho (la edición directa en el lienzo se desactivó, ver bitácora F3).
- **Lienzo:** iframe de Puck con `globals.css` y fuentes del sitio; los bloques son los componentes reales.
- **Modo editor de las animaciones:** dentro del editor no corre Loader, Lenis, cursor ni reveals (se ve el estado final, como con movimiento reducido), así el texto nunca está invisible mientras se edita.
- **Header propio:** Guardar borrador · Vista previa · Publicar, más indicador de "cambios sin guardar" y salir.
- **Autoguardado** del borrador cada 30 s si hay cambios.
- **Viewports:** desktop 1440, tablet 991, móvil 390.

### 5.1 Campos por bloque

| Bloque | Campos editables |
|---|---|
| **Hero** | Título sans, título serif, etiqueta izq., párrafo, etiqueta der., texto del CTA, imágenes A y B (desktop y móvil), alt |
| **Intro** | Etiqueta, texto (con `*serif*`), título de las cifras, cifras (antes, valor, después, etiqueta) |
| **Experiencia** | Título, periodo, tarjetas (org, periodo, imagen, título, texto de la tarjeta, texto del detalle, alcance destacado, puestos → título y periodo para la trayectoria de "Sobre mí"), textos de botones |
| **Servicios** | Título, contador, paneles (número, título, detalles, CTA, mensaje de WhatsApp, imagen, nota, animación decorativa) y textos de las animaciones (cronograma/KPI, código, cursos con %) |
| **Cómo trabajo** | Título (con `*serif*`), texto bajo el título, pasos (título, texto) |
| **Ruido** | Texto del ruido, imágenes del ruido (6), imagen revelada, texto revelado sans/serif |
| **Sobre mí** | Foto, alt, etiqueta, título, bio (párrafos con `**negrita**`), skills, CTA |
| **Organizaciones** | Título, fila 1, fila 2, nota |
| **Formación** | Título, filas (programa, institución, año), herramientas, competencias |
| **Contacto** | Imagen B/N, imágenes del ciclo, frase, botón, copyright, nombre gigante |
| **Ajustes (root)** | Identidad (nombre, nombre completo, rol, descriptor, tagline, headline), contacto (WhatsApp, correo, LinkedIn, mensaje general), SEO (título, descripción, keywords), navegación (links + CTA), loader (imágenes), WhatsApp flotante on/off |

---

## 6. Publicación, caché y vista previa

- `getLanding()` usa `'use cache'` + `cacheTag('landing')` + `cacheLife('max')`. El sitio sigue siendo estático.
- **Publicar** (Server Action): `requireAdmin()` → validar → guardar `published` + revisión → `updateTag('landing')` (el siguiente visitante ve el cambio).
- **Vista previa:** `/admin/preview` (con sesión) activa `draftMode()` y redirige a `/`. Con Draft Mode, la página lee `draft`. Barra "Vista previa del borrador · Salir".
- `generateMetadata` y el JSON-LD salen de `root.props`.

---

## 7. Seguridad

| Punto | Implementación |
|---|---|
| Contraseña | `scrypt` (`node:crypto`) con sal; `timingSafeEqual` |
| Sesión | Cookie `httpOnly`, `secure`, `sameSite=lax`, firmada con HMAC (`SESSION_SECRET`), expira en 7 días |
| Protección | `proxy.ts` (rápido) + `requireAdmin()` en el layout protegido, en cada Server Action y en `/api/upload` |
| Fuerza bruta | 5 intentos fallidos por IP o correo en 15 min |
| Validación | Estructura fija; strings recortados y con límite; URLs solo `https:`, `http:`, `mailto:`, `#` y rutas `/` |
| Texto | Sin HTML: formato propio renderizado por React |
| Subidas | Solo imágenes (JPG, PNG, WebP, AVIF), máx. 8 MB, token emitido solo con sesión |
| Admin | `noindex`, fuera del sitemap |

**Variables de entorno:** `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (solo para el seed). Nunca en el repo.

---

## 8. Fases: qué incluye cada una y cómo se verifica

### F0 · Spike ✅
- [x] Puck `0.23.0` instalado (`--save-exact`), peer deps `react ^18 || ^19` → compatible con React 19.3
- [x] API revisada en los tipos del paquete: `permissions` (insert/drag/duplicate/delete/edit), campos `text/textarea/array/object/select/radio/custom`, `overrides` (`drawer`, `header`, `headerActions`…), `iframe`, `viewports`, `onChange`/`onPublish`, `root` fields
- [x] Entorno local: Postgres 14 (Homebrew, BD `ana_dev`), Playwright 1.63, `scripts/screens.mjs` y capturas base del sitio actual (dos corridas idénticas: 0.000 % de diferencia)

### F1 · Infra ✅
- [x] Esquema Drizzle (`src/db/schema.ts`) + migración `drizzle/0000_init.sql` aplicada en local
- [x] `src/lib/password.ts` (scrypt + timingSafeEqual), `src/lib/session-token.ts` (token firmado HMAC con expiración), `src/lib/auth.ts` (`getAdmin`, `requireAdmin`, `login`, `logout`)
- [x] Límite de intentos: 5 fallos por IP o por correo en 15 min (`login_attempts`)
- [x] `src/proxy.ts` protege `/admin/*` (excepto `/admin/login`) y `/api/upload`, verificando la firma del token
- [x] Login con `useActionState`, logout, layout protegido con `Suspense` + `requireAdmin()`, estilos en `admin.css` (todo bajo `.adm`)
- [x] `npm run seed` crea/actualiza el admin desde `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [x] Verificado con `scripts/qa/auth.mjs` (Playwright): sin sesión → redirige · contraseña mala → error · buena → dashboard · cookie httpOnly + SameSite=Lax · cookie manipulada → rechazada · salir → cierra sesión · bloqueo tras 5 fallos. `next build` y `eslint` sin errores.

### F2 · Contenido a props ✅
- [x] `src/content/defaults.ts` con todo el contenido original (incluidos los textos que estaban fijos en los componentes); `site.ts` queda solo con `url`, `timezone` y `contactHref()`
- [x] Todos los componentes reciben props; ajustes del sitio y datos cruzados (p. ej. la trayectoria de "Sobre mí" sale de Experiencia) llegan por `LandingProvider` (`src/blocks/context.tsx`)
- [x] `src/blocks/render.tsx` (`<Landing>`) + `src/app/page.tsx` leyendo `getLanding()` con `'use cache'` + `cacheTag('landing')` + `cacheLife('max')`; respaldo a `defaults.ts` si no hay BD, no hay registro o falla la lectura
- [x] `generateMetadata` y JSON-LD salen del documento; preload del hero con las imágenes del documento
- [x] `src/lib/validate.ts`: estructura fija + forma de cada valor según el contenido original + URLs seguras (imágenes inválidas conservan la original)
- [x] Verificado: capturas desktop/móvil vs. base → 0.012 % / 0.004 % (solo suavizado subpíxel de texto, revisado a ojo) · `/` sigue estático (revalidate 30d) · sin errores de consola con animaciones (`scripts/qa/console.mjs`) · un publicado modificado en la BD aparece en la página y una URL `javascript:` se descarta · `next build`, `tsc` y `eslint` sin errores

### F3 · Editor ✅
- [x] `src/editor/config.tsx`: los 10 bloques con sus campos (+ ajustes del sitio en `root`, que se usarán en F5); listas cortas con campo "uno por línea"; listas de diseño con tamaño fijo (4 servicios, 4 pasos, 6 imágenes del ruido, 3 del loader)
- [x] `src/editor/Editor.tsx`: `permissions` sin insertar/arrastrar/duplicar/borrar, panel izquierdo con **Estructura** + **Ayuda** (reemplaza el cajón de bloques), UI traducida con `dictionary`, viewports desktop/tablet/móvil
- [x] Lienzo con los componentes reales, fuentes del sitio y modo "estado final" (`html.reduced`) para que nada esté oculto mientras se edita; en el lienzo, las secciones leen el documento vivo vía `createUsePuck`
- [x] Header propio: estado (cambios sin guardar / guardado / publicado), Guardar borrador (y `Ctrl/Cmd+S`), Vista previa ↗, Publicar (con confirmación), Salir; autoguardado cada 30 s; aviso al salir con cambios sin guardar
- [x] Server Actions `saveDraftAction` / `publishAction` con `requireAdmin()`; publicar usa `updateTag('landing')`; `/admin/preview` activa Draft Mode y la landing muestra una barra "Vista previa del borrador · Salir"; cerrar sesión apaga la vista previa
- [x] Verificado con `scripts/qa/editor.mjs` (Playwright): el lienzo carga · editar un campo actualiza el lienzo en vivo · marca cambios sin guardar · no hay acciones de duplicar/borrar · guardar borrador no toca el sitio público · vista previa muestra el borrador y se puede salir · publicar actualiza el sitio al instante · persiste al recargar · sin errores de JS. Además: vista móvil revisada a ojo, campo de listas probado escribiendo, el autoguardado guardó un borrador en una corrida larga, y el bundle de `/` no incluye Puck. `next build`, `tsc` y `eslint` sin errores.

### F4 · Medios ✅
- [x] `/api/upload` con `handleUpload`: token solo con sesión, solo JPG/PNG/WebP/AVIF, máx. 8 MB, sufijo aleatorio. El navegador sube directo a Blob y luego `registerMediaAction` guarda la fila (solo acepta URLs de `*.blob.vercel-storage.com`)
- [x] Antes de subir, el navegador reduce la imagen a 2400 px por lado y la pasa a WebP si es grande o es un JPG/PNG pesado
- [x] Biblioteca (`/admin/medios`): subir varias, buscar, editar alt, copiar URL, quitar (bloqueado si la imagen se usa en el borrador o en lo publicado; en Blob también borra el archivo)
- [x] `MediaField` en el editor: vista previa + "Cambiar imagen" (biblioteca en modal, con subida) + URL manual
- [x] `npm run seed` registra las 23 imágenes originales de `public/img` en la biblioteca
- [x] Sin token de Blob (solo desarrollo) se sube a `public/uploads/` (ignorado en git) por Server Action
- [x] Verificado con `scripts/qa/media.mjs`: 23 originales listadas · JPG de 3600×2400 → WebP 2400×1600 · alt persiste · elegida en el editor aparece en el lienzo · no se puede quitar en uso · sin uso se quita. Capturas de la biblioteca y del modal revisadas. `next build`, `tsc`, `eslint` sin errores.
- [ ] **Pendiente para el despliegue:** probar la subida real a Vercel Blob y que el lente WebGL del hero cargue una imagen de Blob (CORS). Si Blob no enviara CORS, el hero sigue mostrando la foto; solo no corre el efecto del lente.

### F5 · Ajustes del sitio ✅
- [x] Campos en el `root` de Puck (aparecen con nada seleccionado, título "Ajustes del sitio"): Identidad (nombre, nombre completo, puesto, descriptor, frase, titular de LinkedIn), Contacto (WhatsApp, correo, LinkedIn, mensaje general), Botón flotante de WhatsApp (sí/no), Menú (links + botón), SEO (título, descripción, palabras clave), Intro de carga (nombre sans/serif, 3 imágenes)
- [x] Metadata (`<title>`, description, keywords, Open Graph, Twitter) y JSON-LD `Person` salen del documento (hecho en F2)
- [x] El WhatsApp se limpia a solo dígitos al guardar y también al armar los links (el lienzo ya muestra el link correcto mientras se escribe)
- [x] Verificado con `scripts/qa/settings.mjs`: con nada seleccionado aparecen los ajustes · nuevo WhatsApp y texto del menú se ven en el lienzo · al publicar cambian `<title>`, botón flotante, CTAs, LinkedIn del footer y `sameAs` del JSON-LD · número guardado limpio · valores originales restaurados. El sí/no del botón flotante refleja el valor guardado y responde al clic. `next build`, `tsc`, `eslint` sin errores.

### F6 · Revisiones y cierre ✅
- [x] **Revisiones** (`/admin/revisiones`): cada publicación guarda una copia; la última se marca "En línea"; "Restaurar al borrador" copia una versión al borrador sin tocar el sitio (para verla: Vista previa desde el editor)
- [x] **Cuenta** (`/admin/cuenta`): cambiar contraseña (pide la actual, mínimo 10 caracteres, confirmación)
- [x] **Dashboard**: estado del sitio (última publicación) y del borrador (cambios sin publicar o igual a lo publicado), accesos rápidos y pendientes (sin WhatsApp, correo o LinkedIn; o si nunca se ha publicado desde el panel)
- [x] **QA e2e** con `npm run qa -- http://localhost:3000` (Playwright): 37 comprobaciones en 6 suites, todas en verde. Diff visual final del sitio público vs. el original: 0.016 % desktop / 0.004 % móvil (suavizado de texto)
- [x] `README.md` actualizado (desarrollo, edición, BD, QA), `.env.example` (y `!.env.example` en `.gitignore`)
- [x] `next build`, `tsc` y `eslint .` sin errores ni avisos
- [ ] Despliegue en Vercel con Neon + Blob → **lo haces tú** con los pasos de la sección 9 (la CLI de Vercel no conecta desde esta máquina)

---

## 9. Despliegue en Vercel

Hecho el 2026-11-01: pasos 1–4 (Neon `ana-db`, Blob público `ana-media`, `SESSION_SECRET` en Production/Preview, migración y seed contra Neon) y preview desde `admin-panel`. Desde esta máquina la CLI de Vercel necesita un proxy local porque abrir conexión con api.vercel.com tarda ~20 s (la CLI se rinde a los 10 s).

1. **Neon:** en el proyecto de Vercel → *Storage* / *Marketplace* → **Neon** → crear y conectar a todos los entornos (o `vercel integration add neon`). Agrega `DATABASE_URL` (con pooler; el código usa `prepare: false`, compatible).
2. **Blob:** *Storage* → **Blob** → crear un store **público** y conectarlo. Agrega `BLOB_READ_WRITE_TOKEN`.
3. **Variable propia:** `SESSION_SECRET` (genera con `openssl rand -hex 32`) en Production y Preview.
4. **En tu máquina:** `vercel env pull .env.local`, agrega `ADMIN_EMAIL` y `ADMIN_PASSWORD` (la contraseña que tendrá Ana, mín. 10 caracteres) y corre:
   ```bash
   npm run db:migrate
   npm run seed
   ```
5. **Desplegar:** commit y push de `admin-panel` (preview) → revisar → merge a `main`.
6. **En producción:** entrar a `/admin` → Editor → **Publicar** una vez (a partir de ahí el sitio sale de la BD).
7. **Probar en producción:** subir una imagen en Medios, ponerla en el Hero (foto que revela el cursor), publicar y confirmar que el lente WebGL funciona (CORS de Blob). Después, cambiar la contraseña desde Cuenta si hace falta.

> **Cambios de contenido hechos en código:** como el sitio lee lo publicado en la BD, después de cambiar `defaults.ts` hay que copiar esas secciones a la BD: `npm run content:sync -- <Bloque|Bloque.campo>...` (muestra qué cambiaría) y luego con `--apply`. Se ve en el sitio tras el siguiente despliegue.

> **Dominio:** `ana-aguirre.com` (registrado en Hostinger, DNS en Hostinger). Raíz → A `216.198.79.1` y `64.29.17.1`; `www` → CNAME `43da4d532a3c1269.vercel-dns-017.com.` y en Vercel redirige 308 a la raíz. Los registros de correo de Hostinger (MX, SPF, DKIM, DMARC, autodiscover) no se tocaron. `site.url` usa el dominio fijo en Vercel (metadata, canonical, JSON-LD, `robots.txt`, `sitemap.xml`).

> Las migraciones no corren en el build a propósito (un preview sin BD no debe fallar). Si cambia `src/db/schema.ts`: `npm run db:generate` y `npm run db:migrate` contra Neon antes de desplegar.

---

## 10. Bitácora

- **2026-11-01 · F0** — Puck 0.24.0 tenía 3 días publicado; se fijó 0.23.0. La CLI de Vercel no conecta desde esta máquina (`fetch` de Node da timeout contra api.vercel.com aunque `curl` sí conecta), así que se desarrolla con Postgres local y Neon/Blob se conectan al desplegar (ver sección 9).
- **2026-11-01 · F1** — El documento de la landing no se crea en el seed sino la primera vez que se lee (evita importar código de Next desde scripts de Node). `password.ts` no lleva `server-only` para que el seed pueda usarlo. `tsconfig` con `allowImportingTsExtensions` para que los scripts corran con Node directo.
- **2026-11-01 · F2** — Las listas simples (detalles, skills, keywords…) se guardan como `string[]`; el editor las mostrará como "una por línea". Las posiciones de las imágenes del "ruido" se quedan en código (son diseño); solo se editan las imágenes. El logo del nav ("ANA Aguirre") queda en código. En `Services`, el panel con scramble se identifica por `data-art="codigo"` en vez de por id. `Sections.tsx` pasa a ser client component (usa el contexto).
- **2026-11-01 · F3** — Puck copia las clases del `<html>` del panel al iframe; el lienzo las vuelve a poner con un `MutationObserver`. Puck no emite `onChange` al montar, así que "cambios sin guardar" se calcula comparando con lo último guardado. **Edición directa en el lienzo desactivada:** en el iframe era inestable y convierte los textos en nodos de React (rompe los que se parten en letras, como los botones); todo se edita desde el panel derecho. Se corrigió un salto del cursor en los campos de lista (el valor de Puck llega con retraso; ahora solo se resincroniza sin foco). Dentro de cada lista sí se puede reordenar elementos (p. ej. tarjetas de experiencia); las secciones no.
- **2026-11-01 · F4** — Las imágenes se guardan en el documento como URL (no como id de la biblioteca); al reemplazar una foto se elige otra en el campo. No se migró a `next/image`: las originales ya son WebP optimizadas y las subidas se optimizan en el navegador antes de subir; cambiarlo tocaría las animaciones de máscara/clip sin necesidad. El aviso de `onUploadCompleted` de Blob no se usa (no llega a localhost); el registro lo hace una Server Action tras la subida.
- **2026-11-01 · F5** — Los ajustes del sitio se construyeron junto con el editor (F3) porque viven en el `root` del mismo documento; F5 fue verificación. `contactHref()` limpia el WhatsApp a dígitos para que el lienzo muestre el link correcto antes de guardar.
- **2026-11-01 · F6** — La vista previa de una revisión concreta se resolvió como "Restaurar al borrador" + Vista previa (leer una revisión arbitraria dentro de `'use cache'` obligaría a leer cookies, que no se permite ahí). Las páginas del admin leen datos dentro de `<Suspense>` para cumplir la validación de navegación instantánea de Next 16. `getAdmin()` llama a `connection()` porque compara la expiración del token con la hora actual.
- **2026-11-01 · Contenido** — Experiencia: cada tarjeta muestra "org · periodo", título y texto; el detalle muestra título, párrafos de lo que resolvió en el puesto y "Alcance destacado" (los logros por puesto se quitaron: el CV ya está en la trayectoria de "Sobre mí", que sigue saliendo de los puestos). Cifras: título nuevo y sufijo (`15+`). "Cómo trabajo" con título y texto nuevos. Habilidades de "Sobre mí" reemplazadas por las 8 competencias. Nuevo `npm run content:sync` para pasar a la BD contenido cambiado en código.
- **2026-11-02 · Dominio** — Conectado `ana-aguirre.com` (raíz principal, `www` redirige). `site.url` deja de depender de `VERCEL_PROJECT_PRODUCTION_URL` y usa el dominio fijo; canonical `/` para que `*.vercel.app` no compita en buscadores; nuevos `robots.ts` (bloquea `/admin` y `/api/`) y `sitemap.ts`. La sesión del admin es por dominio: hay que volver a iniciar sesión en `ana-aguirre.com/admin`.
