import * as React from 'react';
import PropTypes from 'prop-types';

// styles
import './styles.scss';

function HeadingStep({ number = null, text }) {
  return (
    <div className="heading-step">
      {number && <div className="circle-step">{`Step ${number}`}</div>}

      <p dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

HeadingStep.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  number: PropTypes.number
};

export default React.memo(HeadingStep);
