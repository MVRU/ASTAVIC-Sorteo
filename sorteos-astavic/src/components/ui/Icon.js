// ! DECISIÓN DE DISEÑO: Centralizamos iconos SVG para garantizar consistencia visual y accesibilidad en toda la UI.
// -*- Ampliamos la colección con estados semánticos reutilizables (éxito, error, aviso) para reemplazar emojis.
import PropTypes from "prop-types";
import { useId } from "react";

const ICONS = Object.freeze({
  calendar: {
    label: "Calendario",
    paths: (
      <>
        <rect x="4.25" y="6" width="15.5" height="13.75" rx="2.25" />
        <path d="M4.25 10.25h15.5" />
        <path d="M8.25 3.5V7" />
        <path d="M15.75 3.5V7" />
      </>
    ),
  },
  chart: {
    label: "Indicador de progreso",
    paths: (
      <>
        <path d="M5 19.25h14" />
        <path d="M8.5 19.25V11.5" />
        <path d="M12 19.25V7" />
        <path d="M15.5 19.25v-4.75" />
      </>
    ),
  },
  collection: {
    label: "Colección",
    paths: (
      <>
        <rect x="3.75" y="3.75" width="6.5" height="6.5" rx="1.3" />
        <rect x="13.75" y="3.75" width="6.5" height="6.5" rx="1.3" />
        <rect x="3.75" y="13.75" width="6.5" height="6.5" rx="1.3" />
        <rect x="13.75" y="13.75" width="6.5" height="6.5" rx="1.3" />
      </>
    ),
  },
  hourglass: {
    label: "Temporizador",
    paths: (
      <>
        <path d="M7 4.5h10" />
        <path d="M7 19.5h10" />
        <path d="M7 4.5c0 3.75 5 3.75 5 7.5s-5 3.75-5 7.5" />
        <path d="M17 4.5c0 3.75-5 3.75-5 7.5s5 3.75 5 7.5" />
      </>
    ),
  },
  checkCircle: {
    label: "Confirmado",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M9 12.75l2.25 2.25L15 10.5" />
      </>
    ),
  },
  xCircle: {
    label: "Error",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.25" />
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
        <path d="M12 10.5v5" />
        <circle cx="12" cy="8" r="0.9" />
      </>
    ),
  },
  warningTriangle: {
    label: "Advertencia",
    paths: (
      <>
        <path d="M12 4l8 14H4l8-14z" />
        <path d="M12 10v4" />
        <circle cx="12" cy="16" r="0.8" />
      </>
    ),
  },
  upload: {
    label: "Subir archivo",
    paths: (
      <>
        <path d="M12 16.75V5.5" />
        <path d="M8.25 9.25L12 5.5l3.75 3.75" />
        <path d="M5.5 16.75v2a2.5 2.5 0 002.5 2.5h8a2.5 2.5 0 002.5-2.5v-2" />
      </>
    ),
  },
  paperclip: {
    label: "Adjuntar",
    paths: (
      <>
        <path d="M16.1 7.25l-6.7 6.7a2.75 2.75 0 01-3.89-3.89l6.7-6.7a3.75 3.75 0 015.3 5.3l-7 7a4.75 4.75 0 01-6.72-6.72l5.4-5.4" />
      </>
    ),
  },
  calendarCheck: {
    label: "Calendario confirmado",
    paths: (
      <>
        <rect x="4.25" y="6" width="15.5" height="13.75" rx="2.25" />
        <path d="M4.25 10.25h15.5" />
        <path d="M8.25 3.5V7" />
        <path d="M15.75 3.5V7" />
        <path d="M9.5 14l2 2 3.5-4" />
      </>
    ),
  },
  rocket: {
    label: "Lanzamiento",
    paths: (
      <>
        <path d="M12 3.5c2.9 0 5.25 2.35 5.25 5.25 0 4.75-5.25 10-5.25 10S6.75 13.5 6.75 8.75C6.75 5.85 9.1 3.5 12 3.5z" />
        <circle cx="12" cy="8.25" r="1.75" />
        <path d="M9.5 14.75l-1 3.5L12 17.75l3.5 0.5-1-3.5" />
        <path d="M8.5 18.75l-2 2" />
        <path d="M15.5 18.75l2 2" />
      </>
    ),
  },
});

export const ICON_NAMES = Object.freeze(Object.keys(ICONS));

const Icon = ({ name, label, size, strokeWidth, decorative, ...props }) => {
  const titleId = useId();
  const icon = ICONS[name];
  if (!icon) {
    return null;
  }
  const resolvedLabel = label ?? icon.label;
  const accessibilityProps = decorative
    ? { "aria-hidden": true, role: "presentation" }
    : { role: "img", "aria-labelledby": titleId };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...accessibilityProps}
      {...props}
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
  strokeWidth: PropTypes.number,
  decorative: PropTypes.bool,
};

Icon.defaultProps = {
  label: undefined,
  size: 24,
  strokeWidth: 1.7,
  decorative: false,
};

export default Icon;
