import * as React from 'react';
import PropTypes from 'prop-types';

function SvgMobile({ fill = '#111820', size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 18h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2Z" fill={fill} />
      <path
        d="M16 1H8a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3ZM8 3h8a1 1 0 0 1 1 1H7a1 1 0 0 1 1-1ZM7 6h10v9H7V6Zm0 11h10v3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3Z"
        fill={fill}
      />
    </svg>
  );
}

SvgMobile.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgMobile);
