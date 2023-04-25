import * as React from 'react';
import PropTypes from 'prop-types';

const SvgModaldialog = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z">
    </path>
  </svg>
);

SvgModaldialog.defaultProps = {
  size: 48
};

SvgModaldialog.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgModaldialog);
