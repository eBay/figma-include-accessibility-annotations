import * as React from 'react';
import PropTypes from 'prop-types';

const SvgExpanderaccordion = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="-2 -2 22 22"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M4 0v9h13v-9h-13zM16 8h-11v-7h11v7zM0 3h3v-3h-3v3zM1 1h1v1h-1v-1zM4 13h13v-3h-13v3zM5 11h11v1h-11v-1zM0 13h3v-3h-3v3zM1 11h1v1h-1v-1zM4 17h13v-3h-13v3zM5 15h11v1h-11v-1zM0 17h3v-3h-3v3zM1 15h1v1h-1v-1z" />
  </svg>
);

SvgExpanderaccordion.defaultProps = {
  size: 50
};

SvgExpanderaccordion.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgExpanderaccordion);
