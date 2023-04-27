import * as React from 'react';
import PropTypes from 'prop-types';

const SvgScrollview = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="0 96 960 960"
    focusable="false"
  >
    <path d="M263 650V502l-75 74 75 74Zm217 137 74-75H407l73 75Zm-73-347h147l-74-74-73 74Zm292 211 74-74-74-75v149ZM140 896q-24 0-42-18t-18-42V316q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm0-60h680V316H140v520Zm0 0V316v520Z" />
  </svg>
);

SvgScrollview.defaultProps = {
  size: 48
};

SvgScrollview.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgScrollview);
