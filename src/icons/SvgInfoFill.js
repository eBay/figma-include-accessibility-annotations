import * as React from 'react';
import PropTypes from 'prop-types';

function SvgInfoFill({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.834 0c-6.628 0-12 5.373-12 12s5.372 12 12 12c6.627 0 12-5.373 12-12-.006-6.625-5.375-11.994-12-12Zm-1 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
        fill={fill}
      />
    </svg>
  );
}

SvgInfoFill.defaultProps = {
  fill: '#111820',
  size: 24
};

SvgInfoFill.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgInfoFill);
