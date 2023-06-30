import * as React from 'react';
import PropTypes from 'prop-types';

function SvgDragDrop({ fill }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="61" height="60" fill="none">
      <path
        stroke={fill}
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M27.12 16.2c0 2.345 1.627 15.695 0 18.245-1.625 2.55-2.674-2.919-3.28-4.534-.784-2.092-3.456-2.536-3.615 0-.11 1.764 0 5.31 3.408 10.303 4.647 6.809 15.502 7.847 19.703-1.268 4.2-9.114 1.743-11.65-3.408-13.236-4.122-1.268-7.16-.819-8.164.476 0-1.348-.555-7.64-.555-9.987 0-2.932-4.088-2.932-4.088 0Z"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13.792 16.858s.52-1.316 2.874-3.428c2.354-2.111 6.848-2.971 6.848-2.971"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m21.177 9.293 3.505.726M22.77 12.96l1.912-2.942"
      />
      <circle cx="12.7" cy="18.5" r="1.75" stroke={fill} strokeWidth="1.5" />
    </svg>
  );
}

SvgDragDrop.defaultProps = {
  fill: '#000000'
};

SvgDragDrop.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgDragDrop);
