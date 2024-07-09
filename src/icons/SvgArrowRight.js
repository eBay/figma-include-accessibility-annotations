import * as React from 'react';
import PropTypes from 'prop-types';

function SvgArrowRight({ fill = '#189ffb' }) {
  return (
    <svg
      width="14"
      height="11"
      viewBox="0 0 14 11"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.243 1.257 12.5 5.5m0 0L8.243 9.743M12.5 5.5H0"
        stroke={fill}
      />
    </svg>
  );
}

SvgArrowRight.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgArrowRight);
