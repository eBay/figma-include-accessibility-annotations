import * as React from 'react';
import PropTypes from 'prop-types';

// components
import { LoadingSpinner } from '../components';

function ProgressLoading({ message }) {
  return (
    <div className="h-100 w-100 flex-center">
      <LoadingSpinner size={24} />

      <div className="muted pt2">{message}</div>
    </div>
  );
}

ProgressLoading.defaultProps = {
  message: 'Scanning for Accessibility layers in Figma document'
};

ProgressLoading.propTypes = {
  // optional
  message: PropTypes.string
};

export default React.memo(ProgressLoading);
