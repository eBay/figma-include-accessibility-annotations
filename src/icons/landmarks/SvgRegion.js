import * as React from 'react';
import PropTypes from 'prop-types';

function SvgRegion({ fill = '#000000', fillSecondary = '#ffffff' }) {
  return (
    <svg width="61" height="61" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="17.551"
        y="24.349"
        width="21.762"
        height="17.325"
        rx=".445"
        fill={fillSecondary}
      />
      <rect
        x="28.536"
        y="26.25"
        width="9.719"
        height="5.071"
        rx=".445"
        fill={fill}
      />
      <rect
        x="11"
        y="24.349"
        width="5.493"
        height="17.325"
        rx=".445"
        fill={fillSecondary}
      />
      <rect
        x="40.577"
        y="24.349"
        width="9.296"
        height="17.325"
        rx=".445"
        fill={fillSecondary}
      />
      <rect
        x="11"
        y="15.264"
        width="38.876"
        height="4.437"
        rx=".445"
        fill={fillSecondary}
      />
      <rect
        x="11"
        y="20.969"
        width="38.876"
        height="2.324"
        rx=".445"
        fill={fillSecondary}
      />
      <rect
        x="11"
        y="42.942"
        width="38.876"
        height="2.747"
        rx=".445"
        fill={fillSecondary}
      />
    </svg>
  );
}

SvgRegion.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fillSecondary: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgRegion);
