import * as React from 'react';
import PropTypes from 'prop-types';

const SvgSearchbox = ({ size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
    >
    <path d="M0 0h24v24H0V0z" fill="none"></path>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
    </path>
  </svg>
);

SvgSearchbox.defaultProps = {
  size: 48
};

SvgSearchbox.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgSearchbox);
