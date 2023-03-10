import * as React from 'react';
import PropTypes from 'prop-types';

const SvgEyeClosed = ({ fill, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.508 7.801A8.031 8.031 0 0 0 14.93 6h-1.185A6.992 6.992 0 0 1 8 9a6.992 6.992 0 0 1-5.746-3H1.07a8.032 8.032 0 0 0 1.421 1.801L.896 9.396l.708.707L3.26 8.446c.71.523 1.511.932 2.374 1.199l-.617 2.221.964.268.626-2.255a8.05 8.05 0 0 0 2.784 0l.626 2.255.964-.268-.617-2.221a7.974 7.974 0 0 0 2.374-1.2l1.657 1.658.708-.707-1.595-1.595Z"
      fill={fill}
    />
  </svg>
);

SvgEyeClosed.defaultProps = {
  fill: '#111820',
  size: 16
};

SvgEyeClosed.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgEyeClosed);
