import * as React from 'react';
import PropTypes from 'prop-types';

function SvgH1({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.816413 9V0.272727H2.66158V3.87358H6.40732V0.272727H8.24823V9H6.40732V5.39489H2.66158V9H0.816413ZM13.5753 0.272727V9H11.7301V2.02415H11.679L9.68039 3.27699V1.64062L11.8409 0.272727H13.5753Z"
        fill="black"
        fillOpacity="0.8"
      />
    </svg>
  );
}

SvgH1.propTypes = {
  size: PropTypes.number
};

export default React.memo(SvgH1);
