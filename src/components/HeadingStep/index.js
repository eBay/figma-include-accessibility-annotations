import * as React from 'react';
import PropTypes from 'prop-types';

// app state
import Context from '@/context';

// styles
import './styles.scss';

function HeadingStep({ list = null, number = null, text }) {
  const { isDevMode } = React.useContext(Context);
  const labelText = isDevMode ? text : `Step ${number}`;

  return (
    <div className="heading-step-container">
      <div className="heading-step">
        {labelText && <div className="circle-step">{labelText}</div>}

        {isDevMode === false && (
          <p dangerouslySetInnerHTML={{ __html: text }} />
        )}
      </div>

      {list !== null && (
        <ul>
          {list.map((line) => (
            <li key={line.id}>{line.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

HeadingStep.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  list: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      text: PropTypes.string
    })
  ),
  number: PropTypes.number
};

export default React.memo(HeadingStep);
