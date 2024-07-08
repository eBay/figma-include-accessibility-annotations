import * as React from 'react';
import PropTypes from 'prop-types';

function SvgCheck({ fill = '#111820', size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.833 17a.999.999 0 0 1-.71-.29l-4-4a1 1 0 0 1 1.41-1.41l3.3 3.29 7.29-7.29a1 1 0 0 1 1.41 1.41l-8 8a.999.999 0 0 1-.7.29Z"
        fill={fill}
      />
    </svg>
  );
}

SvgCheck.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgCheck);
