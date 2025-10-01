// src/components/ui/Icon.js

import PropTypes from "prop-types";
import { useId } from "react";

const WEIGHTS = Object.freeze({
  thin: 1.25,
  regular: 1.75,
  bold: 2.25,
});

const ICONS = Object.freeze({
  calendar: {
    label: "Calendario",
    // Caja superior + cuerpo con radios uniformes y líneas a .5
    paths: (
      <>
        {/* cuerpo */}
        <rect x="3.5" y="6.5" width="17" height="13" rx="2.5" />
        {/* línea de división */}
        <path d="M3.5 10.5h17" />
        {/* anillas */}
        <path d="M8.5 3.5v4" />
        <path d="M15.5 3.5v4" />
      </>
    ),
  },
  chart: {
    label: "Indicador de progreso",
    paths: (
      <>
        <path d="M4.5 19.5h15" />
        <path d="M8.5 19.5V11.5" />
        <path d="M12 19.5V7.5" />
        <path d="M15.5 19.5v-5" />
      </>
    ),
  },
  collection: {
    label: "Colección",
    paths: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  hourglass: {
    label: "Temporizador",
    paths: (
      <>
        <path d="M7.5 4.5h9" />
        <path d="M7.5 19.5h9" />
        {/* contorno estilizado con curvas simétricas */}
        <path d="M7.5 4.5c0 4 4.5 4 4.5 7.5S7.5 15.5 7.5 19.5" />
        <path d="M16.5 4.5c0 4-4.5 4-4.5 7.5s4.5 3.5 4.5 7.5" />
      </>
    ),
  },
  checkCircle: {
    label: "Confirmado",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9 12.5l2.25 2.25L15 11" />
      </>
    ),
  },
  xCircle: {
    label: "Error",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.5 9.5l5 5" />
        <path d="M14.5 9.5l-5 5" />
      </>
    ),
  },
  infoCircle: {
    label: "Información",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 16v-4.25" strokeLinecap="round" />
        <circle cx="12" cy="7" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),
  },
  warningTriangle: {
    label: "Advertencia",
    paths: (
      <>
        {/* triángulo ópticamente centrado */}
        <path d="M12 4.5l7.5 13H4.5l7.5-13z" />
        <path d="M12 10.25v4.25" />
        <circle cx="12" cy="17.25" r="1" />
      </>
    ),
  },
  upload: {
    label: "Subir archivo",
    paths: (
      <>
        <path d="M12 16.5V5.5" />
        <path d="M8.75 9.25L12 6l3.25 3.25" />
        <path d="M5.5 16.5v2a3 3 0 003 3h7a3 3 0 003-3v-2" />
      </>
    ),
  },
  paperclip: {
    label: "Adjuntar",
    paths: (
      <>
        <path d="M16 7.5l-6.6 6.6a3 3 0 11-4.25-4.25l6.6-6.6a4 4 0 115.65 5.65l-7.2 7.2a5 5 0 11-7.07-7.07l5.25-5.25" />
      </>
    ),
  },
  calendarCheck: {
    label: "Calendario confirmado",
    paths: (
      <>
        <rect x="3.5" y="6.5" width="17" height="13" rx="2.5" />
        <path d="M3.5 10.5h17" />
        <path d="M8.5 3.5v4" />
        <path d="M15.5 3.5v4" />
        <path d="M9.75 14.5l2 2 3.5-4.25" />
      </>
    ),
  },
  rocket: {
    label: "Lanzamiento",
    paths: (
      <>
        <path d="M12 3.5c2.5 0 4.5 2 4.5 4.5 0 4.5-4.5 10-4.5 10S7.5 12.5 7.5 8c0-2.5 2-4.5 4.5-4.5z" />
        <circle cx="12" cy="8" r="1.4" />
        <path d="M9.5 14.5l-2 2.5M14.5 14.5l2 2.5" />
        <path d="M11.5 18.5v3M12.5 18.5v3" />
      </>
    ),
  },
  megaphone: {
    label: "Anuncio",
    paths: (
      <>
        <path d="M3.5 11v2a2 2 0 002 2h1l6 3V6l-6 3H5.5a2 2 0 00-2 2z" />
        <path d="M15.5 9.5a4.5 4.5 0 010 5" />
        <path d="M17.5 7.5a7.5 7.5 0 010 9" />
      </>
    ),
  },
});

export const ICON_NAMES = Object.freeze(Object.keys(ICONS));

function applyVariant({
  variant,
  gradientId,
  color,
  secondaryColor,
  duotoneOpacity,
}) {
  const common = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (variant === "duotone") {
    return {
      ...common,
      stroke: color ?? `var(--icon-color, currentColor)`,
      "data-variant": "duotone",
      // El segundo tono lo aplicamos por CSS a elementos con data-secondary="true"
      style: {
        "--icon-secondary": secondaryColor ?? "currentColor",
        "--icon-secondary-opacity": duotoneOpacity ?? 0.35,
      },
    };
  }

  if (variant === "filled") {
    return {
      ...common,
      stroke: color
        ? color
        : gradientId
        ? `url(#${gradientId})`
        : `var(--icon-color, currentColor)`,
      "data-variant": "filled",
    };
  }

  // outline (default)
  return {
    ...common,
    stroke: color
      ? color
      : gradientId
      ? `url(#${gradientId})`
      : `var(--icon-color, currentColor)`,
    "data-variant": "outline",
  };
}

const Icon = ({
  name,
  label,
  size,
  weight,
  strokeWidth, // compat
  decorative,
  variant,
  color,
  secondaryColor,
  duotoneOpacity,
  gradient, // { from, to, direction: 'horizontal'|'vertical'|'diag' }
  ...props
}) => {
  const titleId = useId();
  const gradId = useId();
  const icon = ICONS[name];
  if (!icon) return null;

  const resolvedLabel = label ?? icon.label;
  const accessibilityProps = decorative
    ? { "aria-hidden": true, role: "presentation" }
    : { role: "img", "aria-labelledby": titleId };

  const resolvedStrokeWidth = strokeWidth ?? WEIGHTS[weight] ?? WEIGHTS.regular;

  const variantProps = applyVariant({
    variant,
    gradientId: gradient ? gradId : null,
    color,
    secondaryColor,
    duotoneOpacity,
  });

  // Dirección de gradiente
  const gradientProps = (() => {
    if (!gradient) return null;
    switch (gradient.direction) {
      case "vertical":
        return { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };
      case "diag":
        return { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };
      default:
        return { x1: "0%", y1: "0%", x2: "100%", y2: "0%" }; // horizontal
    }
  })();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      focusable="false"
      {...variantProps}
      strokeWidth={resolvedStrokeWidth}
      {...accessibilityProps}
      {...props}
    >
      {!decorative && <title id={titleId}>{resolvedLabel}</title>}

      {gradient && (
        <defs>
          <linearGradient id={gradId} {...gradientProps}>
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
      )}

      {/* En duotone podrías marcar elementos secundarios con data-secondary="true" si los tuvieras */}
      {icon.paths}
    </svg>
  );
};

Icon.propTypes = {
  name: PropTypes.oneOf(ICON_NAMES).isRequired,
  label: PropTypes.string,
  size: PropTypes.number,
  weight: PropTypes.oneOf(["thin", "regular", "bold"]),
  strokeWidth: PropTypes.number, // compatibilidad
  decorative: PropTypes.bool,
  variant: PropTypes.oneOf(["outline", "duotone", "filled"]),
  color: PropTypes.string,
  secondaryColor: PropTypes.string,
  duotoneOpacity: PropTypes.number,
  gradient: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(["horizontal", "vertical", "diag"]),
  }),
};

Icon.defaultProps = {
  label: undefined,
  size: 24,
  weight: "regular",
  decorative: false,
  variant: "outline",
  duotoneOpacity: 0.35,
};

export default Icon;
