import * as React from 'react';
import PropTypes from 'prop-types';

function SvgWarning({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m8 0 8 14.5H0L8 0Zm0 4.382a.9.9 0 0 1 .9.9V8.37a.9.9 0 1 1-1.8 0V5.282a.9.9 0 0 1 .9-.9Zm1.1 7.375a1.1 1.1 0 0 0-2.2 0v.068a1.1 1.1 0 0 0 2.2 0v-.068Z"
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

SvgWarning.defaultProps = {
  fill: '#f24822',
  size: 16
};

SvgWarning.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgWarning);
