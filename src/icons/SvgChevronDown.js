import * as React from 'react';
import PropTypes from 'prop-types';

function SvgChevronDown({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.707 12.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 1.414-1.414L8 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6Z" />
    </svg>
  );
}

SvgChevronDown.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgChevronDown);
