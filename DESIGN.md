# DESIGN.md

> DECISIÓN DE DISEÑO: Este documento consolida la guía visual de ASTAVIC Sorteos. Actúa como contrato de diseño frente al código actual y deberá actualizarse con cada cambio significativo en estilos o componentes UI.

## 1. Fundamentos de identidad

### 1.1 Paleta principal
| Token | Hex | Uso principal |
| --- | --- | --- |
| `--brand-25` | `#f5faff` | Neblina de fondos en bloques destacados y gradientes iniciales. |
| `--brand-50` | `#eaf4ff` | Fondos sutiles, estados hover claros y contornos suaves. |
| `--brand-100` | `#d7eaff` | Bordes de tarjetas, iconografía suave y rellenos secundarios. |
| `--brand-200` | `#b6d7ff` | Delineados más notorios (marcas, iconos). |
| `--brand-300` | `#8fbefa` | Gradientes y fondos de componentes resaltados. |
| `--brand-400` | `#68a7ef` | Transiciones de botones y badges. |
| `--brand-500` | `#4ea4ea` | Bordes activos, enlaces primarios. |
| `--brand-600` | `#2d7ed1` | Botones primarios, acentos y contadores. |
| `--brand-700` | `#0f4d9e` | Texto destacado, títulos y estados activos. |
| `--brand-800` | `#0a3a85` | Hover intensos, overlays de énfasis. |
| `--brand-900` | `#072b63` | Contraste máximo en fondos oscuros.

### 1.2 Superficies y neutrales
- `--surface`: `#ffffff` para tarjetas y layout base.
- `--surface-elevated`: `#ffffff` con sombras para modales y paneles.
- `--surface-raffle`: gradiente `linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)` para tarjetas de sorteo.
- Fondo general `#f3f6fb` y capa `--surface` en `body` aseguran contraste WCAG AA.
- Bordes: `--border` (`rgba(15, 40, 105, 0.16)`), `--border-strong` (`rgba(15, 40, 105, 0.22)`).

### 1.3 Estados de feedback
- Éxito: `--success` `#1f9d5a`, variaciones `#047857`–`#059669` en toasts.
- Error/Peligro: `--danger` `#c03434`, variantes `#b91c1c`–`#dc2626`.
- Advertencia: paleta ámbar `#b45309` con fondos `#fef3c7`.
- Información: azules `#1d4ed8` con fondo `#eaf4ff`.

### 1.4 Gradientes y efectos
- Botón primario: `linear-gradient(180deg, var(--brand-600) 0%, #1e66b7 100%)`.
- Botón oro: `linear-gradient(180deg, #f7d774 0%, #e9b949 100%)`.
- Tarjeta de sorteo: gradiente ambiental más brillo radial superior.
- Overlays: header `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)`; modales y drawer con fondos semitransparentes `rgba(11,25,54,0.5)`.

## 2. Tipografía
- Familia principal: `Inter` (400, 500, 600, 700) con fallback de sistema.
- Jerarquía de títulos:
  - `.section-title`: `clamp(1.4rem, 2vw + 0.5rem, 2.3rem)`.
  - `.section-title--sm`: `clamp(1.1rem, 1.5vw + 0.6rem, 1.6rem)`.
  - `.drawer__title`: `1.1rem`/700; `.modal__title`: `1.25rem`/700.
- Texto base: `1rem` con `line-height: 1.5`.
- Subtítulos frecuentes: `0.9rem–0.95rem` (`.section-subtitle`, `.modal__text`).
- Microcopy: `0.75rem–0.85rem` para leyendas, etiquetas y textos auxiliares.
- Uso de mayúsculas controlado en `.toast__title` (uppercase + `letter-spacing: 0.08em`).

## 3. Tokens de espaciado, radio y sombra
- Radios: `--radius-sm 0.5rem`, `--radius-md 0.75rem`, `--radius-lg 1.15rem`, `--radius-xl 1.35rem`.
- Sombras: `--shadow-1` (0 12px 30px rgba(2,12,27,0.08)) para tarjetas base; `--shadow-2` y `--shadow-3` para elevaciones mayores.
- Contenedor: `--container-max 1120px` con `width: min(var(--container-max), 100% - 2rem)`.
- Separaciones secciones: `.section-gap` `2.2rem`, variante compacta `1.25rem`.
- Gutters frecuentes: `gap` de `0.5rem–1.5rem` en grids y toolbars.
- Safe areas móviles: variables `--safe-area-*` para drawer y header.

## 4. Layout, grid y breakpoints
- Breakpoints clave: 360px, 480px, 520px, 600px, 640px, 720px, 768px, 920px, 960px, 1080px.
- Grillas:
  - `.grid-raffles`: 1 columna, 2 desde 640px, 3 desde 960px.
  - Formularios `.form-grid.split`: 2 columnas ≥640px.
  - Layout admin: columnas desbalanceadas ≥960px.
  - Toolbars móviles pasan a flex/columnas según 520px y 720px.
- Drawer lateral ancho máximo `min(680px, 100%)`, con resize handle activo ≥768px.
- Toasts flotantes en esquina inferior derecha; full width en móviles (`@max 600px`).

## 5. Componentes clave

### 5.1 Header y navegación
- Header sticky con fondo translúcido y borde `rgba(15,40,105,0.08)`.
- Variante branding oscura `#031735` con nav en tonos `rgba(234,244,255,0.75)` y focos accesibles (outline interno+externo).
- Menú móvil portaleado: overlay `rgba(3,12,35,0.55)`, panel `min(320px, 84vw)`.

### 5.2 Botones
- Base `.button`: padding `0.6rem 1.05rem`, `gap 0.45rem`, transición suave y `border-radius: 0.9rem`.
- Estados activos `:active` con `translateY(1px)`; microinteracción hover `translateY(-1px)`.
- Variantes: `--primary`, `--gold`, `--ghost`, `--subtle`. Focus visibles `outline` específicos (ej. oro `3px` ámbar).

### 5.3 Tarjetas
- `.card` y `.raffle-card` comparten esquinas `var(--radius-xl)` y brillos radiales `::before`.
- Raffle cards definen `--raffle-accent` dinámico para estados (`--soon` ámbar, `--live` verde, `--finished` malva) y flip interactivo de premios/ganadores.
- `.card-actions` con layout responsive (grid 2 columnas >768px a 1 en móvil).

### 5.4 Formularios
- `.form-group` columna con `gap 0.35rem`, labels `0.85rem`/500.
- Inputs y selects `padding 0.6rem 0.8rem`, focus `box-shadow` azul `0 0 0 3px rgba(78,164,234,0.2)`.
- Errores `color: var(--danger)` (`0.85rem`), mensajes éxito en verde.

### 5.5 Toasts y mensajes
- Toasts `grid` 3 columnas, acento lateral `::before` de 10px.
- Variantes `--success`, `--error`, `--warning`, `--info` con fondos y bordes específicos.
- Botón cerrar semitransparente con focus `outline: 2px solid currentColor`.

### 5.6 Modales y drawer
- Modal centrado `padding: 1.5rem`, `z-index` tokens (`--layer-modal 1200`).
- Drawer: layout flex column, scroll interno en `.drawer__content`, footer con botones expandibles en móviles (`grid 2 columnas` ≤520px).

### 5.7 Footer
- Variante clara (`footer` base) y brand (`.app-footer--brand`), con grilla responsiva ≥640px.
- Enlaces `padding 0.25rem 0.35rem`, foco/hover con fondo translúcido.

### 5.8 Etiquetas y chips
- `.tag` fondo `var(--brand-50)` y borde inset; `--neutral` con neutrales.
- `.pill` y `.chip` en admin reutilizan bordes `rgba(13,71,161,0.14)` y tipografía `0.82rem`/600.

### 5.9 Guía de participación y contenido
- Tarjetas de pasos con `padding 1.2rem` y `counter-reset`, grid 2 columnas ≥768px.
- `ParticipationGuide` utiliza `color-mix` para degradar fondos.

### 5.10 Animaciones y microinteracciones
- Prefiere animaciones `fade-in`, `fade-up`, `scale-in`, `pop`, `blur-in` condicionadas a `prefers-reduced-motion`.
- Stagger `.stagger` secuencia 0.03s–0.27s.
- Confeti `@keyframes confetti-fall` para celebraciones.

## 6. Accesibilidad e interacción
- Enlace de salto `.skip-link` con outline blanco `3px` y `z-index` alto para teclado.
- Clases `.sr-only` / `.visually-hidden` para soporte lector de pantalla.
- Nav y botones definen estados `:focus-visible` consistentes (outline, box-shadow).
- Contrastes verificados mediante uso de paletas claras/obscuras y sombras.
- Drawer y modales bloquean scroll (ver hook `useBodyScrollLock`) y usan tokens de capa.

## 7. Riesgos y observaciones
- Doble definición de tokens `:root` (en `index.css` y `App.css`) puede divergir; mantener sincronía o centralizar.
- Gradientes y `color-mix` requieren compatibilidad moderna; definir degradación para navegadores heredados si surge necesidad.
- Dependencia en `backdrop-filter` en header/overlay: proveer fallback (ya existe fondo sólido, mantenerlo actualizado).

## 8. Sugerencias de evolución
- Centralizar tokens en un archivo CSS o Theme provider para evitar divergencias y facilitar escalado hacia theming oscuro.
- Documentar componentes admin avanzados (editable lists, tablas) con maquetas si se agregan estados nuevos.
- Considerar un storybook o catálogo visual que consuma estos tokens para validar consistencia antes de releases.
