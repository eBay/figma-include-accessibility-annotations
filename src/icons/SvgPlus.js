import * as React from 'react';
import PropTypes from 'prop-types';

function SvgPlus({ fill = '#111820' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none">
      <path
        fill={fill}
        fillOpacity=".8"
        fillRule="evenodd"
        d="M7.75 8.48v-5h1v5h5v1h-5v5h-1v-5h-5v-1h5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SvgPlus.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgPlus);
