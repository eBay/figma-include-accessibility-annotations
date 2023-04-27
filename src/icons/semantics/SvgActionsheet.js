import * as React from 'react';
import PropTypes from 'prop-types';

const SvgActionsheet = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    viewBox="-2 -2 18 22"
    focusable="false"
  >


<g>
<path d="M14.0253 16.985L13.9985 7.98509L0.998544 8.02386L1.02539 17.0238L14.0253 16.985Z" fill="#000000" fillRule="nonzero" opacity="1" stroke="none"/>
<path d="M2.00152 9.02088L13.0015 8.98807L13.0224 15.988L2.0224 16.0208L2.00152 9.02088Z" />

<path d="M17.0223 15.9761L16.0223 15.9791" />
<path d="M13.9866 3.98511L0.986613 4.02388L0.995561 7.02387L13.9955 6.98509L13.9866 3.98511Z" fill="#000000" fillRule="nonzero" opacity="1" stroke="none"/>

<path d="M12.9925 5.98808L1.99257 6.02089L1.98959 5.0209L12.9895 4.98808L12.9925 5.98808Z" fill="#ffffff" fillRule="nonzero" opacity="1" stroke="none"/>
<path d="M13.9746-0.0148761L0.974682 0.0239001L0.98363 3.02389L13.9836 2.98511L13.9746-0.0148761Z" fill="#000000" fillRule="nonzero" opacity="1" stroke="none"/>
<path d="M12.9806 1.9881L1.98064 2.02091L1.97766 1.02091L12.9776 0.988102L12.9806 1.9881Z" fill="#ffffff" fillRule="nonzero" opacity="1" stroke="none"/>
</g>


  </svg>
);

SvgActionsheet.defaultProps = {
  size: 50
};

SvgActionsheet.propTypes = {
  // optional
  size: PropTypes.number
};

export default React.memo(SvgActionsheet);
