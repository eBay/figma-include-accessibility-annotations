import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgInfoFill } from '@/icons';

function DevStepIncomplete({ label, text = null }) {
  return (
    <div className="flex-row align-start">
      <div className="svg-theme mr1">
        <SvgInfoFill size={16} />
      </div>

      <p>
        {text ||
          `The design has not been checked for ${label}. Check with the designer about completing this step.`}
      </p>
    </div>
  );
}

DevStepIncomplete.propTypes = {
  label: PropTypes.string.isRequired,
  text: PropTypes.string
};

export default React.memo(DevStepIncomplete);
