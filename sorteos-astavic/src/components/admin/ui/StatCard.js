// src/components/admin/ui/StatCard.js
// ! DECISIÓN DE DISEÑO: Las tarjetas de métrica reutilizan tokens de sombra, tipografía e iconografía alineados al sistema.

import PropTypes from "prop-types";
import Icon, { ICON_NAMES } from "../../ui/Icon";

const StatCard = ({ label, value, iconName }) => (
  <div
    className="card anim-fade-in"
    role="status"
    aria-live="polite"
    style={{
      padding: "1.1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "0.5rem",
      borderRadius: "12px",
      background: "var(--color-bg-surface-elevated)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow-1)",
      transition:
        "transform var(--transition-base), box-shadow var(--transition-base)",
    }}
  >
    {iconName && (
      <div
        style={{
          color: "var(--brand-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "var(--brand-50)",
        }}
      >
        <Icon name={iconName} decorative size={24} strokeWidth={1.8} />
      </div>
    )}
    <div>
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--color-fg-secondary)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.65rem",
          fontWeight: 700,
          color: "var(--brand-700)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconName: PropTypes.oneOf(ICON_NAMES),
};

StatCard.defaultProps = {
  iconName: "chart",
};

export default StatCard;
