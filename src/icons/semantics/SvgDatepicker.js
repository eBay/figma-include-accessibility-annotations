import * as React from 'react';
import PropTypes from 'prop-types';

const SvgDatepicker = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z">
    </path>
  </svg>
);

SvgDatepicker.defaultProps = {
  size: 48
};

SvgDatepicker.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgDatepicker);
