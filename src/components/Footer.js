import * as React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { analytics, utils } from '../constants';

// components
import FooterActionButton from './FooterActionButton';

// icons
import { SvgArrowRight } from '../icons';

// app state
import Context from '../context';

// data
import routes from '../data/routes.json';
import routesNative from '../data/routes-native.json';

function Footer({ primaryAction = null, secondaryAction = null, routeName }) {
  // main app state
  const cnxt = React.useContext(Context);
  const { hasDashboard, isProd, page, pages, pageType } = cnxt;
  const { steps, stepsNative, stepsCompleted, leftNavVisible } = cnxt;
  const { sessionId, currentUser, sendToFigma, updateState } = cnxt;

  // web or native flow
  const isWeb = pageType === 'web';
  const routeData = isWeb ? routes : routesNative;
  const stepsArray = isWeb ? steps : stepsNative;

  // local state
  const [next, setNext] = React.useState(null);
  const [isLast, setIsLast] = React.useState(false);

  // class state
  const hasDashboardClass = hasDashboard ? ' has-dashboard' : '';

  // handle route changes
  const location = useLocation();

  const backToDashboard = () => {
    updateState('colorBlindnessView', false);

    // resize plugin (go back to their pref)
    const pluginWidth = leftNavVisible === false ? 516 : 700;
    sendToFigma('resize-plugin', {
      condensed: leftNavVisible === false,
      height: 518,
      width: pluginWidth
    });

    // reset main state and return to dashboard
    updateState('showDashboard', true);
    updateState('showSettings', false);

    updateState('page', null);
    updateState('pageType', null);
    updateState('stepsCompleted', []);
    updateState('stepsData', {});

    updateState('landmarks', {});

    updateState('headings', {});

    updateState('imagesData', []);
    updateState('imagesScanned', []);

    updateState('contrastResults', null);

    updateState('gestures', {});
    updateState('gesturesTemp', null);

    updateState('touchTargets', {});

    // make all layers visible
    sendToFigma('show-all-layers');
  };

  const onCompleteStep = () => {
    // check if this was an already-completed step
    const newStepsCompleted = [...stepsCompleted];
    const indexFound = stepsCompleted.indexOf(routeName);

    // If not, add it as completed
    if (indexFound < 0) newStepsCompleted.push(routeName);

    sendToFigma('steps-completed', {
      stepsCompleted: newStepsCompleted,
      page,
      pageType,
      stepsNative,
      steps
    });

    // event for step completed
    analytics.logEvent({
      name: 'step_completed',
      pageTitle: encodeURIComponent(routeName),
      sessionId,
      currentUser,
      isProd
    });

    updateState('stepsCompleted', newStepsCompleted);

    // check if we have pages data
    if (pages.length > 0) {
      // check for this specific page data
      const dataIndexFound = pages.findIndex((p) => p.pageId === page.id);

      // does previous data exist?
      if (dataIndexFound >= 0) {
        // update new steps completed
        const newPages = [...pages];
        newPages[dataIndexFound].stepsCompleted = newStepsCompleted;

        // update main state
        updateState('pages', newPages);
      }
    }
  };

  // listen for route change, adjust prev/next state
  React.useEffect(() => {
    // remove starting slash from path
    const path = location.pathname.replace(/[/]/g, '');

    // default and / path, 0 index
    let indexFound = 0;
    if (path !== '') {
      const filteredRoutes = Object.keys(routeData).filter(
        (route) => routeData[route].path === path
      );
      indexFound = stepsArray.indexOf(filteredRoutes[0]);
    }

    // TODO: clean this up
    const nextIndex = indexFound + 1;
    const newNext =
      indexFound === stepsArray.length - 1
        ? null
        : routeData[stepsArray[nextIndex]].path;
    const newIsLast = indexFound === stepsArray.length - 1;

    // set new next states
    setNext(newNext);
    setIsLast(newIsLast);
  }, [location]);

  return (
    <footer className={hasDashboardClass}>
      {hasDashboard && (
        <Link
          to="/"
          className="flex-row-center border-radius-2 link no-underline cursor-pointer"
          onClick={backToDashboard}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) backToDashboard();
          }}
          role="button"
          tabIndex="0"
        >
          <div className="svg-theme-stroke_link rotate-180">
            <SvgArrowRight />
          </div>
          <div className="spacer1w" />
          Dashboard
        </Link>
      )}

      <div className="flex-row-center">
        {secondaryAction !== null && (
          <FooterActionButton
            goToNextStep={
              secondaryAction.skipsStep || secondaryAction.completesStep
            }
            className="btn no-underline flex-row-center"
            onClick={() => {
              if (secondaryAction.onClick) secondaryAction.onClick();
              if (secondaryAction.skipsStep || secondaryAction.completesStep) {
                if (secondaryAction.completesStep) onCompleteStep();

                if (isLast) {
                  backToDashboard();
                  // if keyboard user, focus on main content after navigation
                  const elMain = document.getElementById('main');

                  if (elMain !== null) {
                    elMain.focus();
                  }
                }
              }
            }}
            isLast={isLast}
            next={next}
            isDisabled={primaryAction.isDisabled}
          >
            {secondaryAction.buttonText || 'Skip'}
          </FooterActionButton>
        )}

        {primaryAction !== null && (
          <FooterActionButton
            goToNextStep={primaryAction.completesStep}
            className="btn primary no-underline flex-row-center ml1"
            onClick={() => {
              if (primaryAction.onClick) primaryAction.onClick();
              if (primaryAction.completesStep) {
                onCompleteStep();

                if (isLast) {
                  backToDashboard();
                  // if keyboard user, focus on main content after navigation
                  const elMain = document.getElementById('main');

                  if (elMain !== null) {
                    elMain.focus();
                  }
                }
              }
            }}
            isDisabled={primaryAction.isDisabled}
            isLast={isLast}
            next={next}
          >
            {primaryAction.buttonText || 'Save and continue'}
          </FooterActionButton>
        )}
      </div>
    </footer>
  );
}

Footer.propTypes = {
  // required
  routeName: PropTypes.string.isRequired,

  // optional
  primaryAction: PropTypes.shape({
    onClick: PropTypes.func,
    buttonText: PropTypes.string,
    isDisabled: PropTypes.bool,
    completesStep: PropTypes.bool
  }),
  secondaryAction: PropTypes.shape({
    completesStep: PropTypes.bool,
    onClick: PropTypes.func,
    buttonText: PropTypes.string,
    isDisabled: PropTypes.bool,
    skipsStep: PropTypes.bool
  })
};

export default React.memo(Footer);
