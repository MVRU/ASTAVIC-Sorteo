// src/components/admin/manage/EmptyHint.js

import PropTypes from "prop-types";

const EmptyHint = ({ text }) => <div className="empty-hint">{text}</div>;

EmptyHint.propTypes = {
  text: PropTypes.string.isRequired,
};

export default EmptyHint;
