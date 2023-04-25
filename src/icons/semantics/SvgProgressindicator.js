import * as React from 'react';
import PropTypes from 'prop-types';

const SvgProgressindicator = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 512 512"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <g transform="translate(0.000000,512.000000) scale(0.050000,-0.050000)">
      <path d="M1387 8679 c-172 -34 -335 -160 -424 -328 l-53 -101 0 -800 0 -800
56 -114 c69 -140 202 -262 341 -310 160 -56 6226 -56 6386 0 139 48 272 170
341 310 l56 114 6 762 c7 960 -22 1060 -353 1223 l-113 55 -3080 3 c-1694 2
-3118 -5 -3163 -14z m3583 -1238 l0 -648 -1600 1 c-1709 0 -1698 0 -1776 82
-85 89 -94 143 -94 566 0 427 11 489 102 570 95 84 108 85 1768 81 l1600 -3 0
-649z"/>
      <path d="M1403 5279 c-202 -40 -363 -168 -450 -357 -42 -89 -43 -117 -43 -892
l0 -800 53 -101 c64 -121 188 -238 315 -296 l92 -43 3130 0 3130 0 92 43 c127
58 251 175 315 296 l53 101 0 800 0 800 -56 114 c-66 135 -198 258 -330 309
-104 40 -6107 64 -6301 26z m1712 -1245 l6 -654 -668 0 c-976 0 -953 -16 -953
660 0 678 -44 651 1030 649 l580 0 5 -655z"/>
    </g>
  </svg>
);

SvgProgressindicator.defaultProps = {
  size: 48
};

SvgProgressindicator.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgProgressindicator);
