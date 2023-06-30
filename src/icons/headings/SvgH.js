import * as React from 'react';
import PropTypes from 'prop-types';

function SvgH({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.28196 9V0.272727H2.12713V3.87358H5.87287V0.272727H7.71378V9H5.87287V5.39489H2.12713V9H0.28196Z"
        fill="black"
        fillOpacity="0.8"
      />
    </svg>
  );
}

SvgH.defaultProps = {
  size: 9
};

SvgH.propTypes = {
  size: PropTypes.number
};

export default React.memo(SvgH);
