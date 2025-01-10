import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// styles
import '@/styles/base.scss';

// pages
import ProgressLoading from '@/pages/ProgressLoading';
import PageChange from '@/pages/PageChange';
import Dashboard from '@/pages/Dashboard';
import ChooseYourOwnAdventure from '@/pages/ChooseYourOwnAdventure';
import SelectFrameToStart from '@/pages/SelectFrameToStart';
import Landmarks from '@/pages/Landmarks';
import Headings from '@/pages/Headings';
import ReadingOrder from '@/pages/ReadingOrder';
import AltText from '@/pages/AltText';
import Contrast from '@/pages/Contrast';
import TouchTarget from '@/pages/TouchTarget';
import TextZoom from '@/pages/TextZoom';
import ResponsiveReflow from '@/pages/ResponsiveReflow';
import FocusGrouping from '@/pages/FocusGrouping';
import ComplexGestures from '@/pages/ComplexGestures';
import ColorBlindness from '@/pages/ColorBlindness';
import Settings from '@/pages/Settings';

// components
import { NavLeft } from '@/components';

// app context state
import AppState from '@/context/AppState';

// app state
import Context from '@/context';

// data
import routes from '@/data/routes.json';
import routesNative from '@/data/routes-native.json';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  const cnxt = React.useContext(Context);
  const { alertMsg, condensedUI, isLoading, loadingMsg, leftNavVisible } = cnxt;
  const { colorBlindnessView, page, pageSelected, pageType } = cnxt;
  const { steps, stepsNative, stepsCompleted, stepsData, showDashboard } = cnxt;
  const { showPageChange, showSettings, sendToFigma, updateState } = cnxt;

  // local state
  const [progressPercent, setPercentage] = React.useState(null);
  const [showLoadingWarning, setLoadingWarning] = React.useState(false);

  // hook for route changes
  const location = useLocation();

  // on load, start timers for 15 seconds and 60 seconds using a useEffect
  // if isLoading state changes, cancel timers
  React.useEffect(() => {
    let timer15;
    let timer60;

    if (isLoading === true) {
      timer15 = setTimeout(() => {
        updateState(
          'loadingMsg',
          'If you have a lot of pages with annotations, and high-res images, try moving them to their own Figma page to get it to load faster.'
        );
      }, 15000);

      timer60 = setTimeout(() => {
        updateState(
          'loadingMsg',
          "We couldn't load the annotations. If you have a lot of pages with annotations, and high-res images, try moving them to their own Figma page to get it to load faster."
        );
        setLoadingWarning(true);
      }, 60000);
    }

    return () => {
      clearTimeout(timer15);
      clearTimeout(timer60);
    };
  }, [isLoading]);

  // listen for route change, adjust show/hide layers in Figma document
  React.useEffect(() => {
    // remove starting slash from path
    const currentPath = location.pathname.replace(/[/]/g, '');
    const stepsDataKeysArray = Object.keys(stepsData);
    const routeData = pageType === 'web' ? routes : routesNative;
    const routeKeysArray = Object.keys(routeData);

    // do we have step data?
    if (stepsDataKeysArray.length > 0) {
      // loop through routes, and hide all steps that are not currently active
      const layerIdsToHide = [];
      const layerIdsToShow = [];

      for (let i = 0; i < routeKeysArray.length; i += 1) {
        const key = routeKeysArray[i];
        const { path, shouldHide } = routeData[key];
        let forceHide = false;

        // now that we can select images to manually add, we need to force hide
        if (path === 'alt-text' && stepsData[key] !== undefined) {
          forceHide = true;
        }

        // should hide flag is true and step data exists
        if (shouldHide === true && stepsDataKeysArray.includes(key)) {
          // if not current path, hide layer + force hide override
          if (currentPath !== path || forceHide === true) {
            layerIdsToHide.push(stepsData[key].id);
          } else {
            layerIdsToShow.push(stepsData[key].id);
          }
        }
      }

      // hide other steps we have data for
      sendToFigma('visible', { nodeIds: layerIdsToHide, visible: false });
      // show current layer for step
      sendToFigma('visible', { nodeIds: layerIdsToShow, visible: true });
    }
  }, [location, stepsData]);

  // listen for steps completed change, adjust progress state
  React.useEffect(() => {
    sendToFigma('steps-completed', {
      stepsCompleted,
      page,
      pageType,
      stepsNative,
      steps
    });

    const newPercentage = stepsCompleted.reduce((accum, step) => {
      const routeData = pageType === 'web' ? routes : routesNative;
      return accum + routeData[step].percent;
    }, 0);
    setPercentage(newPercentage);
  }, [stepsCompleted]);

  // listen for dashboard display
  React.useEffect(() => {
    // if dashboard is shown
    if (showDashboard === true) {
      // let figma side know we are back on the dashboard
      sendToFigma('page-selected', { isSelected: false });
    }
  }, [showDashboard]);

  // loading/scanning for a11y progress on current Figma document
  if (isLoading) {
    return (
      <ProgressLoading message={loadingMsg} showWarning={showLoadingWarning} />
    );
  }

  // show page change alert
  if (showPageChange) {
    return <PageChange />;
  }

  // show settings
  if (showSettings) {
    return <Settings />;
  }

  // if there is previous progress data, show dashboard
  if (showDashboard) {
    return <Dashboard />;
  }

  // choose between Web or Native flow
  if (pageType === null) {
    return <ChooseYourOwnAdventure />;
  }

  // select a frame
  if (page === null) {
    return <SelectFrameToStart alertMsg={alertMsg} {...pageSelected} />;
  }

  const leftNavClass = leftNavVisible ? 'opened' : 'collapsed';
  const cbViewerClass = colorBlindnessView ? ' cb-viewer' : '';
  const condensedClass = condensedUI ? 'view-condensed' : 'view-full';

  return (
    <div className={`app-container ${condensedClass}`}>
      <div className={`app-top ${leftNavClass}${cbViewerClass}`}>
        <NavLeft progress={progressPercent} />

        <div className="flex-1">
          <Routes>
            {pageType === 'web' && (
              <React.Fragment>
                <Route path="/" element={<Landmarks />} />
                <Route path="headings" element={<Headings />} />
                <Route path="reading-order" element={<ReadingOrder />} />
                <Route path="alt-text" element={<AltText />} />
                <Route path="contrast" element={<Contrast />} />
                <Route path="touch-target" element={<TouchTarget />} />
                <Route path="text-zoom" element={<TextZoom />} />
                <Route
                  path="responsive-reflow"
                  element={<ResponsiveReflow />}
                />
                <Route path="color-blindness" element={<ColorBlindness />} />
                <Route path="complex-gestures" element={<ComplexGestures />} />
              </React.Fragment>
            )}

            {pageType === 'native' && (
              <React.Fragment>
                <Route path="/" element={<Headings />} />
                <Route path="focus-grouping" element={<FocusGrouping />} />
                <Route path="reading-order" element={<ReadingOrder />} />
                <Route path="alt-text" element={<AltText />} />
                <Route path="touch-target" element={<TouchTarget />} />
                <Route path="contrast" element={<Contrast />} />
                <Route path="text-zoom" element={<TextZoom />} />
                <Route path="complex-gestures" element={<ComplexGestures />} />
                <Route path="color-blindness" element={<ColorBlindness />} />
              </React.Fragment>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <AppState>
    <MemoryRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MemoryRouter>
  </AppState>
);
