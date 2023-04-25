import * as React from 'react';
import PropTypes from 'prop-types';

const SvgTextbox = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 96 960 960"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
  >
    <path
      d="M290 896V356H80V256h520v100H390v540H290Zm360 0V556H520V456h360v100H750v340H650Z"
    />
  </svg>
);

SvgTextbox.defaultProps = {
  size: 48
};

SvgTextbox.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgTextbox);
