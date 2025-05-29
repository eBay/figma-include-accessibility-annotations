import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@/constants';

// styles
import './styles.scss';

function SlidingToggle({ checked = false, label, onChange }) {
  return (
    <div
      aria-checked={checked}
      aria-label="toggle switch"
      className="toggle-wrapper"
      onClick={() => onChange(!checked)}
      onKeyDown={({ key }) => {
        if (utils.isEnterKey(key)) onChange(!checked);
      }}
      role="switch"
      tabIndex="0"
    >
      <div className={`toggle-container${checked ? ' checked' : ''}`}>
        <div className="toggle-slider" />
      </div>

      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
}

SlidingToggle.propTypes = {
  // required
  onChange: PropTypes.func.isRequired,

  // optional
  checked: PropTypes.bool,
  label: PropTypes.string
};

export default React.memo(SlidingToggle);
