import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@/constants';

// icons
import { SvgCheckSm, SvgDownCarrot } from '@/icons';

// styles
import './styles.scss';

function Dropdown(props) {
  const { align = 'left', data, disabledValues = [], index } = props;
  const { isOpened = false, onOpen, onSelect, type } = props;

  // ui state
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
        onKeyDown={({ key }) => {
          if (utils.isEnterKey(key)) onOpen(toggledValue);
        }}
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
        {data.map(({ id, label = null, value }) => {
          const disabled = disabledValues.includes(value);
          const displayLabel = label !== null ? label : value;

          return (
            <li
              key={id}
              className={`flex-row-center relative${
                disabled === true ? ' dropdown-option-disabled' : ''
              }`}
            >
              {type === value && (
                <div className="dropdown-option-selected">
                  <SvgCheckSm />
                </div>
              )}

              <div
                className="dropdown-option"
                onClick={() => {
                  if (disabled === true) return;

                  didSelect(value);
                }}
                onKeyDown={({ key }) => {
                  if (disabled === true) return;

                  if (utils.isEnterKey(key)) didSelect(value);
                }}
                role="button"
                tabIndex={isOpened ? 0 : -1}
              >
                {displayLabel}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        aria-hidden
        className="dropdown-overlay-close"
        onClick={() => onOpen(toggledValue)}
        onKeyDown={({ key }) => {
          if (utils.isEnterKey(key)) onOpen(toggledValue);
        }}
        role="button"
        tabIndex="-1"
      >
        &nbsp;
      </div>
    </div>
  );
}

Dropdown.propTypes = {
  // required
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      disabled: PropTypes.bool,
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired
    })
  ).isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onOpen: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,

  // optional
  align: PropTypes.oneOf(['left', 'right']),
  disabledValues: PropTypes.arrayOf(PropTypes.string),
  isOpened: PropTypes.bool
};

export default React.memo(Dropdown);
