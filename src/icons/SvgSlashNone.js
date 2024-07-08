import * as React from 'react';
import PropTypes from 'prop-types';

function SvgSlashNone({ bgFill = '#e5e5e5', fill = '#000000' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none">
      <rect width="60" height="60" fill={bgFill} rx="4" />
      <path stroke={fill} d="M11.662 44.499 47.7 14.729" />
    </svg>
  );
}

SvgSlashNone.propTypes = {
  // optional
  bgFill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgSlashNone);
