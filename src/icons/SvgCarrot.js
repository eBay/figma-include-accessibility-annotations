import * as React from 'react';
import PropTypes from 'prop-types';

function SvgCarrot({ fill, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill={fill} d="m4 6 3-4H1l3 4Z" />
    </svg>
  );
}

SvgCarrot.defaultProps = {
  fill: '#111820',
  size: 8
};

SvgCarrot.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgCarrot);
