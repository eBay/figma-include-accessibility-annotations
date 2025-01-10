import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgLoadingSpinner } from '@/icons';

// styles
import './styles.scss';

function LoadingSpinner({ fill = '#18a0fb', size = 20 }) {
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

LoadingSpinner.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(LoadingSpinner);
