import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '../../constants';

// icons
import { SvgCheck } from '../../icons';

// styles
import './styles.scss';

function Checkbox({ checked, id, isDisabled, label, onClick }) {
  const checkedClass = checked ? ' checked' : '';

  // handle non-interactive state
  const noEvents = isDisabled ? ' no-events' : '';
  const onSelect = isDisabled ? () => null : onClick;

  return (
    <div
      aria-checked={checked}
      className={`container-checkbox${noEvents}`}
      id={id}
      onClick={onSelect}
      onKeyDown={({ key }) => {
        if (utils.isEnterKey(key)) onSelect();
      }}
      role="radio"
      tabIndex="0"
    >
      <div className={`checkbox${checkedClass}`}>
        {checked && <SvgCheck size={15} />}
      </div>

      {label !== null && (
        <label className="checkbox-label ml1" htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  );
}

Checkbox.defaultProps = {
  checked: false,
  isDisabled: false,
  label: null
};

Checkbox.propTypes = {
  // required
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,

  // optional
  checked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  label: PropTypes.string
};

export default React.memo(Checkbox);
