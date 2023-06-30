import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function FooterActionButton(props) {
  const { children, className, goToNextStep, isDisabled } = props;
  const { isLast, onClick, next } = props;

  // show an interactive button
  if (goToNextStep && !isDisabled) {
    return (
      <Link
        to={isLast ? '/' : `/${next}`}
        type="button"
        className={className}
        onClick={onClick}
        tabIndex="-1"
      >
        {children}
      </Link>
    );
  }

  // show a disabled button
  return (
    <button
      disabled={isDisabled}
      type="button"
      className={`${className}${isDisabled ? ' no-events' : ''}`}
      onClick={isDisabled ? () => {} : onClick}
    >
      {children}
    </button>
  );
}

FooterActionButton.defaultProps = {
  className: '',
  goToNextStep: false,
  isDisabled: false,
  onClick: () => {},
  next: null
};

FooterActionButton.propTypes = {
  // required
  children: PropTypes.node.isRequired,
  isLast: PropTypes.bool.isRequired,

  // optional
  className: PropTypes.string,
  goToNextStep: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  next: PropTypes.string
};

export default React.memo(FooterActionButton);
