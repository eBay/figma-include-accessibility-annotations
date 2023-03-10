import * as React from 'react';
import PropTypes from 'prop-types';

const SvgMultiFingerTap = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none">
    <path
      stroke={fill}
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M25.159 17.461c0 2.346 1.626 15.696 0 18.246-1.626 2.55-4.442-1.155-5.048-2.77-.784-2.092-3.457-2.537-3.615 0-.11 1.763 2.163 7.065 4.91 9.716 5.932 5.724 15.767 6.67 19.968-2.445 4.2-9.114 1.743-11.65-3.409-13.236-.99-.305-2.223-.71-3.223-.71-.5-1.5 0-6.5 0-9s-3.5-2-3.681.2c-.252 3.042.287 13.425-.819 12.8-.5-.283-.995-10.455-.995-12.8 0-2.933-4.088-2.933-4.088 0Z"
    />
    <path
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M23.589 14.112s-.151-2.459 2.015-3.21c2.166-.753 3.461 2.001 3.461 2.001M31.634 13.03s.873-2.303 3.157-2.097c2.284.205 2.332 3.249 2.332 3.249"
    />
  </svg>
);

SvgMultiFingerTap.defaultProps = {
  fill: '#000000'
};

SvgMultiFingerTap.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgMultiFingerTap);
