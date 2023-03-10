import * as React from 'react';
import PropTypes from 'prop-types';

const SvgCheckSm = ({ fill, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m13.207 5.207-5.5 5.5-.707.707-.707-.707-3-3 1.414-1.414L7 8.586l4.793-4.793 1.414 1.414Z"
      fill={fill}
    />
  </svg>
);

SvgCheckSm.defaultProps = {
  fill: '#ffffff',
  size: 16
};

SvgCheckSm.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgCheckSm);
