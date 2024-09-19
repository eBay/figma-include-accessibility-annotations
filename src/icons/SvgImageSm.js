import * as React from 'react';
import PropTypes from 'prop-types';

function SvgImageSm({ fill = '#111820', size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 3H3v6.293l2.146-2.147.354-.353.354.353L11.707 13H13V3ZM3 13v-2.293l2.5-2.5L10.293 13H3ZM3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3Zm8 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        fill={fill}
      />
    </svg>
  );
}

SvgImageSm.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgImageSm);
