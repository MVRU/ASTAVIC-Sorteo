# DESIGN.md

> **DECISIÓN DE DISEÑO**
> Este documento consolida la guía visual de **ASTAVIC Sorteos**. Actúa como contrato entre diseño y código. Cualquier cambio significativo en estilos o componentes UI **debe** reflejarse aquí y generar PR con revisión.
> Objetivos: consistencia, accesibilidad **WCAG 2.2 AA+**, mantenibilidad (tokens), elegancia y performance.

---

## 0) Cómo usar este documento

1. Los **tokens de diseño** viven en `src/styles/design-tokens.css`.
2. El **theme runtime** (claro/oscuro/alto-contraste) se activa con `data-theme` en `<html>` y `ThemeProvider`.
3. Los **componentes** (React) consumen sólo **tokens semánticos** (p. ej. `--color-bg-card`) y **nunca** colores “duros”.
4. La **iconografía** usa **Lucide** (outline, 1.75px). Tamaños y colores por tokens.
5. La **QA visual** se realiza en Storybook; no se mergea si no pasa **axe + Lighthouse**.

---

## 1) Identidad & Color

### 1.1 Paleta base (escala de marca)

> Nota: esta escala se usa para _mapear_ tokens semánticos. No se referencia directamente en componentes.

| Token         | Hex     | Uso sugerido                         |
| ------------- | ------- | ------------------------------------ |
| `--brand-25`  | #f5faff | Neblina de fondos, sutiles.          |
| `--brand-50`  | #eaf4ff | Fondos suaves, hover claros.         |
| `--brand-100` | #d7eaff | Bordes suaves, rellenos secundarios. |
| `--brand-200` | #b6d7ff | Delineados notorios, iconos.         |
| `--brand-300` | #8fbefa | Fondos resaltados y gradientes.      |
| `--brand-400` | #68a7ef | Transiciones de badges.              |
| `--brand-500` | #4ea4ea | Enlaces primarios, estados activos.  |
| `--brand-600` | #2d7ed1 | Botones primarios y CTA.             |
| `--brand-700` | #0f4d9e | Títulos, énfasis fuerte.             |
| `--brand-800` | #0a3a85 | Hovers intensos, overlays.           |
| `--brand-900` | #072b63 | Fondos oscuros, alto contraste.      |

### 1.2 Tokens semánticos (consumo en UI)

> **Usar SIEMPRE** estos tokens en componentes. El modo oscuro y accesible re-mapea estos valores.

#### 1.2.1 Neutrales (texto e iconografía)

| Token              | Valor hex | Uso principal                                                            | Requisito de contraste                                          |
| ------------------ | --------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `--text-primary`   | #0a1630   | Texto dominante y títulos sobre `--color-bg-surface` y `--color-bg-app`. | ≥ 7:1 (AA/AAA) contra fondos claros.                            |
| `--text-secondary` | #51607a   | Meta, subtítulos y labels secundarios.                                   | ≥ 4.5:1 (AA) en fondos claros; usar ≥ 16px para cuerpos largos. |
| `--text-muted`     | #6b7a94   | Notas aclaratorias y vacíos; sólo en tamaños ≥ 16px o mayúsculas cortas. | ≥ 4.0:1 en `--color-bg-app`; ≥ 4.5:1 en `--color-bg-surface`.   |
| `--text-inverted`  | #ffffff   | Texto sobre superficies brand (`--brand-700`) y mensajes oscuros.        | ≥ 7:1 sobre `--brand-700` y overlays oscuros.                   |
| `--icon-muted`     | #4b5563   | Íconos inactivos o de apoyo en cards y toolbars neutrales.               | ≥ 7:1 sobre `--color-bg-surface`.                               |

```css
/* src/styles/design-tokens.css */
:root {
  /* Superficies */
  --color-bg-app: #f3f6fb;
  --color-bg-surface: #ffffff;
  --color-bg-surface-elevated: #ffffff;
  --color-bg-card: #ffffff;
  --color-bg-muted: #f5f8fc;

  /* Tinta (texto/iconos) */
  --color-fg-primary: #0a1b33; /* ratio >= 7:1 sobre bg-surface */
  --color-fg-secondary: #3b4a63; /* ratio >= 4.5:1 */
  --color-fg-muted: #5b6b85;
  --color-link: var(--brand-600);
  --color-link-hover: var(--brand-700);

  /* Bordes */
  --color-border: rgba(15, 40, 105, 0.16);
  --color-border-strong: rgba(15, 40, 105, 0.22);

  /* Estados */
  --color-success: #1f9d5a;
  --color-success-bg: #e8f8ef;
  --color-danger: #c03434;
  --color-danger-bg: #fdecec;
  --color-warning: #b45309;
  --color-warning-bg: #fff4df;
  --color-info: #1d4ed8;
  --color-info-bg: #eaf4ff;

  /* Botón primario */
  --color-btn-primary: var(--brand-600);
  --color-btn-primary-hover: #1e66b7;
  --color-btn-primary-contrast: #ffffff;

  /* Gradientes y efectos (opcionales) */
  --gradient-primary: linear-gradient(
    180deg,
    var(--brand-600) 0%,
    #1e66b7 100%
  );
  --gradient-gold: linear-gradient(180deg, #f7d774 0%, #e9b949 100%);

  /* Overlay */
  --color-overlay: rgba(11, 25, 54, 0.5);
  --color-header-translucent: rgba(255, 255, 255, 0.92);

  /* Elevación */
  --shadow-1: 0 6px 18px rgba(2, 12, 27, 0.06);
  --shadow-2: 0 10px 24px rgba(2, 12, 27, 0.08);
  --shadow-3: 0 18px 42px rgba(2, 12, 27, 0.12);

  /* Tipografía base */
  --font-family-sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --font-size-300: 0.875rem; /* 14px */
  --font-size-400: 1rem; /* 16px */
  --font-size-500: 1.125rem; /* 18px */
  --font-size-600: 1.25rem; /* 20px */
  --font-size-700: 1.5rem; /* 24px */
  --font-size-800: 1.875rem; /* 30px */
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-loose: 1.65;

  /* Espaciado (sistema 4px) */
  --space-1: 0.25rem; /* 4px  */
  --space-2: 0.5rem; /* 8px  */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.5rem; /* 24px */
  --space-6: 2rem; /* 32px */
  --space-7: 3rem; /* 48px */

  /* Radio (sistema 4px) */
  --radius-sm: 0.5rem; /* 8px  */
  --radius-md: 0.75rem; /* 12px */
  --radius-lg: 1rem; /* 16px */
  --radius-xl: 1.25rem; /* 20px */

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0, 0.2, 1);
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 0.9);
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 320ms;

  /* Layout */
  --container-max: 1120px;

  /* Layers */
  --z-nav: 900;
  --z-overlay: 1100;
  --z-modal: 1200;
  --z-toast: 1300;

  /* Safe areas (iOS) */
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
}
```

### 1.3 Modo oscuro (preparado)

```css
:root[data-theme="dark"] {
  --color-bg-app: #0b1424;
  --color-bg-surface: #0f1b2e;
  --color-bg-surface-elevated: #122239;
  --color-bg-card: #122239;
  --color-bg-muted: #0e192a;

  --color-fg-primary: #eaf1ff;
  --color-fg-secondary: #c3d2ea;
  --color-fg-muted: #9fb1cc;

  --color-border: rgba(234, 244, 255, 0.12);
  --color-border-strong: rgba(234, 244, 255, 0.18);

  --color-btn-primary: var(--brand-500);
  --color-btn-primary-hover: var(--brand-600);

  --shadow-1: 0 6px 18px rgba(0, 0, 0, 0.35);
  --shadow-2: 0 10px 24px rgba(0, 0, 0, 0.45);
  --shadow-3: 0 18px 42px rgba(0, 0, 0, 0.55);
}
```

### 1.4 Alto contraste (opcional)

> Modo **`data-theme="hc"`** enfatiza ratios ≥ 7:1 y contornos visibles.

```css
:root[data-theme="hc"] {
  --color-link: #0046ff;
  --color-link-hover: #002fb7;
  --color-border-strong: #1a5cff;
  /* etc. */
}
```

---

## 2) Tipografía

- **Familia**: `Inter` (400, 500, 600, 700) + fallback de sistema.
- **Accesibilidad**: microcopy **≥ 0.85rem** en móviles. Evitar uppercase prolongado; si se usa, aumentar `letter-spacing`.

### 2.1 Escala y mapeo de tokens

| Nivel tipográfico | Token de tamaño                                    | Token de color por defecto | Uso principal                                 |
| ----------------- | -------------------------------------------------- | -------------------------- | --------------------------------------------- |
| Body              | `var(--font-size-400)` + `var(--line-height-base)` | `--text-primary`           | Texto de párrafos y descripciones extensas.   |
| Subtle            | `var(--font-size-300)`                             | `--text-secondary`         | Etiquetas, metadatos y texto auxiliar ≥ 14px. |
| H6                | `var(--font-size-500)`                             | `--text-primary`           | Titulares de tarjetas y bloques secundarios.  |
| H5                | `var(--font-size-600)`                             | `--text-primary`           | Encabezados de secciones y modales.           |
| H4                | `var(--font-size-700)`                             | `--text-primary`           | Titulares destacados en landing y dashboard.  |
| H3                | `var(--font-size-800)`                             | `--text-primary`           | Hero y encabezados jerárquicos superiores.    |

### 2.2 Combinaciones aprobadas

- **Fondos claros (`--color-bg-surface`, `--color-bg-app`, `--color-bg-muted`)**: utilizar `--text-primary` para copy principal. `--text-secondary` se reserva para subtítulos o labels; `--text-muted` únicamente en tamaños ≥ 16px o iconografía de estado pasivo para mantener AA.
- **Fondos brand u oscuros (`--brand-700`, overlays, drawers)**: cambiar a `--text-inverted` para texto y `currentColor` en iconos (`Icon` se alimenta de `--text-inverted`).
- **Estados de feedback**:
  - Éxito: `--color-success` sobre `--color-success-bg` (ratio ≥ 4.5:1); combinar con `--text-inverted` si el fondo se eleva a `--color-success` sólido.
  - Error: `--color-danger` sobre `--color-danger-bg`; evitar usar `--text-muted` en estos bloques.
  - Advertencia: `--color-warning` sobre `--color-warning-bg` con subtítulos en `--text-secondary`.
  - Información: `--color-info` sobre `--color-info-bg`; CTAs secundarios conservan `--text-primary`.

### 2.3 Títulos fluidos

Usar `clamp()` sólo en _hero/section-title_:

```css
.section-title {
  font-size: clamp(1.25rem, 1.5vw + 1rem, 1.875rem);
  line-height: var(--line-height-tight);
  font-weight: 700;
}
```

---

## 3) Espaciado, radios, sombras

### 3.1 Espaciado

- **Sistema 4px**: `--space-*` + combinaciones (8/12/16/24/32/48).
- **Separación secciones**: preferir `var(--space-6)` (32px) ó `--space-7` (48px) según densidad.

### 3.2 Radios

- `--radius-lg` como borde por defecto en tarjetas y botones.
- `--radius-xl` reservado a _hero/raffle-card_ y contenedores con gradientes.

### 3.3 Sistema de sombras elevadas

| Nivel / token                                         | Offset X | Offset Y | Blur | Spread | Color                 | Componentes asignados                                                                  |
| ----------------------------------------------------- | -------- | -------- | ---- | ------ | --------------------- | -------------------------------------------------------------------------------------- |
| `--shadow-1` → `0 12px 30px rgba(2, 12, 27, 0.08)`    | 0        | 12px     | 30px | 0      | rgba(2, 12, 27, 0.08) | Tarjetas base (`.card`), `raffle-card`, enlaces accesibles como `.skip-link`.          |
| `--shadow-2` → `0 16px 34px rgba(2, 12, 27, 0.12)`    | 0        | 16px     | 34px | 0      | rgba(2, 12, 27, 0.12) | Estados _hover_ de tarjetas, menú móvil (`.app-header__mobile`), refuerzos de callouts |
| `--shadow-3` → `0 24px 60px rgba(2, 12, 27, 0.22)`    | 0        | 24px     | 60px | 0      | rgba(2, 12, 27, 0.22) | Toasts (`.toast`), `modal__content` y cualquier overlay bloqueante.                    |
| Drawer lateral (`-20px 0 60px rgba(2, 12, 27, 0.18)`) | -20px    | 0        | 60px | 0      | rgba(2, 12, 27, 0.18) | `.drawer` (panel deslizante anclado a la derecha).                                     |

- **Aplicación**: los componentes deben consumir el token correspondiente desde CSS (`box-shadow: var(--shadow-x)`) sin duplicar valores.
- **Fallback alto contraste / entornos sin sombra**: cada superficie elevada mantiene `border: 1px solid` definido en CSS (`rgba(15, 40, 105, 0.12)` para modales y drawer). En navegadores que desactivan sombras (modo alto contraste, IE heredado) debe mantenerse la jerarquía añadiendo `outline` o intensificando el borde (`color-mix` ≥ 20% del color base) en la variante sin sombra.
- **Responsabilidad UX**: evitar combinar múltiples niveles de sombra en un mismo bloque; sólo los overlays globales (`.toast`, `.modal`, `.drawer`) pueden usar `--shadow-3` o la sombra direccional del drawer para reforzar profundidad.

---

## 4) Breakpoints & Grid

Simplificar a un set mantenible:

- `--bp-xs: 360px`
- `--bp-sm: 640px`
- `--bp-md: 768px`
- `--bp-lg: 1024px`
- `--bp-xl: 1280px`

Ejemplos:

```css
.container {
  width: min(var(--container-max), 100% - 2rem);
  margin-inline: auto;
}
.grid-raffles {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
}
@media (min-width: 640px) {
  .grid-raffles {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid-raffles {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 5) Componentes clave (estándares)

### 5.1 Header & navegación

- **Sticky** con fondo translúcido `--color-header-translucent`, degradable a sólido.
- Focus visible (`:focus-visible`) con `outline: 2px solid var(--color-link)`.
- Menú móvil portaleado; overlay `var(--color-overlay)` con fallback a sólido (sin `backdrop-filter`).

### 5.2 Botones

- Base: `padding: var(--space-2) var(--space-4); gap: var(--space-2); border-radius: var(--radius-lg); transition: transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);`
- Estados activos: `:hover { transform: translateY(-1px); } :active { transform: translateY(0); } :focus-visible { outline: 3px solid color-mix(in srgb, var(--color-btn-primary) 40%, transparent); outline-offset: 3px; }`

#### 5.2.1 Variantes activas

- **Primary** (solid/gradient opcional): `background: var(--gradient-primary)` o `--color-btn-primary`; texto `--color-btn-primary-contrast`.
- **Ghost**: borde `--color-border`, texto `--color-fg-primary`; hover rellena con `color-mix` 12% de `--color-btn-primary`.
- **Subtle**: fondo `--color-bg-muted`, texto `--color-fg-primary`; hover intensifica fondo + border suave.
- **Gold**: usar con moderación (eventos especiales); mantener iconos en `--text-inverted` para garantizar contraste.
- **Danger**: `background: var(--color-danger)` con texto blanco, destinado a acciones destructivas confirmadas.

#### 5.2.2 Estados deshabilitados (`button[disabled]` / `[aria-disabled="true"]`)

> Se evita degradar la opacidad: cada combinación mantiene contraste ≥ 4.5:1 sobre superficies claras y oscuras. Las variantes deshabilitadas anulan `transform`, `box-shadow` y transiciones de hover.

| Variante                    | Fondo (`background`)                       | Texto/icono                                  | Borde / sombra                                                           | Interacción deshabilitada                                                    | Foco accesible                                                                                      |
| --------------------------- | ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Sin modificador (`.button`) | `--button-disabled-bg` → `#e3e9f3`         | `--button-disabled-text` → `#51607a`         | `--button-disabled-border` → `#c8d3e5`; sin sombra                       | `cursor: not-allowed`; `pointer-events: none`; `opacity: 1`; no hover/active | Sólo aplicable con `aria-disabled`: `outline: 2px solid var(--border-strong); outline-offset: 3px;` |
| `.button--primary`          | `--button-primary-disabled-bg` → `#3478bc` | `--button-primary-disabled-text` → `#ffffff` | Sin borde; sin gradiente; sombra eliminada                               | Igual que base; conserva ancho y spinner opcional                            | Igual que base                                                                                      |
| `.button--ghost`            | `--button-ghost-disabled-bg` → `#f4f7fc`   | `--button-disabled-text`                     | `--button-ghost-disabled-border` → `#c9d4e6`; sin sombra                 | Igual que base                                                               | Igual que base                                                                                      |
| `.button--subtle`           | `--button-subtle-disabled-bg` → `#edf4ff`  | `--button-disabled-text`                     | Borde transparente; sin sombra                                           | Igual que base                                                               | Igual que base                                                                                      |
| `.button--gold`             | `--button-gold-disabled-bg` → `#e6d098`    | `#3b2f0b`                                    | `--button-gold-disabled-border` → `rgba(185, 141, 35, 0.45)`; sin sombra | Igual que base                                                               | Igual que base                                                                                      |
| `.button--danger`           | `--button-danger-disabled-bg` → `#b44a4a`  | `#ffffff`                                    | `--button-danger-disabled-border` → `#a43f3f`; sin sombra                | Igual que base                                                               | Igual que base                                                                                      |

- `button[disabled]` deja de ser foco navegable; `[aria-disabled="true"]` conserva foco para anunciar ayudas contextuales. Evitar usar ambos simultáneamente en el mismo nodo.
- Si un control está visualmente deshabilitado pero debe explicar el motivo, proveer `aria-describedby` con el mensaje.

#### 5.2.3 Recomendaciones UX y estados de carga

- Mostrar mensajes de ayuda cercanos que expliquen criterios de activación (p. ej. “Completa los campos obligatorios” o “Requiere seleccionar al menos 1 boleto”).
- Habilitar botones únicamente cuando los criterios se cumplen; mientras tanto, usar `aria-disabled="true"` si debe conservar foco para leer la ayuda.
- Para estados de carga (`.button.is-loading`):
  - Reemplazar el label por un spinner y texto corto (“Guardando…”), manteniendo el ancho para evitar saltos.
  - Aplicar `pointer-events: none` pero mantener `aria-live="polite"` o `aria-busy="true"` en el contenedor para que lectores de pantalla distingan carga vs. deshabilitado.
  - Cambiar el cursor a `progress` cuando corresponda y mantener contraste completo (sin opacidad reducida).
- Documentar en copy o tooltip el motivo de la deshabilitación si persiste más de unos segundos.

### 5.3 Tarjetas (card / raffle-card)

- Fondo `--color-bg-card`, borde `--color-border`, sombra `--shadow-1`, radius `--radius-xl` en _raffle-card_ grandes.
- **Raffle states** mapeados a semánticos:

  - `data-state="soon"` → acento `--color-warning`.
  - `data-state="live"` → acento `--color-success`.
  - `data-state="finished"` → acento malva (definir si se requiere).

- Evitar “flip” 3D por accesibilidad; preferir tabs/expand/collapse con ARIA.

### 5.4 Formularios

- Labels ≥ 14px, alto contraste.
- Inputs: `padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md);`
- Focus ring accesible: `box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-btn-primary) 30%, transparent);` con fallback a `outline`.
- Errores: `--color-danger` y `--color-danger-bg` (alert region con `role="alert"`).

### 5.5 Toasts y mensajes

- Layout simple (1–2 columnas).
- Botón cerrar con `:focus-visible` claro y área táctil ≥ 32px.

### 5.6 Modales & Drawer

- Bloqueo de `body` (hook `useBodyScrollLock`).
- Keyboard traps, cierre con **Esc**, `aria-modal="true"`, `role="dialog"`, `aria-labelledby`.

### 5.7 Footer

- Dos variantes (claro/brand) mapeadas a tokens; grilla responsiva desde `sm`.

### 5.8 Etiquetas & chips

- `.tag` con fondo `--color-bg-muted` y texto `--color-fg-primary`.
- `.chip` densidad compacta (altura mínima 28–32px).

### 5.9 Guías de participación

- Tarjetas de pasos con numeración accesible (no sólo visual).
- Evitar dependencia fuerte de `color-mix` (usar fallback sólido).

### 5.10 Animaciones & microinteracciones

- Respeta `prefers-reduced-motion: reduce` → desactivar transformaciones/animaciones no esenciales.
- Transiciones ≤ `--dur-base` por defecto.
- **No** usar confeti por defecto en dispositivos modestos; activar sólo bajo `performance OK`.

---

## 6) Accesibilidad (WCAG 2.2 AA+)

- **Contraste**: todos los pares texto/fondo ≥ 4.5:1; títulos grandes ≥ 3:1.
- **Teclado**: todos los controles navegables con Tab/Shift+Tab; visible `:focus-visible`.
- **Roles/ARIA** correctos en modales, toasts, menús.
- **Zoom/Reflow**: 200% sin pérdida funcional.
- **Gestos**: no depender sólo de hover; proveer click o foco equivalente.
- **Estados**: no sólo color para transmitir significado (icono + texto).

---

## 7) Iconografía

**Librería**: [Lucide](https://lucide.dev/) (outline, legible, mantenimiento activo).
**Estilo**:

- Stroke `1.75px` (mantener consistencia).
- Esquinas suavizadas (coherente con radios).
- Constraste suficiente en `hc` y modo oscuro.

**Tamaños (tokens)**:

```css
:root {
  --icon-size-sm: 16px;
  --icon-size-md: 20px;
  --icon-size-lg: 24px;
  --icon-size-xl: 32px;
  --icon-stroke: 1.75;
  --icon-color: currentColor; /* hereda del contexto */
}
```

**Semántica por contexto**:

- **Sorteos**: `Gift`, `Ticket`, `Trophy`, `Medal`, `CalendarCheck`, `Users`.
- **Estados**: `CheckCircle2` (éxito), `CircleAlert` (warning), `CircleX` (error), `Info`.
- **Acciones**: `Plus`, `Edit3`, `Trash2`, `Filter`, `Search`, `Download`, `Upload`, `Share2`.

**Uso en React**:

```tsx
import { Trophy } from "lucide-react";

export function RaffleIcon({
  size = "md",
}: {
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const px = { sm: 16, md: 20, lg: 24, xl: 32 }[size];
  return (
    <Trophy
      width={px}
      height={px}
      strokeWidth={
        Number(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--icon-stroke"
          )
        ) || 1.75
      }
    />
  );
}
```

---

## 8) Theme Provider (React + CSS Variables)

**Objetivo**: activar temas con `data-theme` en `<html>` y exponer helpers.

```tsx
// src/theme/ThemeProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "hc";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () =>
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
```

Ejemplo de conmutador:

```tsx
import { useTheme } from "@/theme/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitch() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div className="theme-switch">
      <button
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        <Sun />
      </button>
      <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
        <Moon />
      </button>
      <button onClick={toggle} aria-label="Alternar tema">
        Toggle
      </button>
    </div>
  );
}
```

---

## 9) Compatibilidad & degradaciones

- `backdrop-filter`: proveer fondo sólido alternativo (ya definido).
- `color-mix`: usar valores fijos de respaldo en cascada.
- `prefers-reduced-motion`: desactivar animaciones no esenciales.
- Test mínimo: **últimas 2 versiones** de navegadores evergreen + Safari reciente.

---

## 10) Riesgos y políticas

- **Prohibido** duplicar tokens en múltiples archivos. Fuente única: `design-tokens.css`.
- Cambios de tokens → _release note_ + verificación en Storybook (regresión visual).
- No introducir colores “hardcodeados” en componentes; usar tokens semánticos.

---

## 11) QA visual & documentación viva

- **Storybook** obligatorio con `@storybook/addon-a11y` y `@storybook/test-runner`.
- Pruebas:

  - **axe** sin violaciones críticas.
  - **Lighthouse** accesibilidad ≥ 95 en pantallas clave.
  - Capturas por tamaño: `xs`, `sm`, `md`, `lg`.

- Figma: estilos sincronizados (color/texto/grillas) y naming alineado a tokens.

---

## Anexo A) Patrones de uso rápido

**Enlace**

```css
a {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}
a:hover {
  color: var(--color-link-hover);
}
a:focus-visible {
  outline: 2px solid var(--color-link);
  outline-offset: 2px;
}
```

**Botón primario (solid)**

```css
.button--primary {
  color: var(--color-btn-primary-contrast);
  background: var(--color-btn-primary);
  border: 1px solid color-mix(in srgb, var(--color-btn-primary) 50%, black);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  transition: filter var(--dur-fast) var(--ease-standard), transform var(
        --dur-fast
      ) var(--ease-standard);
}
.button--primary:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
.button--primary:active {
  transform: translateY(0);
}
.button--primary:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-btn-primary) 35%, transparent);
  outline-offset: 2px;
}
```

**Card**

```css
.card {
  background: var(--color-bg-card);
  color: var(--color-fg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  padding: var(--space-5);
}
```

**Form input**

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-fg-primary);
}
.input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-btn-primary) 25%, transparent);
  border-color: var(--color-btn-primary);
}
.input[aria-invalid="true"] {
  border-color: var(--color-danger);
}
```

---

## Anexo B) Estados y semánticas de sorteo

- **Próximo** (`data-state="soon"`): icono `CalendarCheck`, acento `--color-warning`.
- **En vivo** (`data-state="live"`): icono `Trophy`, acento `--color-success`.
- **Finalizado** (`data-state="finished"`): icono `Medal`, acento neutro/“malva” (definir si se requiere en tokens).

---

## Anexo C) Checklist de accesibilidad por componente

- **Header/Nav**: navegación por teclado, `aria-expanded` en menú, foco visible.
- **Modal/Drawer**: focus trap, cierre por Esc, `aria-labelledby`, `aria-describedby`.
- **Toast**: `role="status"` o `role="alert"` según criticidad, botón _Close_ con etiqueta accesible.
- **Botón**: tamaño táctil ≥ 40×40 en móvil, estados discernibles sin color únicamente.
- **Form**: `label` asociado, mensajes de error con `aria-live="polite"`.

---

## Anexo D) Modo oscuro: lineamientos visuales

- Mantener **contraste** igual o mayor que en claro.
- Reducir saturación en superficies para evitar “brillo” digital.
- Sombras más suaves y sutiles (ver tokens).

---

## 12) Sugerencias de evolución

- Añadir **tema institucional** (colores del sindicato) remapeando sólo tokens semánticos.
- Introducir **tokens de data viz** si se suman dashboards (paleta categórica segura para daltónicos).
- Catálogo de **componentes admin** (tablas editables, filtros, paginación, vacíos de estado).

---

### Apéndice: Gradientes y efectos (opcional, sobriedad primero)

- Botón primario (gradiente) → usar sólo en páginas de marketing o momentos “especiales”.
- Oro → reservado para premios/destacados (no para acciones CRUD).
