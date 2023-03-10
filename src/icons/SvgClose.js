import * as React from 'react';
import PropTypes from 'prop-types';

const SvgClose = ({ fill, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 5.293 10.646.646l.708.708L6.707 6l4.647 4.646-.707.708L6 6.707l-4.646 4.647-.708-.707L5.293 6 .646 1.354l.708-.707L6 5.293Z"
      fill={fill}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

SvgClose.defaultProps = {
  fill: '#111820',
  size: 12
};

SvgClose.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgClose);
