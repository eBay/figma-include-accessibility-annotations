import * as React from 'react';
import PropTypes from 'prop-types';

function SvgEyeOpened({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 11a6.495 6.495 0 0 1-5.478-3A6.495 6.495 0 0 1 8 5c2.3 0 4.322 1.194 5.479 3A6.495 6.495 0 0 1 8 11Zm0-7a7.499 7.499 0 0 1 6.635 4A7.499 7.499 0 0 1 8 12a7.499 7.499 0 0 1-6.635-4A7.499 7.499 0 0 1 8 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        fill={fill}
      />
    </svg>
  );
}

SvgEyeOpened.defaultProps = {
  fill: '#111820',
  size: 16
};

SvgEyeOpened.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgEyeOpened);
