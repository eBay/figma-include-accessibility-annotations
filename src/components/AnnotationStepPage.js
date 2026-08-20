import * as React from 'react';
import PropTypes from 'prop-types';
import { analytics } from '@/constants';

// components
import BannerTip from '@/components/BannerTip';
import Footer from '@/components/Footer';

// icons
import { SvgCheck } from '@/icons';

// app state
import Context from '@/context';

function AnnotationStepPage({
  bannerTipProps,
  children,
  completed = false,
  footerProps = {},
  title,
  routeName
}) {
  const cnxt = React.useContext(Context);
  const { currentUser, isDevMode, sessionId, isProd } = cnxt;

  React.useEffect(() => {
    analytics.logEvent({
      pageTitle: encodeURIComponent(routeName),
      sessionId,
      currentUser,
      isProd
    });
  }, []);

  const effectiveFooterProps = isDevMode
    ? {
        primaryAction: {
          buttonText: 'Next',
          completesStep: true
        },
        secondaryAction: {
          buttonText: 'Previous',
          isPrev: true
        }
      }
    : footerProps;

  return (
    <div className="container-main">
      <main id="main" tabIndex="-1">
        {isDevMode === false && (
          <React.Fragment>
            <BannerTip {...bannerTipProps} />
            <div className="space-sm" />
          </React.Fragment>
        )}

        <div className="flex-row-center">
          {isDevMode && (
            <div
              className={`completed-circle${completed ? ' completed-circle--completed' : ''}`}
            >
              {completed && (
                <div className="svg-theme_inverse">
                  <SvgCheck size={12} />
                </div>
              )}
            </div>
          )}

          <h2>{title}</h2>
        </div>
        <div className="space-sm" />

        {children}

        {isDevMode && (
          <React.Fragment>
            <div className="space-md" />
            <BannerTip {...bannerTipProps} />
          </React.Fragment>
        )}
      </main>

      <Footer routeName={routeName} {...effectiveFooterProps} />
    </div>
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
  completed: PropTypes.bool,
  footerProps: PropTypes.shape({
    primaryAction: PropTypes.object,
    secondaryAction: PropTypes.object
  })
};

export default AnnotationStepPage;
