import * as React from 'react';
import PropTypes from 'prop-types';

const SvgTabgroup = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z">
    </path>
  </svg>
);

SvgTabgroup.defaultProps = {
  size: 48
};

SvgTabgroup.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgTabgroup);
