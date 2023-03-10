import * as React from 'react';
import PropTypes from 'prop-types';

const HeadingStep = ({ number, text }) => (
  <div className="heading-step">
    {number && <div className="circle-step">{`Step ${number}`}</div>}

    <p dangerouslySetInnerHTML={{ __html: text }} />
  </div>
);

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
