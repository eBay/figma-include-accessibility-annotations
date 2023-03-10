import * as React from 'react';
import PropTypes from 'prop-types';

const SvgChevronLeft = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 15a1 1 0 01-.71-.29l-6-6a1 1 0 010-1.41l6-6a1 1 0 011.41 1.41L6.41 8l5.29 5.29A1 1 0 0111 15z" />
  </svg>
);

SvgChevronLeft.defaultProps = {
  size: 16
};

SvgChevronLeft.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgChevronLeft);
