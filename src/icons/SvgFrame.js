import * as React from 'react';
import PropTypes from 'prop-types';

function SvgFrame({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 16v-3H0v-1h3V4H0V3h3V0h1v3h8V0h1v3h3v1h-3v8h3v1h-3v3h-1v-3H4v3H3zm9-4V4H4v8h8z"
        fill={fill}
        fillRule="evenodd"
        fillOpacity="1"
        stroke="none"
      />
    </svg>
  );
}

SvgFrame.defaultProps = {
  fill: '#111820',
  size: 16
};

SvgFrame.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgFrame);
