# JPMX portfolio

Portfolio bilingüe de Joe Palomino construido con Astro, Decap CMS y Cloudflare Pages.

## Desarrollo local

Requiere Node 24.

```bash
npm install
npm run dev
```

Validación de producción:

```bash
npm run check
npm run build
npm run preview
```

El sitio se genera en `dist/`. Los proyectos con `draft: true` permanecen en el CMS, pero no se publican ni aparecen en el sitemap.

## Contenido

- Landing: `src/content/pages/{es,en}/home.json`
- Proyectos: `src/content/projects/{es,en}/*.json`
- Configuración del CMS: `public/admin/config.yml`
- Recursos originales: `public/uploads/`
- Recursos optimizados: `public/images/`
- CV: `public/documents/joe-palomino-resume-2026.pdf`

`npm run images` vuelve a generar las versiones WebP a partir de los recursos recuperados de Framer. Las imágenes nuevas subidas desde Decap se sirven directamente desde `/uploads`.

## Cloudflare Pages

Conecta este repositorio a Cloudflare Pages con:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24`
- Dominio principal: `jpmx.pro`

Configura `www.jpmx.pro` como dominio adicional y crea una Redirect Rule permanente hacia `https://jpmx.pro` si también quieres aceptar la versión con `www`.

## Autenticación de Decap

El panel se publica en `/admin`. Las Pages Functions de `functions/api/` implementan el flujo OAuth con GitHub.

1. En GitHub crea una OAuth App.
2. Usa `https://jpmx.pro` como Homepage URL.
3. Usa `https://jpmx.pro/api/callback` como Authorization callback URL.
4. En Cloudflare Pages añade estas variables cifradas para Production:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `OAUTH_COOKIE_SECRET`: una cadena aleatoria larga, distinta de las anteriores.
5. Vuelve a desplegar y abre `https://jpmx.pro/admin`.

Como capa adicional, crea una aplicación de Cloudflare Access para `/admin/*` y `/api/*` limitada a tus correos autorizados.

No guardes esos valores en Git, archivos locales, issues o mensajes. El acceso efectivo al CMS queda limitado a personas con permisos de escritura en `joewildem/jpmx-pro`.

## Flujo editorial

1. Entra a `/admin` con GitHub.
2. Edita la landing o un proyecto en español/inglés.
3. Guarda el contenido. Decap crea el commit en `main`.
4. Cloudflare Pages detecta el commit y publica una nueva versión.

Para preparar un proyecto sin mostrarlo, conserva `draft: true`. Cambia el campo a `false` cuando ambas versiones estén listas.
