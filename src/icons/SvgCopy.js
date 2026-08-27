import * as React from 'react';
import PropTypes from 'prop-types';

function SvgCopy({ fill = '#191919', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M4 3C4 1.89543 4.89543 1 6 1H13C14.1046 1 15 1.89543 15 3V10C15 11.1046 14.1046 12 13 12H12V13C12 14.1046 11.1046 15 10 15H3C1.89543 15 1 14.1046 1 13V6C1 4.89543 1.89543 4 3 4H4V3ZM6 3H13V10H6V3ZM4 6H3V13H10V12H6C4.89543 12 4 11.1046 4 10V6Z"
        fill={fill}
        fillRule="evenodd"
      />
    </svg>
  );
}

SvgCopy.propTypes = {
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgCopy);
