import * as React from 'react';
import PropTypes from 'prop-types';

function SvgSwipe({ fill }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="61" height="60" fill="none">
      {/* <rect width="60" height="60" x=".4" fill={bgFill} rx="4" /> */}
      <path
        stroke={fill}
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M24.686 16.424c0 2.346 1.625 15.696 0 18.246-1.626 2.55-2.675-2.92-3.28-4.534-.785-2.092-3.457-2.537-3.616 0-.11 1.763 0 5.31 3.408 10.303 4.647 6.808 15.502 7.847 19.703-1.268 4.2-9.115 1.743-11.65-3.409-13.236-4.12-1.268-7.16-.819-8.163.476 0-1.348-.555-7.641-.555-9.987 0-2.932-4.088-2.932-4.088 0Z"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M32.865 12h9.5"
      />
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m40.686 10 2.926 2.062M40.686 14l2.926-1.938"
      />
    </svg>
  );
}

SvgSwipe.defaultProps = {
  fill: '#000000'
};

SvgSwipe.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgSwipe);
