import * as React from 'react';
import PropTypes from 'prop-types';

// styles
import './styles.scss';

function Alert({ icon = null, style = {}, text, type = 'info' }) {
  return (
    <div className={`alert ${type}`} style={style}>
      {icon && <div className="mr1">{icon}</div>}

      <p>{text}</p>
    </div>
  );
}

Alert.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  icon: PropTypes.element,
  style: PropTypes.object,
  type: PropTypes.oneOf(['info', 'warning'])
};

export default React.memo(Alert);
