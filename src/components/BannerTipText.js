import * as React from 'react';
import PropTypes from 'prop-types';

function BannerTipText({ footer, helpText, helpUrl, text }) {
  return (
    <div className="banner-tip">
      <div className="flex-row align-start">
        <div className="tip-label">tip</div>

        <p dangerouslySetInnerHTML={{ __html: text }} />
      </div>

      {footer && footer}

      {helpUrl !== null && (
        <a className="tip-link" href={helpUrl} target="_blank" rel="noreferrer">
          {helpText}
        </a>
      )}
    </div>
  );
}

BannerTipText.defaultProps = {
  footer: null,
  helpText: 'Learn more',
  helpUrl: null
};

BannerTipText.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  footer: PropTypes.element,
  helpText: PropTypes.string,
  helpUrl: PropTypes.string
};

export default React.memo(BannerTipText);
