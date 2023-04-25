import * as React from 'react';
import PropTypes from 'prop-types';

const SvgTextarea = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z">
    </path>
  </svg>
);

SvgTextarea.defaultProps = {
  size: 48
};

SvgTextarea.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgTextarea);
