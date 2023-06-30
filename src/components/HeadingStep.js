import * as React from 'react';
import PropTypes from 'prop-types';

function HeadingStep({ number, text }) {
  return (
    <div className="heading-step">
      {number && <div className="circle-step">{`Step ${number}`}</div>}

      <p dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

HeadingStep.defaultProps = {
  number: null
};

HeadingStep.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  number: PropTypes.number
};

export default React.memo(HeadingStep);
