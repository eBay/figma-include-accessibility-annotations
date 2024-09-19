import * as React from 'react';
import { utils } from '../constants';

// components
import {
  Alert,
  AnnotationStepPage,
  Dropdown,
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
const landmarksOnlyOnce = ['main', 'header', 'footer'];
const landmarksAlwaysNeedLabel = ['form', 'section'];

function Landmarks() {
  // main app state
  const cnxt = React.useContext(Context);
  const { landmarks, page, pageType, stepsCompleted } = cnxt;
  const { removeNodes, sendToFigma, updateState, zoomTo } = cnxt;

  const landmarksTypesArrayDropdown = landmarksTypesArray.map((id, index) => ({
    id: index,
    value: id
  }));

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
  const [openedDropdown, setOpenedDropdown] = React.useState(null);
  const [maxUsageReached, setMaxUsageReached] = React.useState([]);

  const [labelsTemp, setLabelsTemp] = React.useState({});

  const [needsLabel, setNeedsLabel] = React.useState([]);
  const canContinue = needsLabel.length !== Object.keys(labelsTemp).length;

  const [dupNeedLabel, setDupNeedLabel] = React.useState([]);
  const showDupWarning = dupNeedLabel.length > 0;

  const [alwaysNeedLabel, setAlwaysNeedLabel] = React.useState([]);
  const showAlwaysNeedLabel = alwaysNeedLabel.length > 0;

  const [hasLandmarkWord, setHasLandmarkWord] = React.useState([]);
  const showLandmarkWordWarning = hasLandmarkWord.length > 0;

  const onAddLandmark = (landmarkType) => {
    const { bounds, id } = page;

    // scroll to bottom of main
    utils.scrollToBottomOfAnnotationStep();

    // let figma side know, time to place that rectangle
    sendToFigma('add-landmark', {
      bounds,
      page,
      pageId: id,
      landmark: landmarkType,
      pageType
    });
  };

  const onTypeDropdownOpen = (val) => {
    utils.scrollToBottomOfAnnotationStep();
    setOpenedDropdown(val);
  };

  const onTypeUpdate = (type, key) => {
    // update landmark type
    const newLandmarksObj = { ...landmarks };
    const newLandmark = newLandmarksObj[key];
    newLandmarksObj[key] = {
      ...newLandmark,
      name: newLandmark.name.replace(newLandmark.type, type),
      type
    };

    // update figma layer
    sendToFigma('update-landmark-type', {
      id: key,
      landmarkType: type,
      prevLandmarkType: newLandmark.type
    });

    // update main state
    updateState('landmarks', newLandmarksObj);
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
        pageType,
        landmarks
      });
    }
  };

  const checkForDuplicates = () => {
    const typesArray = [];
    const typesDupArray = [];
    const rowsNeedLabelArray = [];
    const rowsDupNeedLabelArray = [];
    const rowsAlwaysNeedLabelArray = [];

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

      // check if temp label exists
      const tempLabel = labelsTemp[id]?.value || null;

      if (typesDupArray.includes(type) && noLabel) {
        rowsNeedLabelArray.push(id);

        // do we not have a temp label?
        if (tempLabel === null) {
          rowsDupNeedLabelArray.push(id);
        }
      } else if (landmarksAlwaysNeedLabel.includes(type) && noLabel) {
        // always need a label
        rowsAlwaysNeedLabelArray.push(id);
        rowsNeedLabelArray.push(id);
      }

      return null;
    });

    setNeedsLabel(rowsNeedLabelArray);
    setDupNeedLabel(rowsDupNeedLabelArray);
    setAlwaysNeedLabel(rowsAlwaysNeedLabelArray);
  };

  const checkForMaxUsage = () => {
    const newMaxUsageReached = [];

    landmarksValue.forEach((val) => {
      if (landmarksOnlyOnce.includes(val.type)) {
        newMaxUsageReached.push(val.type);
      }
    });

    setMaxUsageReached(newMaxUsageReached);
  };

  const checkForLandmarkInLabel = () => {
    const hasLandmarkInLabel = [];

    Object.keys(labelsTemp).forEach((key) => {
      const label = labelsTemp[key];
      const labelLower = label.value.toLowerCase();

      // "landmark" string exists?
      if (labelLower.includes('landmark')) {
        hasLandmarkInLabel.push(key);
      }

      // also check if it's a landmark type
      landmarksTypesArray.forEach((landmark) => {
        if (labelLower.includes(landmark)) {
          hasLandmarkInLabel.push(key);
        }
      });
    });

    setHasLandmarkWord(hasLandmarkInLabel);
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
    checkForMaxUsage();
  }, [landmarks]);

  React.useEffect(() => {
    // mount
    checkForDuplicates();
    checkForLandmarkInLabel();
  }, [labelsTemp]);

  const getPrimaryAction = () => {
    if (landmarksAreSet || noLandmarks) {
      return {
        completesStep: true,
        isDisabled:
          (showDupWarning || showAlwaysNeedLabel || showLandmarkWordWarning) &&
          canContinue === false,
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
        {showDupWarning && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text="Distinguish landmarks of the same type with a unique name."
              type="warning"
            />
            <div className="spacer1" />
          </React.Fragment>
        )}

        {showAlwaysNeedLabel && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text="Add a label to landmarks that are too vague without one."
              type="warning"
            />

            <div className="spacer1" />
          </React.Fragment>
        )}

        {showLandmarkWordWarning && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text={`Remove the word "landmark" or the landmark type name, as it is already included in the landmark label.`}
              type="warning"
            />
            <div className="spacer1" />
          </React.Fragment>
        )}

        {landmarksAreSet && (
          <React.Fragment>
            {landmarksArray.map((key) => {
              const { id, label, type } = landmarks[key];
              const isOpened = openedDropdown === id;

              const showLabel = label !== null || needsLabel.includes(id);

              const hasTempLabel = labelsTemp[id]?.value || label;

              // is flagged for not having label (or can't have "Landmark" in the label)
              const warnClass =
                (needsLabel.includes(id) && hasTempLabel === null) ||
                hasLandmarkWord.includes(id)
                  ? ' warning'
                  : '';

              return (
                <div key={key} className="row-landmark flex-row-space-between">
                  <div className="flex-row-center">
                    <Dropdown
                      data={landmarksTypesArrayDropdown}
                      disabledValues={maxUsageReached}
                      index={id}
                      isOpened={isOpened}
                      onOpen={onTypeDropdownOpen}
                      onSelect={onTypeUpdate}
                      type={type}
                    />

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
                    aria-label="remove landmark"
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
            id="no-landmarks"
            isSelected={noLandmarks}
            onClick={onEmptySelected}
            text="no landmarks"
          />
        )}

        {!noLandmarks && (
          <div className="button-group">
            {landmarksTypesArray.map((type) => {
              const { label, icon } = landmarksTypesObj[type];

              // check if limit usage has been reached
              const maxReached = maxUsageReached.includes(type);

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
