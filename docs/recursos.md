# Inventario de recursos

Este documento registra las herramientas, bibliotecas, referencias y materiales utilizados durante la migración y evolución de JPMX. Se actualiza cada vez que se incorpora o se prueba un recurso nuevo.

Última actualización: 8 de octubre de 2026.

## Aplicado

Recursos que forman parte del sitio actual o influyeron directamente en una solución que continúa vigente.

| Recurso | Tipo | Uso actual | Fuente | Licencia / notas |
| --- | --- | --- | --- | --- |
| Astro | Framework | Generación estática, rutas, layouts y componentes del portafolio. | [astro.build](https://astro.build/) | MIT. Dependencia `astro`. |
| Decap CMS | CMS basado en Git | Administración de la landing y los proyectos bilingües desde `/admin`. El contenido se guarda como JSON en el repositorio. | [decapcms.org](https://decapcms.org/) | MIT. Dependencia `decap-cms-app`. |
| GitHub | Repositorio y autenticación | Control de versiones, origen del contenido de Decap y flujo OAuth del CMS. | [github.com/joewildem/jpmx-pro](https://github.com/joewildem/jpmx-pro) | Servicio externo. El código del sitio permanece en este repositorio. |
| Cloudflare Pages | Hosting y despliegue | Build y publicación automática de `main`. Entorno provisional: `jpmx-pro-site.pages.dev`; dominio final previsto: `jpmx.pro`. | [pages.cloudflare.com](https://pages.cloudflare.com/) | Servicio externo. |
| Three.js | WebGL | Capa de render utilizada por la simulación de fluidos. | [threejs.org](https://threejs.org/) | MIT. Dependencia `three`. |
| WebGL Fluid Simulation | Efecto visual | Base algorítmica del fondo fluido interactivo actual. Configuración: quality high, sim resolution 128, density diffusion 2.7, velocity diffusion 4, pressure 0.44, vorticity 0, splat radius 0.23, bloom 0.8/0.8 y sunrays 1. | [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) | MIT, © Pavel Dobryakov. La atribución está conservada en `src/lib/fluid/LICENSE`. La adaptación local vive en `src/lib/fluid/FluidSimulation.ts`. |
| Cursor personalizado JPMX | Interacción propia | Aro de 28 px por defecto; punto sólido sobre elementos clicables; punto naranja sobre botones primary y tertiary; cursor contextual de 90 px con flecha sobre proyectos; oculta el cursor nativo. | Implementación local | Lógica propia en `src/components/CustomCursor.astro` y `src/styles/global.css`; la flecha contextual usa Hugeicons. |
| Hugeicons | Iconografía | Colección Rounded Stroke aplicada a acciones, navegación móvil, cursores contextuales e iconos de redes sociales del footer. Se renderiza mediante un componente Astro local, sin requerir React para los iconos. | [hugeicons.com/docs](https://hugeicons.com/docs) | MIT. Dependencia `@hugeicons/core-free-icons`. |
| GradFlow | Fondo animado | Gradiente WebGL `silk` del footer de contacto. Configuración: colores RGB (0,0,0), (0,0,0) y (28,28,28); velocidad 0.8; escala 1; ruido 0.12. Se hidrata al aproximarse al viewport y respeta movimiento reducido. | [meerbahadin/gradflow](https://github.com/meerbahadin/gradflow) | MIT. Dependencia `gradflow`; isla React integrada mediante `@astrojs/react`. |
| Globo Techno Festival | Recurso gráfico | Separador vectorial del marquee de datos; extraído del SVG completo proporcionado para el proyecto y renderizado inline. | Archivo `396977360_11531591.svg` proporcionado por el propietario del sitio | Recurso proporcionado para este proyecto. |
| Lottie Web | Animación | Reproduce el icono animado de mouse entre “Desliza para” y “ver más”. | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | MIT. Se utiliza el player light mediante `lottie-web`. |
| Animación de mouse de Lottie Host | Recurso gráfico | Animación del indicador para seguir haciendo scroll, mostrada a 22 × 32 px. | [Archivo JSON](https://lottie.host/e35b105d-0108-437c-ad52-93e7d1d57e6f/r6YwDko1EG.json) | Recurso proporcionado para el proyecto. Conviene confirmar su autoría/licencia antes del lanzamiento definitivo. |
| Inter | Tipografía | Estilos generales de interfaz y contenido. | [Fontsource Inter](https://fontsource.org/fonts/inter) | SIL Open Font License 1.1. Paquete local `@fontsource-variable/inter`. |
| Space Grotesk | Tipografía | Títulos, metadatos del hero y labels de botones. | [Fontsource Space Grotesk](https://fontsource.org/fonts/space-grotesk) | SIL Open Font License 1.1. Paquete local `@fontsource-variable/space-grotesk`. |
| IBM Plex Sans | Tipografía | Descripción principal y navegación. | [Fontsource IBM Plex Sans](https://fontsource.org/fonts/ibm-plex-sans) | SIL Open Font License 1.1. Paquete local `@fontsource-variable/ibm-plex-sans`. |
| Newsreader | Tipografía | Marquee editorial de proyectos, nombre “Joe Palomino” en el hero y logotipo JPMX. Se utiliza la variante variable óptica en cursiva. | [Google Fonts](https://fonts.google.com/specimen/Newsreader?preview.script=Latn) / [Fontsource](https://fontsource.org/fonts/newsreader) | SIL Open Font License 1.1. Paquete local `@fontsource-variable/newsreader`. |
| Sharp | Procesamiento de imágenes | Conversión y optimización de imágenes recuperadas a WebP mediante `npm run images`. | [lovell/sharp](https://github.com/lovell/sharp) | Apache-2.0. Dependencia `sharp`. |
| Astro Sitemap | SEO técnico | Generación automática del sitemap del sitio. | [withastro/astro](https://github.com/withastro/astro/tree/main/packages/integrations/sitemap) | MIT. Dependencia `@astrojs/sitemap`. |
| Sitio original de Framer | Fuente visual y de contenido | Referencia principal para estructura, textos, imágenes, breakpoints, animaciones y comportamiento durante la migración. | [jpmx.framer.website](https://jpmx.framer.website/) | Contenido propio de JPMX. Las imágenes recuperadas están en `public/uploads/` y sus versiones optimizadas en `public/images/`. |
| Menú de Kristian Ulrych | Referencia de interacción | Inspiración para la composición y comportamiento del menú móvil. La implementación final es propia. | [ulrychkristian.cz](https://www.ulrychkristian.cz/) | Referencia visual; no se incorporó código de ese sitio. |
| Selected properties de Mejuma Tuscany | Referencia de interacción | Inspiración para el marquee de proyectos: movimiento continuo hacia la izquierda al bajar y hacia la derecha al subir. La implementación final es propia. | [mejuma-tuscany.com](https://www.mejuma-tuscany.com/) | Referencia visual; no se incorporó código ni assets de ese sitio. |
| Composición editorial de proyectos en tres columnas | Referencia visual | Inspiración aportada en la conversación para mostrar filas de tres proyectos con anchos y alturas contrastantes, nombre y año. La retícula responsive final es propia. | Imagen de referencia proporcionada para el proyecto | No se incorporó código ni assets de la referencia. |
| CV de Joe Palomino 2026 | Contenido | Documento descargable del portafolio en `public/documents/joe-palomino-resume-2026.pdf`. | Archivo proporcionado para el proyecto | Documento propio. |
| Exportación de proyectos de Framer | Contenido | Fuente inicial para los datos de Afore Móvil y Calimax y para los registros preliminares de otros proyectos. | `Projects.csv` proporcionado para el proyecto | Contenido propio; transformado a las colecciones bilingües de `src/content/projects/`. |

## Probado

Recursos evaluados o implementados temporalmente que ya no forman parte de la versión actual.

| Recurso | Qué se probó | Motivo del reemplazo | Fuente | Licencia / notas |
| --- | --- | --- | --- | --- |
| particles.js | Fondo de partículas con preset NASA y dos configuraciones JSON proporcionadas durante la iteración. | Se retiró para buscar una interacción más orgánica y fluida. | [VincentGarreau/particles.js](https://github.com/VincentGarreau/particles.js/) | MIT. Ya no es una dependencia del proyecto. |
| MagicMouse.js | Cursor con aro, punto central y estados automáticos sobre enlaces y botones. | El efecto convertía el cursor en óvalos sobre algunos componentes y resultaba difícil controlar cada estado. Se sustituyó por el cursor propio de JPMX. | [Cursor Magic Mouse](https://www.cssscript.com/cursor-magic-mouse/) | Ya no es una dependencia. Revisar su licencia si se vuelve a incorporar. |
| Cursor líquido SVG | Prototipo local con círculos SVG, blur y filtro metaball siguiendo el puntero. | Aunque era ligero, se percibía demasiado estático frente al comportamiento fluido buscado. | Implementación local | Código retirado; no utilizaba dependencias externas. |
| three-fluid-sim | Simulación de fluidos con Three.js en modo Luminance, adaptada para responder al hover en lugar del clic. | Funcionaba, pero el acabado era más sólido y menos dinámico que la alternativa actual de PavelDoGreat. | [amsXYZ/three-fluid-sim](https://github.com/amsXYZ/three-fluid-sim) | MIT, © Andrés Valencia Téllez. El código adaptado fue reemplazado. |
| Lusion | Referencia visual para explorar una interacción de mouse con apariencia liquid. | Se utilizó para definir la dirección visual, pero no se incorporó código ni assets del sitio. | [lusion.co](https://lusion.co/) | Referencia visual únicamente. |
| Composición editorial inicial de proyectos | Primera prueba con una retícula asimétrica de 12 columnas, inspirada por la imagen compartida en la conversación. | Se reemplazó por una disposición más libre inspirada en Cipher Works. | Imagen de referencia proporcionada para el proyecto | No se incorporó código ni assets de la referencia. |
| Cipher Works | Composición libre de proyectos con escalas contrastantes, offsets irregulares y espacio negativo. | Se reemplazó por filas editoriales de tres columnas para acercarse a la nueva referencia. | [cipher.tv/works](https://cipher.tv/works) | Referencia visual; no se incorporó código ni assets del sitio. |

## Regla de mantenimiento

- Todo recurso nuevo debe añadirse aquí en el mismo cambio donde se prueba o implementa.
- Un recurso comienza en **Probado** mientras se evalúa.
- Si permanece en el producto, se mueve a **Aplicado** y se documenta dónde vive su implementación.
- Si se descarta, permanece en **Probado** con el motivo de su reemplazo.
- Las licencias y atribuciones deben conservarse en el repositorio cuando la fuente lo requiera.
