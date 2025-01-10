import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgCheck } from '@/icons';

// styles
import './styles.scss';

function ProgressPieChart({ progress }) {
  const percentCss = {
    background: `conic-gradient(var(--figma-color-text) 0, var(--figma-color-text) ${progress}%, transparent 0, transparent 100%)`
  };

  return (
    <div className="flex-row-center">
      <div className="relative">
        <div className="progress-chart" style={percentCss} />

        {progress === 100 && (
          <div className="svg-theme_inverse progress-check">
            <SvgCheck size={14} />
          </div>
        )}
      </div>

      <div className="progress">{`${progress}%`}</div>
    </div>
  );
}

ProgressPieChart.propTypes = {
  // required
  progress: PropTypes.number.isRequired
};

export default React.memo(ProgressPieChart);
