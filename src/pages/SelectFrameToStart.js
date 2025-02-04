import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { analytics, utils } from '@/constants';

// components
import { Alert } from '@/components';

// icons
import { SvgArrowRight, SvgFrame, SvgWarning } from '@/icons';

// app state
import Context from '@/context';

function SelectFrameToStart({ alertMsg = null, name = null }) {
  // main app state
  const cnxt = React.useContext(Context);
  const { currentUser, isProd, pageSelected, pages, pageType } = cnxt;
  const { sessionId, sendToFigma, steps, stepsNative, updateState } = cnxt;
  const { version, zoomTo } = cnxt;

  // navigation hook
  const navigate = useNavigate();

  const confirmSelection = () => {
    let pageDefault = pageSelected;
    let stepsCompletedDefault = [];

    // let's check to see if there is any progress for the selected page
    if (pages.length > 0) {
      // get page selected ID
      const { id } = pageSelected;

      // maybe the user selected a page that already has data tied to it
      const dataIndexFound = pages.findIndex((p) => p.pageId === id);

      // does previous data exist?
      if (dataIndexFound >= 0) {
        const { page, stepsCompleted } = pages[dataIndexFound];

        // set existing data for main state update
        pageDefault = page;
        stepsCompletedDefault = stepsCompleted;

        // bring page into viewport on Figma
        zoomTo([id]);
      }
    }

    // user confirmed page to start the accessibility scan on
    updateState('page', pageDefault);
    updateState('pageSelected', null);
    updateState('stepsCompleted', stepsCompletedDefault);

    const newPages = [...pages];
    updateState('pages', newPages);

    // let figma side know, page has been confirmed
    sendToFigma('page-selected', { isSelected: true });
    sendToFigma('page-initialized', {
      page: pageDefault,
      pageType,
      stepsCompleted: stepsCompletedDefault,
      steps,
      stepsNative
    });

    // send analytics event
    analytics.logEvent({
      name: 'scan_started',
      pageTitle: pageType,
      sessionId,
      currentUser,
      isProd
    });

    // make sure the route is reset to first step
    const path = '/';
    navigate(path);
  };

  const backToAdventure = () => {
    updateState('pageType', null);
  };

  // ui state
  const hasSelection = name !== null;
  const title = hasSelection
    ? `“${name}” selected`
    : `Select a ${pageType} Frame to start`;

  return (
    <div className="flex-center h-100 relative">
      {alertMsg !== null && (
        <div className="absolute-top w-100">
          <Alert icon={<SvgWarning />} text={alertMsg} type="warning" />
        </div>
      )}

      <div className="svg-theme">
        <SvgFrame />
      </div>

      <div className="spacer2" />

      <p>{title}</p>

      {hasSelection && (
        <React.Fragment>
          <div className="spacer3" />

          <button
            className="btn primary"
            onClick={confirmSelection}
            type="button"
          >
            Run checker
          </button>
        </React.Fragment>
      )}

      <div className="absolute-bottom-left">
        <div
          className="flex-row-center border-radius-2 link cursor-pointer"
          onClick={backToAdventure}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) backToAdventure();
          }}
          role="button"
          tabIndex="0"
        >
          <div className="svg-theme-stroke_link rotate-180">
            <SvgArrowRight />
          </div>
          <div className="spacer1w" />
          Back
        </div>
      </div>

      <div className="absolute-bottom-right muted">{`v.${version}`}</div>
    </div>
  );
}

SelectFrameToStart.propTypes = {
  // optional
  alertMsg: PropTypes.string,
  name: PropTypes.string
};

export default SelectFrameToStart;
