import * as React from 'react';
import PropTypes from 'prop-types';

function SvgText({ fill = '#111820', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3h10v3h-1V4H8.5v8H10v1H6v-1h1.5V4H4v2H3V3Z"
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

SvgText.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgText);
