import * as React from 'react';
import PropTypes from 'prop-types';

const SvgCheckbox = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 96 960 960"
    focusable="false"
  >
    <path
      d="m419 735 289-289-43-43-246 246-119-119-43 43 162 162ZM180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600V276H180v600Zm0-600v600-600Z"
    />
  </svg>
);

SvgCheckbox.defaultProps = {
  size: 48
};

SvgCheckbox.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgCheckbox);
