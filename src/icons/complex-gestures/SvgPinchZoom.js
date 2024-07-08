import * as React from 'react';
import PropTypes from 'prop-types';

function SvgPinchZoom({ fill = '#000000' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="61" height="60" fill="none">
      <path
        stroke={fill}
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M29.716 17.2c0 2.345 1.626 15.695 0 18.245-1.626 2.55-4.442-1.155-5.047-2.77-.785-2.092-3.457-2.536-3.615 0-.11 1.763 2.163 7.065 4.91 9.716 5.932 5.724 15.767 6.67 19.967-2.445 4.2-9.114 1.744-11.65-3.408-13.236-4.121-1.268-7.16-.819-8.163.476 0-1.348-.555-7.64-.555-9.987 0-2.932-4.089-2.932-4.089 0Z"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m21.34 20.291 3.02-4.921"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m21.816 15.736 3.314-1.353M25.186 17.893l-.056-3.51"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m19.672 22.941-3.046 4.906"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m19.172 27.496-3.32 1.336M15.814 25.322l.037 3.51"
      />
    </svg>
  );
}

SvgPinchZoom.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgPinchZoom);
