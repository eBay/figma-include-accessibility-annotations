import * as React from 'react';
import PropTypes from 'prop-types';
import { analytics } from '@/constants';

// components
import BannerTip from '@/components/BannerTip';
import Footer from '@/components/Footer';

// app state
import Context from '@/context';

function AnnotationStepPage({
  children,
  bannerTipProps,
  footerProps = {},
  title,
  routeName
}) {
  const cnxt = React.useContext(Context);
  const { currentUser, sessionId, isProd } = cnxt;

  React.useEffect(() => {
    analytics.logEvent({
      pageTitle: encodeURIComponent(routeName),
      sessionId,
      currentUser,
      isProd
    });
  }, []);

  return (
    <React.Fragment>
      <main id="main" tabIndex="-1">
        <BannerTip {...bannerTipProps} />
        <div className="spacer2" />
        <h2>{title}</h2>
        <div className="spacer2" />
        {children}
      </main>
      <Footer routeName={routeName} {...footerProps} />
    </React.Fragment>
  );
}

AnnotationStepPage.propTypes = {
  // required
  bannerTipProps: PropTypes.shape({
    pageType: PropTypes.oneOf(['web', 'native']).isRequired,
    routeName: PropTypes.string.isRequired,
    customFooter: PropTypes.element
  }).isRequired,
  children: PropTypes.element.isRequired,
  routeName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,

  // optional
  footerProps: PropTypes.shape({
    primaryAction: PropTypes.object,
    secondaryAction: PropTypes.object
  })
};

export default AnnotationStepPage;
