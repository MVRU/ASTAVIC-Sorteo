// ! DECISIÓN DE DISEÑO: Estatizamos las tarjetas para mantener consistencia visual y semántica entre métricas.
import PropTypes from "prop-types";

const StatCard = ({ label, value, icon }) => (
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
      background: "var(--surface-elevated)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-1)",
      transition: "transform var(--transition-base), box-shadow var(--transition-base)",
    }}
  >
    {icon && (
      <div
        style={{
          fontSize: "1.4rem",
          color: "var(--brand-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "var(--brand-50)",
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
    )}
    <div>
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
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
  icon: PropTypes.node,
};

StatCard.defaultProps = {
  icon: "📊",
};

export default StatCard;
