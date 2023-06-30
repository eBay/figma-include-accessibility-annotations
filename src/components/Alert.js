import * as React from 'react';
import PropTypes from 'prop-types';

function Alert({ icon, style, text, type }) {
  return (
    <div className={`alert ${type}`} style={style}>
      {icon && <div className="mr2">{icon}</div>}

      <p>{text}</p>
    </div>
  );
}

Alert.defaultProps = {
  icon: null,
  style: {},
  type: 'info'
};

Alert.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  icon: PropTypes.element,
  style: PropTypes.object,
  type: PropTypes.oneOf(['info', 'warning'])
};

export default React.memo(Alert);
