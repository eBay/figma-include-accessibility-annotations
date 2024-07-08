import * as React from 'react';
import PropTypes from 'prop-types';

// styles
import './styles.scss';

function BannerAlert({ icon = null, text }) {
  return (
    <div className="flex-row align-start">
      {icon && <div className="banner-alert-icon">{icon}</div>}

      <p>{text}</p>
    </div>
  );
}

BannerAlert.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  icon: PropTypes.element
};

export default React.memo(BannerAlert);
