import * as React from 'react';
import PropTypes from 'prop-types';

function SvgInfo({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7 8A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm-.5-4.5v-4h1v4h-1ZM8.75 5a.75.75 0 0 1-1.5 0v-.068a.75.75 0 0 1 1.5 0V5Z"
        fill={fill}
        fillRule="evenodd"
      />
    </svg>
  );
}

SvgInfo.defaultProps = {
  fill: '#111820',
  size: 16
};

SvgInfo.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgInfo);
