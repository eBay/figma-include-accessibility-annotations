import * as React from 'react';
import PropTypes from 'prop-types';

const SvgSearch = ({ fill, fillSecondary }) => (
  <svg width="60" height="61" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="17.262"
      y="24.231"
      width="21.762"
      height="17.325"
      rx=".445"
      fill={fillSecondary}
    />
    <rect
      x="10.711"
      y="24.231"
      width="5.493"
      height="17.325"
      rx=".445"
      fill={fillSecondary}
    />
    <rect
      x="40.288"
      y="24.231"
      width="9.296"
      height="17.325"
      rx=".445"
      fill={fillSecondary}
    />
    <rect
      x="10.711"
      y="15.146"
      width="38.876"
      height="4.437"
      rx=".445"
      fill={fillSecondary}
    />
    <rect
      x="20.004"
      y="16.202"
      width="20.283"
      height="2.324"
      rx=".445"
      fill={fill}
    />
    <rect
      x="10.711"
      y="20.85"
      width="38.876"
      height="2.324"
      rx=".445"
      fill={fillSecondary}
    />
    <rect
      x="10.711"
      y="42.824"
      width="38.876"
      height="2.747"
      rx=".445"
      fill={fillSecondary}
    />
  </svg>
);

SvgSearch.defaultProps = {
  fill: '#000000',
  fillSecondary: '#ffffff'
};

SvgSearch.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fillSecondary: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgSearch);
