// src/components/ui/Icon.js
// ! DECISIÓN DE DISEÑO: Este wrapper consolida una biblioteca mínima inspirada en Lucide, fija trazo 1.75px y evita dependencias externas.
// ? Riesgo: Al agregar íconos nuevos se debe extender el mapeo interno para mantener consistencia y tree-shaking manual.

import PropTypes from "prop-types";
import { useId } from "react";

const WEIGHTS = Object.freeze({
  thin: 1.25,
  regular: 1.75,
  bold: 2.25,
});

const BASE_PROPS = Object.freeze({
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

const ICONS = Object.freeze({
  calendar: {
    label: "Calendario",
    paths: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </>
    ),
  },
  chart: {
    label: "Indicador de progreso",
    paths: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 16V9" />
        <path d="M13 16V5" />
        <path d="M18 16v-4" />
      </>
    ),
  },
  collection: {
    label: "Colección",
    paths: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  hourglass: {
    label: "Temporizador",
    paths: (
      <>
        <path d="M5 2h14" />
        <path d="M5 22h14" />
        <path d="M6 2c3 3 6 5 6 8s-3 5-6 8" />
        <path d="M18 2c-3 3-6 5-6 8s3 5 6 8" />
      </>
    ),
  },
  checkCircle: {
    label: "Confirmado",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  xCircle: {
    label: "Error",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6" />
        <path d="M9 9l6 6" />
      </>
    ),
  },
  infoCircle: {
    label: "Información",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12v4" />
        <path d="M12 8h.01" />
      </>
    ),
  },
  warningTriangle: {
    label: "Advertencia",
    paths: (
      <>
        <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  upload: {
    label: "Subir archivo",
    paths: (
      <>
        <path d="M12 15V3" />
        <path d="M6 9l6-6 6 6" />
        <path d="M4 21h16" />
      </>
    ),
  },
  paperclip: {
    label: "Adjuntar",
    paths: (
      <>
        <path d="M21.44 11.05 12.7 19.78a5 5 0 11-7.07-7.07l8.74-8.73a3 3 0 014.24 4.24L9.88 16.99a1 1 0 01-1.41-1.41l7.07-7.07" />
      </>
    ),
  },
  calendarCheck: {
    label: "Calendario confirmado",
    paths: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
        <path d="M10 16l2 2 4-4" />
      </>
    ),
  },
  rocket: {
    label: "Lanzamiento",
    paths: (
      <>
        <path d="M5 15c0-4.5 2-6.5 7-8 1.5-5 3.5-7 8-7-0.5 4.5-2 6.5-7 8-1.5 5-3.5 7-8 7z" />
        <path d="M9 14l-2.5 3" />
        <path d="M15 14l2.5 3" />
        <path d="M11 18.5v3" />
        <path d="M13 18.5v3" />
        <path d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
      </>
    ),
  },
  megaphone: {
    label: "Anuncio",
    paths: (
      <>
        <path d="M3 11v2a2 2 0 002 2h1l6 3V6l-6 3H5a2 2 0 00-2 2z" />
        <path d="M16 9a5 5 0 010 6" />
        <path d="M18.5 7a8 8 0 010 10" />
      </>
    ),
  },
  logOut: {
    label: "Cerrar sesión",
    paths: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  },
  plus: {
    label: "Agregar",
    paths: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
  },
  list: {
    label: "Listado",
    paths: (
      <>
        <path d="M10 6h11" />
        <path d="M10 12h11" />
        <path d="M10 18h11" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </>
    ),
  },
  menu: {
    label: "Abrir menú",
    paths: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
  },
  close: {
    label: "Cerrar",
    paths: (
      <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </>
    ),
  },
});

export const ICON_NAMES = Object.freeze(Object.keys(ICONS));

const DEFAULT_COLOR = "var(--icon-color, currentColor)";

const Icon = ({
  name,
  label,
  size,
  weight,
  strokeWidth,
  decorative,
  color,
  ...props
}) => {
  const titleId = useId();
  const icon = ICONS[name];
  if (!icon) return null;

  const { stroke: strokeOverride, ...restProps } = props;
  const strokeColor = color ?? strokeOverride ?? DEFAULT_COLOR;
  const resolvedLabel = label ?? icon.label;
  const accessibilityProps = decorative
    ? { "aria-hidden": true, role: "presentation" }
    : { role: "img", "aria-labelledby": titleId };

  const resolvedStrokeWidth = strokeWidth ?? WEIGHTS[weight] ?? WEIGHTS.regular;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      focusable="false"
      stroke={strokeColor}
      strokeWidth={resolvedStrokeWidth}
      {...BASE_PROPS}
      {...accessibilityProps}
      {...restProps}
    >
      {!decorative && <title id={titleId}>{resolvedLabel}</title>}
      {icon.paths}
    </svg>
  );
};

Icon.propTypes = {
  name: PropTypes.oneOf(ICON_NAMES).isRequired,
  label: PropTypes.string,
  size: PropTypes.number,
  weight: PropTypes.oneOf(["thin", "regular", "bold"]),
  strokeWidth: PropTypes.number,
  decorative: PropTypes.bool,
  color: PropTypes.string,
};

Icon.defaultProps = {
  label: undefined,
  size: 24,
  weight: "regular",
  decorative: false,
};

export default Icon;
