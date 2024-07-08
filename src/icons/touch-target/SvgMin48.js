import * as React from 'react';
import PropTypes from 'prop-types';

function SvgMin48({ size = 60 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
    >
      <circle cx="30.25" cy="30" r="12" fill="#000" />
    </svg>
  );
}

SvgMin48.propTypes = {
  size: PropTypes.number
};

export default React.memo(SvgMin48);
