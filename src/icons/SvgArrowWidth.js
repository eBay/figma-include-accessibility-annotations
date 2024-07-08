import * as React from 'react';
import PropTypes from 'prop-types';

function SvgArrowWidth({ fill = '#b3b3b3' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none">
      <path
        fill={fill}
        fillRule="evenodd"
        d="M15.25 1.98v14h-1v-14h1Zm-14 0h1v14h-1v-14Zm11.354 7.353.353-.354-.353-.353-3-3-.708.707 2.147 2.146H4.25v1h6.793l-2.147 2.147.708.707 3-3Z"
        clipRule="evenodd"
      />
      <path stroke={fill} d="M12.25 8.98h-8m0 0 2.667 3m-2.667-3 2.667-3" />
    </svg>
  );
}

SvgArrowWidth.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgArrowWidth);
