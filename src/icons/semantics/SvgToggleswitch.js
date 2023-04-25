import * as React from 'react';
import PropTypes from 'prop-types';

const SvgToggleswitch = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0V0z" fill="none"></path>
    <path d="M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79 4-4 4zM7 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z">
    </path>
  </svg>
);

SvgToggleswitch.defaultProps = {
  size: 48
};

SvgToggleswitch.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgToggleswitch);
