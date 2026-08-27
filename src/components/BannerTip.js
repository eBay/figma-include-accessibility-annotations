import * as React from 'react';
import PropTypes from 'prop-types';

// components
import BannerTipText from '@/components/BannerTipText';

// app state
import Context from '@/context';

// data
import tips from '@/data/tips.json';

function BannerTip({ footer = null, pageType, routeName = 'Landmarks' }) {
  const { isDevMode } = React.useContext(Context);
  const tipKey = isDevMode ? `${pageType}-dev` : pageType;
  const tip = tips[tipKey][routeName];

  return (
    <BannerTipText
      footer={footer}
      text={tip.text}
      helpUrl={tip.link?.url}
      helpText={tip.link?.text}
    />
  );
}

BannerTip.propTypes = {
  footer: PropTypes.element,
  routeName: PropTypes.string,
  pageType: PropTypes.oneOf(['web', 'native']).isRequired
};

export default React.memo(BannerTip);
