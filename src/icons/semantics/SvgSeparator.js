import * as React from 'react';
import PropTypes from 'prop-types';

const SvgSeparator = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path fillRule="evenodd" d="M4 11h16v2H4z">
    </path>
  </svg>
);

SvgSeparator.defaultProps = {
  size: 48
};

SvgSeparator.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgSeparator);
