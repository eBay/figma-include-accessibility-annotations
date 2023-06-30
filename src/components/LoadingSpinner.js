import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgLoadingSpinner } from '../icons';

function LoadingSpinner({ fill, size }) {
  return (
    <div
      aria-label="loading"
      className="loading-spinner svg-theme-primary"
      role="img"
    >
      <SvgLoadingSpinner fill={fill} size={size} />
    </div>
  );
}

LoadingSpinner.defaultProps = {
  fill: '#18a0fb',
  size: 20
};

LoadingSpinner.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(LoadingSpinner);
