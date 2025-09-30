// src/components/public/rafflePropType.js
// ! DECISIÓN DE DISEÑO: Compartimos la definición de la entidad Raffle para evitar duplicaciones y mantener validaciones coherentes.
// -!- Riesgo: Esta forma de PropTypes no valida campos anidados opcionales con lógica personalizada; validar en formularios críticos.
import PropTypes from "prop-types";

export const rafflePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  datetime: PropTypes.string.isRequired,
  winnersCount: PropTypes.number.isRequired,
  participants: PropTypes.arrayOf(PropTypes.string).isRequired,
  prizes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ),
  finished: PropTypes.bool,
});

export default rafflePropType;
