// src/components/public/rafflePropType.js

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
