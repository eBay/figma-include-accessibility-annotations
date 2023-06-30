import * as React from 'react';
import PropTypes from 'prop-types';
import { analytics } from '../constants';

// components
import BannerTip from './BannerTip';
import Footer from './Footer';

// app state
import Context from '../context';

function AnnotationStepPage({
  children,
  bannerTipProps,
  footerProps,
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

export const scrollToBottomOfAnnotationStep = () => {
  // scroll to bottom of main
  setTimeout(() => {
    const mainTag = document.getElementById('main');
    mainTag.scrollTo({
      top: mainTag.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }, 400);
};

AnnotationStepPage.defaultProps = {
  footerProps: {}
};

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
