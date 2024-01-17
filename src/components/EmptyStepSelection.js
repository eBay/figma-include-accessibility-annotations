import * as React from 'react';
import PropTypes from 'prop-types';

// components
import Checkbox from './Checkbox';

function EmptyStepSelection({ id, isDisabled, isSelected, onClick, text }) {
  return (
    <React.Fragment>
      <Checkbox
        id={id}
        checked={isSelected}
        isDisabled={isDisabled}
        label={text}
        onClick={onClick}
      />

      <div className="spacer2" />
    </React.Fragment>
  );
}

EmptyStepSelection.defaultProps = {
  isDisabled: false
};

EmptyStepSelection.propTypes = {
  // required
  id: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,

  // optional
  isDisabled: PropTypes.bool
};

export default EmptyStepSelection;
