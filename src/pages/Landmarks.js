import * as React from 'react';
import { utils } from '../constants';

// components
import {
  Alert,
  AnnotationStepPage,
  scrollToBottomOfAnnotationStep,
  EmptyStepSelection,
  HeadingStep
} from '../components';

// icons
import { SvgWarning } from '../icons';

// app state
import Context from '../context';

// get landmark types
import landmarksTypesObj from '../data/landmark-types';

const landmarksTypesArray = Object.keys(landmarksTypesObj);
const landmarksOnlyOnce = ['main', 'banner', 'content-info'];

function Landmarks() {
  // main app state
  const cnxt = React.useContext(Context);
  const { landmarks, page, pageType, stepsCompleted } = cnxt;
  const { removeNodes, sendToFigma, updateState, zoomTo } = cnxt;

  // ui state
  const routeName = 'Landmarks';
  const landmarksArray = Object.keys(landmarks);
  const landmarksValue = Object.values(landmarks);
  const landmarksAreSet = landmarksArray.length !== 0;

  // state defaults
  const isCompleted = stepsCompleted.includes(routeName);
  const defaultNoLandmarks = isCompleted && landmarksArray.length === 0;

  // local state
  const [selected, setSelected] = React.useState(null);
  const [noLandmarks, setNoLandmarks] = React.useState(defaultNoLandmarks);
  const [needsLabel, setNeedsLabel] = React.useState([]);
  const [labelsTemp, setLabelsTemp] = React.useState({});

  const onAddLandmark = (landmarkType) => {
    const { bounds, id } = page;

    // scroll to bottom of main
    scrollToBottomOfAnnotationStep();

    // let figma side know, time to place that rectangle
    sendToFigma('add-landmark', {
      bounds,
      page,
      pageId: id,
      landmark: landmarkType,
      pageType
    });
  };

  const onRemoveLandmark = (idToRemove) => {
    // remove from main state
    const newLandmarksObj = { ...landmarks };
    delete newLandmarksObj[idToRemove];

    // update main state
    updateState('landmarks', newLandmarksObj);

    // remove node on Figma Document (array of IDs)
    removeNodes([idToRemove]);

    // check if already completed step
    const indexFound = stepsCompleted.indexOf(routeName);
    if (indexFound >= 0) {
      const newStepsCompleted = [...stepsCompleted];
      newStepsCompleted.splice(indexFound, 1);

      // update main state
      updateState('stepsCompleted', newStepsCompleted);
    }
  };

  const onSelect = (value) => {
    setSelected(value);
    setNoLandmarks(false);
    onAddLandmark(value);
  };

  const showWarning =
    needsLabel.length > 0 &&
    Object.keys(labelsTemp).length !== needsLabel.length;

  const onDoneWithLandmarks = () => {
    if (noLandmarks) {
      sendToFigma('no-landmark', {
        page,
        bounds: page.bounds,
        name: page.name,
        pageId: page.id,
        pageType
      });
    } else {
      sendToFigma('completed-landmark', {
        page,
        pageType
      });
    }
  };

  const checkForDuplicates = () => {
    const typesArray = [];
    const typesDupArray = [];
    const rowsNeedLabelArray = [];

    // get all types used and if it's a duplicate
    Object.values(landmarks).map((row) => {
      // first instance
      if (typesArray.includes(row.type) === false) {
        typesArray.push(row.type);
      } else if (typesDupArray.includes(row.type) === false) {
        // duplicate
        typesDupArray.push(row.type);
      }

      return null;
    });

    // loop through to see what needs a label
    Object.values(landmarks).map((row) => {
      const { id, label, type } = row;

      // has duplicate row and no label?
      const noLabel = label === null || label === '';
      if (typesDupArray.includes(type) && noLabel) {
        rowsNeedLabelArray.push(id);
      }

      return null;
    });

    // do we have landmarks that need labels?
    if (rowsNeedLabelArray.length > 0) {
      setNeedsLabel(rowsNeedLabelArray);
    }
  };

  const onChange = (e, id) => {
    const newLabelsTemp = { ...labelsTemp };

    // don't allow | or :
    const newLabelValue = e.target.value.replace(/[|:]/g, '');
    newLabelsTemp[id] = { value: newLabelValue };

    setLabelsTemp(newLabelsTemp);
  };

  const onBlur = (id, type) => {
    // grab label if exists in temp
    // onBlur with original value doesn't do any updates to Figma
    const value = labelsTemp[id]?.value || null;

    // update label if needed
    if (value !== null) {
      // update label on figma document
      sendToFigma('update-landmark-label', { id, landmarkType: type, value });
    }
  };

  const onEmptySelected = () => {
    if (selected !== null) setSelected(null);
    setNoLandmarks(!noLandmarks);
  };

  // on landmarks change, check for duplicates to add labels to
  React.useEffect(() => {
    // mount
    checkForDuplicates();
  }, [landmarks]);

  const getPrimaryAction = () => {
    if (landmarksAreSet || noLandmarks) {
      return {
        completesStep: true,
        isDisabled: showWarning,
        onClick: onDoneWithLandmarks
      };
    }

    return null;
  };

  return (
    <AnnotationStepPage
      title="Landmarks"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {showWarning && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text="Multiple landmarks on a page need labeling for distinction."
              type="warning"
            />

            <div className="spacer1" />
          </React.Fragment>
        )}

        {landmarksAreSet && (
          <React.Fragment>
            {landmarksArray.map((key) => {
              const { id, label, type } = landmarks[key];

              const showLabel = label !== null || needsLabel.includes(id);
              const hasTempLabel = labelsTemp[id]?.value || label;

              // is flagged for not having label
              const warnClass =
                needsLabel.includes(id) && hasTempLabel === null
                  ? ' warning'
                  : '';

              return (
                <div key={key} className="row-landmark flex-row-space-between">
                  <div className="flex-row-center">
                    <div className="landmark-type">{`${type} Landmark`}</div>

                    {showLabel && (
                      <React.Fragment>
                        <div className="spacer2w" />
                        <div className="muted">Label</div>
                        <div className="spacer1w" />

                        <input
                          className={`input${warnClass}`}
                          type="text"
                          onBlur={() => onBlur(id, type)}
                          onChange={(e) => onChange(e, id)}
                          onFocus={() => {
                            // zoom to image in figma
                            zoomTo([id], true);
                          }}
                          placeholder="Type in name"
                          value={hasTempLabel || ''}
                        />
                      </React.Fragment>
                    )}
                  </div>

                  <div
                    className="btn-remove"
                    onClick={() => onRemoveLandmark(id)}
                    onKeyDown={(e) => {
                      if (utils.isEnterKey(e.key)) onRemoveLandmark(id);
                    }}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="remove-dash" />
                  </div>
                </div>
              );
            })}

            <div className="spacer1" />

            <div className="divider" />
            <div className="spacer2" />
          </React.Fragment>
        )}

        <HeadingStep number={1} text="Select landmark type" />

        {!landmarksAreSet && (
          <EmptyStepSelection
            isSelected={noLandmarks}
            onClick={onEmptySelected}
            stepName="landmarks"
          />
        )}

        {!noLandmarks && (
          <div className="button-group">
            {landmarksTypesArray.map((type) => {
              const { label, icon } = landmarksTypesObj[type];

              // check if limit usage has been reached
              const maxUsageReached = landmarksValue.filter(
                (l) => l.type === type && landmarksOnlyOnce.includes(type)
              );
              const maxReached = maxUsageReached.length > 0;

              // display / disabled state
              const fadedClass = maxReached ? 'faded' : '';
              const isDisabled = maxReached;

              // handle non-interactive state
              const noEvents = isDisabled ? ' no-events' : '';
              const onClick = isDisabled ? () => null : () => onSelect(type);

              return (
                <div key={label} className="container-selection-button">
                  <div
                    className={`selection-button${noEvents}`}
                    onClick={onClick}
                    onKeyDown={(e) => {
                      if (utils.isEnterKey(e.key)) onClick();
                    }}
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                  >
                    <div className={fadedClass}>{icon}</div>
                    {maxReached && <div className="limit-reached">Limit 1</div>}
                  </div>

                  <div className="selection-button-label">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <React.Fragment>
            <div className="spacer2" />

            <HeadingStep
              number={2}
              text={`Place the overlay over the ${selected.replace(
                /-/g,
                ' '
              )} area`}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default Landmarks;
