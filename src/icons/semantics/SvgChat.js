import * as React from 'react';
import PropTypes from 'prop-types';

const SvgChat = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z">
    </path>
  </svg>
);

SvgChat.defaultProps = {
  size: 48
};

SvgChat.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgChat);
