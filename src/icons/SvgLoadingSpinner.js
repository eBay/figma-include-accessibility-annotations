import * as React from 'react';
import PropTypes from 'prop-types';

function SvgLoadingSpinner({ fill, size }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 16 16"
    >
      <path
        d="M15.5 8c0 1.5-.4 2.9-1.3 4.2-.8 1.2-2 2.2-3.4 2.8-1.4.6-2.9.7-4.3.4-1.5-.3-2.8-1-3.8-2.1S.9 10.9.6 9.5c-.2-1.5-.1-3 .5-4.4.6-1.4 1.5-2.5 2.8-3.4C5.1.9 6.5.5 8 .5"
        stroke={fill}
      />
    </svg>
  );
}

SvgLoadingSpinner.defaultProps = {
  fill: '#18a0fb',
  size: 16
};

SvgLoadingSpinner.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgLoadingSpinner);
