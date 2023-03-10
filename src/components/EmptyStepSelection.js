import * as React from 'react';
import PropTypes from 'prop-types';
import Checkbox from './Checkbox';

const EmptyStepSelection = ({ stepName, isSelected, onClick, isDisabled }) => {
  const label = `no ${stepName}`;

  return (
    <>
      <Checkbox
        id={stepName}
        checked={isSelected}
        isDisabled={isDisabled}
        label={label}
        onClick={onClick}
      />
      <div className="spacer2" />
    </>
  );
};

EmptyStepSelection.defaultProps = {
  isDisabled: false
};

EmptyStepSelection.propTypes = {
  stepName: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

export default EmptyStepSelection;
