import * as React from 'react';
import PropTypes from 'prop-types';

function SvgSettings({ fill }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" fill="none">
      <path
        fill={fill}
        fillRule="evenodd"
        d="M12.25 17.03V9.98h1v7.05a2.5 2.5 0 0 1 0 4.9v2.05h-1v-2.05a2.5 2.5 0 0 1 0-4.9Zm2 2.45a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm5 4.5h1v-7.05a2.5 2.5 0 0 0 0-4.9V9.98h-1v2.05a2.5 2.5 0 0 0 0 4.9v7.05Zm2-9.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SvgSettings.defaultProps = {
  fill: '#3665f3'
};

SvgSettings.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default React.memo(SvgSettings);
