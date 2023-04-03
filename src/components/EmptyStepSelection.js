import * as React from 'react';
import PropTypes from 'prop-types';

// components
import Checkbox from './Checkbox';

const EmptyStepSelection = ({ stepName, isSelected, onClick, isDisabled }) => {
  const label = `no ${stepName}`;

  return (
    <React.Fragment>
      <Checkbox
        id={stepName}
        checked={isSelected}
        isDisabled={isDisabled}
        label={label}
        onClick={onClick}
      />
      <div className="spacer2" />
    </React.Fragment>
  );
};

EmptyStepSelection.defaultProps = {
  isDisabled: false
};

EmptyStepSelection.propTypes = {
  // required
  stepName: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,

  // optional
  isDisabled: PropTypes.bool
};

export default EmptyStepSelection;
