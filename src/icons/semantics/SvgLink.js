import * as React from 'react';
import PropTypes from 'prop-types';

const SvgLink = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
    </path>
  </svg>
);

SvgLink.defaultProps = {
  size: 48
};

SvgLink.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgLink);
