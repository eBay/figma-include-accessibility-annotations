import * as React from 'react';
import PropTypes from 'prop-types';

import tips from '../data/tips.json';

const BannerTip = ({ footer, pageType, routeName }) => {
  const tip = tips[pageType][routeName];

  return (
    <BannerTipText
      footer={footer}
      text={tip.text}
      helpUrl={tip.link?.url}
      helpText={tip.link?.text}
    />
  );
};

const BannerTipText = ({ footer, helpText, helpUrl, text }) => (
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

BannerTip.defaultProps = {
  footer: null,
  routeName: 'Landmarks'
};

BannerTip.propTypes = {
  footer: PropTypes.element,
  routeName: PropTypes.string,
  pageType: PropTypes.oneOf(['web', 'native']).isRequired
};

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

export default React.memo(BannerTip);
