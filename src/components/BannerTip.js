import * as React from 'react';
import PropTypes from 'prop-types';

// components
import BannerTipText from './BannerTipText';

// data
import tips from '../data/tips.json';

function BannerTip({ footer, pageType, routeName }) {
  const tip = tips[pageType][routeName];

  return (
    <BannerTipText
      footer={footer}
      text={tip.text}
      helpUrl={tip.link?.url}
      helpText={tip.link?.text}
    />
  );
}

BannerTip.defaultProps = {
  footer: null,
  routeName: 'Landmarks'
};

BannerTip.propTypes = {
  footer: PropTypes.element,
  routeName: PropTypes.string,
  pageType: PropTypes.oneOf(['web', 'native']).isRequired
};

export default React.memo(BannerTip);
