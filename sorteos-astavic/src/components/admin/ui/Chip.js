// ! DECISIÓN DE DISEÑO: Extraemos Chip para reutilizar estilos de toggles compactos en distintos paneles.
import PropTypes from "prop-types";

const Chip = ({ children, active, onClick }) => (
  <button
    type="button"
    className="tag"
    onClick={onClick}
    aria-pressed={Boolean(active)}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.825rem",
      fontWeight: 600,
      padding: "0.25rem 0.6rem",
      borderRadius: "999px",
      background: active ? "var(--brand-100)" : "var(--brand-50)",
      color: "var(--brand-700)",
      border: "1px solid var(--border)",
      whiteSpace: "nowrap",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

Chip.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};

Chip.defaultProps = {
  active: false,
  onClick: undefined,
};

export default Chip;
