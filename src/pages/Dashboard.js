import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { analytics, utils } from '@/constants';

// components
import ProgressLine from '@/components/ProgressLine';
import ProgressPieChart from '@/components/ProgressPieChart';

// icons
import {
  SvgArrowRight,
  SvgClose,
  SvgMobile,
  SvgSettings,
  SvgWeb
} from '@/icons';

// app state
import Context from '@/context';

// pages
import ProgressLoading from '@/pages/ProgressLoading';

// data
import routes from '@/data/routes.json';
import routesNative from '@/data/routes-native.json';

const feedbackFormUrl = process.env.FEEDBACK_FORM_URL;

function Dashboard() {
  // main app state
  const cnxt = React.useContext(Context);
  const { condensedUI, imagesScanned, pages, steps, version } = cnxt;
  const { removeNodes, sendToFigma, updateState, zoomTo } = cnxt;
  const { currentUser, sessionId, isProd } = cnxt;

  // local state
  const [progressType, setProgressType] = React.useState(null);
  const [selected, setSelected] = React.useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [modalTitleValue, setModalTitleValue] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);
  const [tempClickData, setTempClickData] = React.useState(null);

  // navigation hook
  const navigate = useNavigate();

  // display state
  const selectedCount = selected.length > 0 ? ` (${selected.length})` : '';

  // add a new page
  const onAddNewPage = () => {
    // reset main state and display select frame screen
    updateState('page', null);
    updateState('stepsCompleted', []);
    updateState('showDashboard', false);
  };

  // continue with this page
  const onContinue = async (page, stepsCompleted) => {
    // get stepsData from pages
    const pageIndex = pages.findIndex((p) => p.pageId === page.id);
    const { stepsData, type } = pages[pageIndex];

    // hide dashboard and continue progress
    updateState('page', page);
    updateState('pageType', type);
    updateState('stepsCompleted', stepsCompleted);
    updateState('stepsData', stepsData);
    updateState('showDashboard', false);

    // reset specific data
    updateState('landmarks', {});
    updateState('headings', {});
    updateState('touchTargets', {});
    updateState('imagesData', []);
    updateState('imagesScanned', imagesScanned);

    // loop through for existing data
    Object.keys(stepsData).map((key) => {
      const stepData = stepsData[key];

      // do we have step specific data?
      if (stepData?.existingData) {
        const { existingData, stateKey } = stepData;

        // update main state
        updateState(stateKey, existingData);
      }
      return false;
    });

    // let figma side know, page has been confirmed
    sendToFigma('page-selected', { isSelected: true });

    // bring page into viewport on Figma
    zoomTo([page.id]);

    // navigate to first incomplete step
    const stepsDataArray = Object.keys(stepsData);

    // do we have steps data on load?
    if (stepsDataArray.length > 0) {
      let newPath = null;
      const routeData = type === 'web' ? routes : routesNative;
      const routeKeys = Object.keys(routeData);

      // loop through routes
      for (let i = 0; i < routeKeys.length; i += 1) {
        let skip = false;
        const key = routeKeys[i];

        // case for steps that have multiple data layers
        // - 'Focus order' step data exists
        if (stepsDataArray.includes('Focus order') && key === 'Reading order') {
          skip = true;
        }

        // get the path of the first step that's incomplete
        if (stepsDataArray.includes(key) === false && skip === false) {
          newPath = routeData[key].path;
          break;
        }
      }

      // navigate to first incomplete step
      if (newPath !== null) {
        navigate(newPath);
      } else {
        // if all steps are completed, go back to first step
        navigate('/');
      }
    }
  };

  // load in base64 first (if needed)
  // (chunking this out on demand, rather than all images on dashboard load)
  const loadInBase64 = (page, stepsCompleted) => {
    setLoading(true);

    // get stepsData from pages
    const pageIndex = pages.findIndex((p) => p.pageId === page.id);
    const currentPage = pages[pageIndex];

    // has images scanned or manually added
    const currentScanned = currentPage.imagesScanned;
    const currentManual = currentPage.imagesManual;
    const noScannedImages = currentScanned.length === 0;
    const noManualImages = currentManual.length === 0;

    // no images previously annotated on document?
    if (noScannedImages && noManualImages) {
      onContinue(page, stepsCompleted);
    } else {
      // grabbing base64 was killing the tread, causing loading state to not show, so delaying
      // https://www.figma.com/plugin-docs/frozen-plugins/
      setTimeout(() => {
        // on demand base64 (scanned) and imageBuffer (manual) images
        sendToFigma('get-base64', {
          imagesManual: currentManual,
          imagesScanned: currentScanned,
          page
        });

        setTempClickData({
          page,
          stepsCompleted
        });
      }, 100);
    }
  };

  // page select toggle
  const onSelect = (id) => {
    const newSelected = [...selected];

    // if in array, remove it
    if (newSelected.includes(id)) {
      // get index of key value and remove from array
      const indexFound = newSelected.indexOf(id);
      newSelected.splice(indexFound, 1);
    } else {
      newSelected.push(id);
    }

    // bring page(s) fully into view on Figma
    sendToFigma('zoom-to', { nodeIds: newSelected, selectNodes: true });

    setSelected(newSelected);
  };

  // on delete, show modal for double confirm
  const onDelete = () => {
    let newModalTitleValue = `${selected.length} spec pages`;
    // or get name of page (if 1 selected only)
    if (selected.length === 1) {
      const pageIndex = pages.findIndex((p) => p.id === selected[0]);
      newModalTitleValue = `“${pages[pageIndex].name}”`;
    }
    setModalTitleValue(newModalTitleValue);

    // show modal
    setShowModal(true);
  };

  // on close modal
  const onCloseModal = () => {
    // hide modal
    setShowModal(false);
    // reset selected
    setSelected([]);

    sendToFigma('deselect-all-layers');
  };

  // on delete confirmation
  const onDeleteConfirmed = () => {
    // set new pages array so we can manipulate
    const newPagesArray = [...pages];

    // first remove pages data matching selected
    for (let i = 0; i < selected.length; i += 1) {
      // find index by page ID
      const pageIndexToDelete = newPagesArray.findIndex(
        (p) => p.id === selected[i]
      );
      // remove from pages array
      newPagesArray.splice(pageIndexToDelete, 1);
    }

    // update main state with new pages array
    updateState('pages', newPagesArray);

    // now send a message to Figma to delete the layers from the document
    removeNodes(selected);

    // reset local state
    setSelected([]);
    setShowModal(false);

    // no longer have any pages on the dashboard?
    if (newPagesArray.length === 0) {
      // reset main state and display select frame screen
      updateState('hasDashboard', false);
      updateState('page', null);
      updateState('showDashboard', false);
      updateState('stepsCompleted', []);
    }
  };

  // goto Settings
  const gotoSettings = () => {
    updateState('showSettings', true);
  };

  React.useEffect(() => {
    // check for pages progress state, for different emojis to display
    let emojiState = 'green-100s';

    for (let i = 0; i < pages.length; i += 1) {
      const { stepsCompleted } = pages[i];
      const progress = Math.ceil((stepsCompleted.length / steps.length) * 100);

      // quick exit if we ain't at that 100 mark
      if (progress !== 100) {
        emojiState = 'work-to-do';
        break;
      }
    }
    setProgressType(emojiState);

    // send ga event
    analytics.logEvent({
      pageTitle: 'Dashboard',
      sessionId,
      currentUser,
      isProd
    });
  }, []);

  React.useEffect(() => {
    // once images are scanned in
    if (imagesScanned.length > 0) {
      setLoading(false);

      const { page, stepsCompleted } = tempClickData;
      onContinue(page, stepsCompleted);
    }
  }, [imagesScanned]);

  if (isLoading) {
    return <ProgressLoading message="Loading page data" />;
  }

  const condensedClass = condensedUI ? 'view-condensed' : 'view-full';

  return (
    <div className={`dashboard ${condensedClass}`}>
      <div className="flex-row-space-between">
        <h1>Checks in this Figma</h1>
        <div className="flex-row-center">
          <div
            className="flex-row-center border-radius-2 link mr2 no-underline cursor-pointer"
            onClick={gotoSettings}
            onKeyDown={({ key }) => {
              if (utils.isEnterKey(key)) gotoSettings();
            }}
            role="button"
            tabIndex="0"
          >
            <SvgSettings />
            Settings
          </div>

          {feedbackFormUrl?.length > 0 && (
            <a
              href={feedbackFormUrl}
              target="_blank"
              rel="noreferrer"
              className="link border-radius-2 font-12 no-underline"
            >
              Leave feedback
            </a>
          )}
        </div>
      </div>

      {progressType !== null && <ProgressLine progressType={progressType} />}

      <div className="spacer3" />

      <div className="dashboard-scrollable">
        {pages.map((item) => {
          const { id, name, stepsCompleted, type, page } = item;

          const selectedClass = selected.includes(id) ? ' selected' : '';
          const isWeb = type === 'web';
          const Icon = isWeb ? SvgWeb : SvgMobile;
          const routeData = isWeb ? routes : routesNative;

          const progress = Math.ceil(
            stepsCompleted.reduce(
              (accum, step) => accum + routeData[step].percent,
              0
            )
          );

          return (
            <div
              key={id}
              className={`card${selectedClass} cursor-pointer`}
              onClick={() => onSelect(id)}
              onKeyDown={({ key }) => {
                if (utils.isEnterKey(key)) onSelect(id);
              }}
              role="button"
              tabIndex="0"
            >
              <div className="flex-row-space-between border-radius-2">
                <div className="flow-type">
                  <div className="svg-theme">
                    <Icon />
                  </div>
                  <div className="flow-type-text">{type}</div>
                </div>

                <ProgressPieChart progress={progress} />
              </div>

              <div className="spacer2" />

              <div className="card-title">{name}</div>

              <div className="spacer2" />

              <div
                className="flex-row-center align-self-start border-radius-2 cursor-pointer"
                onClick={() => loadInBase64(page, stepsCompleted)}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) loadInBase64(page, stepsCompleted);
                }}
                role="button"
                tabIndex="0"
              >
                <div className="link font-12">Go to checks</div>

                <div className="spacer1w" />

                <div className="svg-theme-stroke_link">
                  <SvgArrowRight />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-footer flex-row-space-between">
        <div className="flex-row-center">
          <button className="btn primary" onClick={onAddNewPage} type="button">
            Add new page
          </button>

          <div className="spacer1w" />

          <button
            className="btn"
            disabled={selected.length === 0}
            onClick={onDelete}
            onKeyDown={({ key }) => {
              if (utils.isEnterKey(key)) onDelete();
            }}
            type="button"
          >
            {`Delete selected${selectedCount}`}
          </button>
        </div>

        <div className="muted">{`v.${version}`}</div>
      </div>

      {showModal && (
        <div className="container-modal animated-duration-400 fade-in">
          <div
            className="modal animated-duration-600 fade-in delay-200ms"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal
          >
            <div className="flex-row-space-between relative">
              <h2 id="modal-title">
                {`Do you want to delete ${modalTitleValue}?`}
              </h2>

              <div
                aria-label="close modal"
                className="container-close svg-theme"
                onClick={onCloseModal}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) onCloseModal();
                }}
                role="button"
                tabIndex="0"
              >
                <SvgClose />
              </div>
            </div>

            <div className="spacer2" />

            <p>
              This will ONLY delete the Accessibility specs/overlays from the
              Figma document.
            </p>

            <div className="spacer3" />

            <div className="flex-row-center justify-end">
              <button className="btn" onClick={onCloseModal} type="button">
                Cancel
              </button>

              <div className="spacer1w" />

              <button
                className="btn danger"
                onClick={onDeleteConfirmed}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) onDeleteConfirmed();
                }}
                type="button"
              >
                Delete selected
              </button>
            </div>
          </div>

          <div aria-hidden className="modal-overlay" onClick={onCloseModal} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
