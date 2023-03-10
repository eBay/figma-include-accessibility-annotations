import * as React from 'react';
import PropTypes from 'prop-types';

import Context from '../context';

import BannerTip from './BannerTip';
import Footer from './Footer';
import { analytics } from '../constants';

const AnnotationStepPage = ({
  children,
  bannerTipProps,
  footerProps,
  title,
  routeName
}) => {
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
        <React.Fragment>
          <BannerTip {...bannerTipProps} />
          <div className="spacer2" />
          <h2>{title}</h2>
          <div className="spacer2" />
          {children}
        </React.Fragment>
      </main>
      <Footer routeName={routeName} {...footerProps} />
    </React.Fragment>
  );
};

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
  children: PropTypes.element.isRequired,
  bannerTipProps: PropTypes.shape({
    pageType: PropTypes.oneOf(['web', 'native']).isRequired,
    routeName: PropTypes.string.isRequired,
    customFooter: PropTypes.element
  }).isRequired,
  footerProps: PropTypes.shape({
    primaryAction: PropTypes.object,
    secondaryAction: PropTypes.object
  }),
  title: PropTypes.string.isRequired,
  routeName: PropTypes.string.isRequired
};

export default AnnotationStepPage;
