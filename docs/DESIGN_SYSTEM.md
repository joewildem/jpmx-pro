# Design System — jpmx-pro

## 1. Purpose and scope

This document records the visual language, reusable patterns, and interaction behavior currently implemented in `jpmx-pro`. It is a reference for preserving consistency, not a proposal for a new design system or component library.

[AGENTS.md](../AGENTS.md) defines Codex operating rules. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) records architecture, content, and delivery context. This document focuses on visual foundations, layouts, components, motion, and observable accessibility measures.

## 2. Visual foundations

### Defined CSS variables

[src/styles/global.css](../src/styles/global.css) defines the following reusable variables:

| Area | Existing values |
| --- | --- |
| Color | `--bg: #111010`, `--surface: #111`, `--text: #f0f0f0`, `--muted: #a6a6a6`, `--line: rgba(255,255,255,.1)`, `--accent: #f55c1b` |
| Layout | `--gutter`, `--inner-padding`, `--hero-content-padding`, `--page` |
| Controls | `--button-font-size: 18px`, `--button-height: 48px` |
| Hero structure | `--hero-meta-height: 80px`, `--now-bar-height: 80px` |
| Fonts | `--display: 'Space Grotesk Variable'`, `--body: 'Inter Variable'`, `--mono: 'Geist Mono Variable'` |

The layout variables use `clamp()` for fluid desktop sizing and have smaller overrides below `768px`. `--page` derives the main page width from the two gutters.

### Typography and local visual values

`Space Grotesk` is the shared display face for headings, controls, the 80px desktop services statement, and default service-card titles; the opening clause of the services statement switches to regular italic `Newsreader`. `Inter` is the global body face. `IBM Plex Sans` is used locally for navigation and descriptive copy. `Geist Mono` is used for hero location and availability metadata, the current-activity and scroll-cue bar, the services eyebrow and indices, and footer eyebrow, metadata, privacy, and social labels. `Newsreader` is also used for editorial display elements such as the brand treatment, hero name, project marquee, service-card titles on hover, and footer contact link. Font files are loaded by [BaseLayout.astro](../src/layouts/BaseLayout.astro).

The stylesheet also contains intentional local values rather than additional tokens: near-white `#eee`, surfaces such as `#151515`, `#141414`, and `#222`, footer text `#aaa`, skill index `#737373`, status green `#0ccf30`, and ticker start `#ff7c48`. Do not treat them as a formal color scale without an explicit decision.

Shared visual treatments include 1px line borders, pill-shaped controls with `border-radius: 999px`, project-media radii from `14px` to `22px`, clipped media, backdrop blur in the header and project cursor, and thin grid lines aligned to the page gutter.

## 3. Layout and responsive rules

The shared `.container` uses `width: var(--page)` and automatic inline margins. Sections use top borders and `clamp(80px, 11vw, 160px)` vertical padding. The hero is a three-row viewport layout: metadata, centered main content, and a status bar. Its height uses `100svh` (with a `100vh` fallback) so collapsing tablet and mobile browser chrome does not resize the grid during the initial scroll gesture.

Confirmed responsive ranges in [src/styles/global.css](../src/styles/global.css):

| Query | Existing behavior |
| --- | --- |
| `min-width: 1280px` | Adjusts the desktop hero-title horizontal transform. |
| `max-width: 1279px` | Makes the status bar taller, changes the status/scroll cue into multi-line arrangements, and changes service cards from four to two columns. |
| `768px–1279px` | Reduces button and hero/status typography. |
| `max-width: 768px` and `max-width: 767px` | Reduces gutters, hero metadata height, hero title, description, and status typography. |
| `max-width: 809px` | Replaces desktop navigation with the mobile menu; changes projects to two columns; stacks about content and service cards into single-column layouts; adapts case-study grids. |
| `max-width: 479px` | Changes project cards to one column and further compacts buttons, hero metadata, menu, services, and footer. |
| `hover: hover` and `pointer: fine` | Hides the native cursor for interactive elements. |
| `hover: none` or `pointer: coarse` | Hides the custom cursor; the fluid canvas remains available for touch taps and continuous finger movement. |
| `prefers-reduced-motion: reduce` | Reduces global animation/transition duration and simplifies visual effects. |

Desktop project cards use an asymmetric three-column grid. At `809px` or below, they use two columns and the third card spans both columns; at `479px` or below, all cards use one column. Services use a full-width introduction followed by four cards, change to two columns below `1280px`, and stack into one column below `810px`. Case-study metadata changes from four to two columns below `809px`.

## 4. Navigation and actions

[Header.astro](../src/components/Header.astro) provides the shared header, desktop navigation, language switcher, and mobile menu. Desktop navigation has underlined hover and focus-visible states. The language switcher marks the current locale with `aria-current="page"`.

At `809px` or below, the desktop navigation is replaced by a menu button and a full-height overlay. Its open state changes `aria-expanded`, `aria-hidden`, `inert`, document scrolling, icon visibility, and CSS transitions. Escape closes the menu and returns focus to the toggle.

Buttons are CSS patterns rather than standalone component files:

| Pattern | Default appearance | Hover behavior |
| --- | --- | --- |
| `.button--primary` | Orange fill and border, near-white text | Near-white fill, dark text |
| `.button--secondary` | Transparent fill, near-white border/text | `#222` fill |
| `.button--tertiary` | Near-white fill, dark text | `#222` fill, near-white text |

All button patterns share flex alignment, a variable height, display typography, pill radius, and a `:focus-visible` outline. Button rows wrap with a 12px gap.

## 5. Page composition and patterns

The home page is composed by [HomePage.astro](../src/components/HomePage.astro): hero, availability/status bar, project marquee and cards, services, statistics ticker, and shared footer. The hero centers a large two-line display treatment, an IBM Plex description, and contact/project actions. Its location metadata presents Toluca and a Mexico City-zone clock with seconds, separated by `//`.

Projects use [ProjectCard.astro](../src/components/ProjectCard.astro). Published projects render as links with image-scale hover behavior. Draft projects render as non-linking preview articles. The home-page selection currently includes Afore Móvil, Calimax, and Dina; Dina is a draft preview without a public detail route. See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the content-routing distinction.

[AboutPage.astro](../src/components/AboutPage.astro) uses copy beside a two-image grid that stacks on smaller screens. [ProjectPage.astro](../src/components/ProjectPage.astro) uses a recurring case-study pattern: intro and metadata, full-width hero media, bordered copy blocks, gallery grids, process rows, metric grid, and optional related-project card.

[Footer.astro](../src/components/Footer.astro) is a large contact section over the visual gradient. It combines a display-scale email CTA, local-time display, and social-label pills.

## 6. Visual components

| Component or pattern | Responsibility and states | Reuse |
| --- | --- | --- |
| [BaseLayout](../src/layouts/BaseLayout.astro) | Global background, fonts, metadata shell, reveal observer, cursor layers. | All main page compositions. |
| [ProjectCard](../src/components/ProjectCard.astro) | Image, title, year, published link or draft preview state. | Home project grid. |
| [ProjectMarquee](../src/components/ProjectMarquee.astro) | Oversized editorial project label in duplicated continuous groups. | Home projects section. |
| [StatsMarquee](../src/components/StatsMarquee.astro) | Orange metrics ticker with `GlobeMark` separator. | Home page. |
| [CustomCursor](../src/components/CustomCursor.astro) | Default ring, clickable dot, accent dot, and 90px project-arrow state. | Mounted globally on fine pointers. |
| [FluidCursor](../src/components/FluidCursor.astro) | Full-viewport fluid WebGL canvas with active opacity state. | Mounted globally; mouse/pen uses continuous movement and background clicks, while touch supports both background taps and continuous finger movement. |
| [ContactGradient](../src/components/ContactGradient.tsx) | React/GradFlow visual background. | Footer only, hydrated with `client:visible`. |
| `data-reveal` | Fade-and-rise reveal pattern. | Applied across page sections and case-study content. |
| Service cards | Non-linking cards with accent numbers, regular-weight descriptions, and skill pills; fine-pointer hover fills the active card orange, changes its title to italic Newsreader, gives the pills a dark outline and text, and dims its siblings. | Home services section. |

[HugeIcon.astro](../src/components/HugeIcon.astro) renders icons from the Hugeicons package. [GlobeMark.astro](../src/components/GlobeMark.astro) is the recurring ticker separator. Component-specific styling is centralized in [src/styles/global.css](../src/styles/global.css), not colocated with the component files.

## 7. Motion and interaction

| Interaction | Trigger and behavior | Timing / technology | Device and reduced-motion handling |
| --- | --- | --- | --- |
| General reveal | `IntersectionObserver` adds `.is-visible` to `data-reveal` elements. | CSS opacity/translate transition: `.75s`; transform easing `cubic-bezier(.2,.7,.2,1)`. | Reduced motion makes the elements immediately visible. |
| Hero role scramble | On initial page entry, the visual “Senior Product Designer” line resolves from mixed-case scrambled characters to its final text. The heading keeps a stable accessible name while the visual span changes. | GSAP `ScrambleTextPlugin`: `1.4s`, `0.45s` delay, no easing, `upperAndLowerCase` characters, speed `.65`. | Runs once on both localized home pages and is skipped with reduced motion. |
| Project-card reveal | ScrollTrigger reveals project cards. | GSAP: `y: 40`, `0.6s`, `power2.out`, `.15s` stagger; starts at `top 80%`, once. | Does not run when reduced motion is set. |
| Services statement highlight | Once the complete editorial heading reaches the center of the viewport, it is pinned while scrolling progressively changes its characters from gray to near-white. The block is released after the color sequence; reversing the scroll pins it again and reverses the highlight. | GSAP ScrollTrigger with `pin`, `scrub`, character stagger `.04`, and a scroll distance of `max(110vh, 720px)`. | The visual character spans are hidden from assistive technology in favor of the complete semantic text. The pin and animation are skipped and the statement remains near-white with reduced motion. |
| Availability dot | Alternates visual opacity. | CSS `availability-pulse`, `1.3s`, `cubic-bezier(.34,1.56,.64,1)`. | Static under reduced motion. |
| Status rotator | Timed vertical changes through duplicated item list. | JavaScript timeouts: 4.5s hold, `.6s` CSS transform transition, 650ms reset timing. | Does not run with reduced motion. |
| Scroll cue | Loads a remote SVG animation. | `lottie-web`; `lottie.host` animation path. | Autoplay and loop are disabled with reduced motion. |
| Mobile menu | Overlay clipping, icon swap, and staged link/action/footer entries. | CSS; main clip transition `.65s cubic-bezier(.76,0,.24,1)`. | Global reduced-motion rule shortens transitions. |
| Service cards | Fine-pointer hover fills the active card from bottom to top, changes the title from Space Grotesk to italic Newsreader, switches pills to a dark outline and text, and lowers sibling opacity. | CSS transform `.8s cubic-bezier(.16,1,.3,1)`; sibling opacity `.32`. | Hover treatment is restricted to `hover: hover` and `pointer: fine`; global reduced-motion rules shorten the transitions. |
| Project and stats marquees | Scroll direction changes target velocity; `IntersectionObserver` controls transform updates. | Perpetual `requestAnimationFrame`; 34/44/54px/s for project marquee and 48/64/78px/s for ticker by viewport. | Initialization is skipped with reduced motion. |
| Custom cursor | Pointer movement interpolates toward the target and updates semantic visual states. | Perpetual `requestAnimationFrame`; factor `0.24`. | Fine pointer only; hidden for coarse/no-hover input. |
| Fluid cursor in `main` | Mouse/pen movement and non-interactive background clicks create fluid splats. A stationary touch tap creates an impulse, while continuous finger movement feeds the same fluid trail without preventing the page's native scroll. Interactive controls are ignored. | Dynamically imports the Three.js simulation; desktop uses the default renderer profile, while touch loads on first eligible contact with reduced render-target resolution and pressure iterations. Bloom and sunrays remain enabled, and rendering continues for up to 6.5s after input. | Available on fine and coarse pointers. Touch taps allow up to 12px movement and 700ms duration; touch listeners remain passive. Disabled by reduced motion. |
| Contact gradient | Footer gradient is mounted when visible. | React `GradFlow`, `client:visible`. | No direct reduced-motion condition is implemented in the local component. |

Background-click splats, touch-tap splats, and passive touch-drag trails are integrated behavior in `main`.

## 8. Accessibility considerations

### Implemented measures

- Semantic landmarks, headings, lists, project metadata definitions, and buttons are used across page compositions.
- Header and mobile navigation include localized labels, current-language state, `aria-expanded`, `aria-controls`, `aria-hidden`, and `inert` handling.
- The mobile menu handles Escape and returns focus to its toggle.
- Buttons, navigation links, mobile-menu links, and the footer email link have explicit focus-visible styling.
- Decorative cursor, fluid canvas, icons where appropriate, and Lottie container use `aria-hidden`; the status rotator uses `aria-live="polite"`.
- Project images use content-provided alternative text; the decorative image in a related-project card uses an empty alt value.
- A global reduced-motion rule and component-level reduced-motion checks are present. The custom cursor remains disabled for coarse pointers; the fluid canvas supports deliberate touch taps and passive touch-drag trails.

### Validation still needed

- Contrast ratios, complete keyboard traversal, focus order, and menu focus containment require browser testing.
- No explicit focus trap is implemented for the mobile menu.
- Screen-reader behavior for dynamic status text, external Lottie content, marquees, and the local-time update requires testing.
- WCAG conformance is not established by this source review.

## 9. Known findings and maintenance

### Observed findings — 2026-10-21

- CSS color, layout, and button variables exist, but many local visual values remain inline in the stylesheet; no complete formal token scale is implemented.
- `CustomCursor` and both marquee components keep their animation-frame loops scheduled after initialization. Marquees avoid transform updates while out of view, but their loops are not cancelled. This is a performance observation, not a change request.
- The Lottie animation depends on `lottie.host`. The contact gradient has no local reduced-motion check.
- The draft-preview behavior and current fluid interaction modes are documented in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

Update this document when committed work changes shared visual foundations, responsive rules, reusable components, or interactions integrated into `main`. Keep implementation workflow rules in [AGENTS.md](../AGENTS.md), and keep architecture/content behavior in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).
