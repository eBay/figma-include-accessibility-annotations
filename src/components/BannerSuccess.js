import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgCheck } from '@/icons';

function BannerSuccess({ text }) {
  return (
    <div className="flex-row align-start">
      <div className="circle-success svg-theme-success mr1">
        <SvgCheck size={14} />
      </div>

      <p>{text}</p>
    </div>
  );
}

BannerSuccess.propTypes = {
  // required
  text: PropTypes.string.isRequired
};

export default React.memo(BannerSuccess);
