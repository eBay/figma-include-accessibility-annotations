import * as React from 'react';
import PropTypes from 'prop-types';

// components
import { LoadingSpinner } from '../components';

// icons
import { SvgWarning } from '../icons';

function ProgressLoading({
  message = 'Scanning for Accessibility layers in Figma document',
  showWarning = false
}) {
  return (
    <div className="h-100 w-100 flex-center">
      {showWarning === false && <LoadingSpinner size={24} />}
      {showWarning === true && <SvgWarning size={24} />}

      <div className="loading-message">{message}</div>
    </div>
  );
}

ProgressLoading.propTypes = {
  // optional
  message: PropTypes.string,
  showWarning: PropTypes.bool
};

export default React.memo(ProgressLoading);
