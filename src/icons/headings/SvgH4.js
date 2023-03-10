import * as React from 'react';
import PropTypes from 'prop-types';

const SvgH4 = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 13 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.139165 7V0.454545H1.52304V3.15518H4.33235V0.454545H5.71303V7H4.33235V4.29616H1.52304V7H0.139165ZM6.76158 5.84943V4.75959L9.49418 0.454545H10.4338V1.96307H9.8777L8.15505 4.68928V4.74041H12.0382V5.84943H6.76158ZM9.90327 7V5.51705L9.92884 5.03445V0.454545H11.2264V7H9.90327Z"
      fill="black"
      fillOpacity="0.8"
    />
  </svg>
);

SvgH4.defaultProps = {
  size: 17
};

SvgH4.propTypes = {
  size: PropTypes.number
};

export default React.memo(SvgH4);
