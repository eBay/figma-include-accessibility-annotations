import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgCheckSm, SvgDownCarrot } from '../icons';

const Dropdown = ({ align, data, index, isOpened, onOpen, onSelect, type }) => {
  const toggledValue = isOpened ? null : index;
  const openedClass = isOpened ? ' opened' : '';
  const alignClass = align === 'right' ? ' align-right' : '';

  const didSelect = (selectedType) => {
    // set new selection
    onSelect(selectedType, index);
    // close dropdown
    onOpen(toggledValue);
  };

  return (
    <div className={`container-dropdown${openedClass}`}>
      <div
        className="dropdown"
        onClick={() => onOpen(toggledValue)}
        onKeyPress={() => onOpen(toggledValue)}
        role="button"
        tabIndex="0"
      >
        {type}

        <div className="spacerhalfw" />

        <div className="svg-theme">
          <SvgDownCarrot width={12} />
        </div>
      </div>

      <ul className={`dropdown-options${alignClass}`}>
        {data.map(({ id, value }) => (
          <li key={id} className="flex-row-center relative">
            {type === value && (
              <div className="dropdown-option-selected">
                <SvgCheckSm />
              </div>
            )}

            <div
              className="dropdown-option"
              onClick={() => didSelect(value)}
              onKeyPress={() => didSelect(value)}
              role="button"
              tabIndex={isOpened ? 0 : -1}
            >
              {value}
            </div>
          </li>
        ))}
      </ul>

      <div
        className="dropdown-overlay-close"
        onClick={() => onOpen(toggledValue)}
        onKeyPress={() => onOpen(toggledValue)}
        role="button"
        tabIndex="-1"
      >
        &nbsp;
      </div>
    </div>
  );
};

Dropdown.defaultProps = {
  align: 'left',
  isOpened: false
};

Dropdown.propTypes = {
  // required
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onOpen: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,

  // optional
  align: PropTypes.oneOf(['left', 'right']),
  isOpened: PropTypes.bool
};

export default React.memo(Dropdown);
