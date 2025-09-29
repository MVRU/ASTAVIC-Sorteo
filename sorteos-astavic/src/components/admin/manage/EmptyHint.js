// ! DECISIÓN DE DISEÑO: Componente dedicado para mejorar la semántica del estado vacío.
import PropTypes from "prop-types";

const EmptyHint = ({ text }) => <div className="empty-hint">{text}</div>;

EmptyHint.propTypes = {
  text: PropTypes.string.isRequired,
};

export default EmptyHint;
