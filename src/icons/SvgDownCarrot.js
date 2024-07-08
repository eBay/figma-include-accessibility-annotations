import * as React from 'react';
import PropTypes from 'prop-types';

function SvgDownCarrot({ fill = '#b3b3b3', width = 8 }) {
  // get height and keep aspect ratio
  const height = Math.ceil((5 / 8) * width);

  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 8 5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m3.646 4.354-3-3 .708-.708L4 3.293 6.646.646l.708.708-3 3L4 4.707l-.354-.353Z"
        fill={fill}
      />
    </svg>
  );
}

SvgDownCarrot.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.number
};

export default React.memo(SvgDownCarrot);
