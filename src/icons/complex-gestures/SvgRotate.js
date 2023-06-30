import * as React from 'react';
import PropTypes from 'prop-types';

function SvgRotate({ fill }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="61" height="60" fill="none">
      <path
        stroke={fill}
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M29.52 18.2c0 2.345 1.627 15.695 0 18.245-1.625 2.55-2.674-2.919-3.28-4.534-.784-2.092-3.456-2.536-3.615 0-.11 1.764 0 5.31 3.408 10.303 4.647 6.809 15.502 7.847 19.703-1.268 4.2-9.114 1.743-11.65-3.408-13.236-4.122-1.268-7.16-.819-8.164.476 0-1.348-.555-7.64-.555-9.987 0-2.932-4.088-2.932-4.088 0Z"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.074 19.315s-3.029-1.823-1.667-5.047c1.363-3.224 5.897-2.394 5.897-2.394"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m16.45 9.781 2.946 2.033M16.488 13.781l2.907-1.966"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M22.07 14.868s3.028 1.824 1.666 5.048-5.896 2.394-5.896 2.394"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m19.694 24.402-2.946-2.033M19.655 20.402l-2.907 1.967"
      />
    </svg>
  );
}

SvgRotate.defaultProps = {
  fill: '#000000'
};

SvgRotate.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgRotate);
