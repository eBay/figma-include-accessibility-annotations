import * as React from 'react';
import { utils } from '../constants';

// components
import {
  Alert,
  AnnotationStepPage,
  EmptyStepSelection,
  HeadingStep
} from '../components';

// app state
import Context from '../context';

// get gesture types
import gestureTypesObj from '../data/gesture-types';
import { SvgWarning } from '../icons';

const gestureTypesArray = Object.keys(gestureTypesObj);

function ComplexGestures() {
  // main app state
  const cnxt = React.useContext(Context);
  const { gestures, page, pageType } = cnxt;
  const { removeNodes, stepsCompleted, sendToFigma, updateState, zoomTo } =
    cnxt;

  // ui state
  const routeName = 'Complex gestures';
  const gesturesArray = Object.keys(gestures);
  const gesturesValue = Object.values(gestures);
  const gesturesAreSet = gesturesArray.length !== 0;
  const gesturesCompleted = stepsCompleted.indexOf(routeName) >= 0;

  // state defaults
  const defaultNoGestures = gesturesCompleted && gesturesArray.length === 0;

  // local state
  const [noGestures, setNoGestures] = React.useState(defaultNoGestures);
  const [selected, setSelected] = React.useState(null);
  const [needsLabel, setNeedsLabel] = React.useState([]);
  const [labelsTemp, setLabelsTemp] = React.useState({});
  const [annotateAttempted, setAnnotateAttempted] = React.useState(false);

  const labelNeeded = React.useMemo(
    () =>
      needsLabel.length > 0 &&
      !!needsLabel.find((gestureId) => !labelsTemp[gestureId]),
    [needsLabel, labelsTemp]
  );

  const checkForNeededLabels = () => {
    const rowsNeedLabelArray = [];

    // loop through to see what needs a label
    gesturesValue.forEach((row) => {
      const { id, label } = row;

      // doesn't have a label yet?
      const noLabel = label === null || label === '';
      if (noLabel) {
        rowsNeedLabelArray.push(id);
      }
    });

    // do we have gestures that need labels?
    if (rowsNeedLabelArray.length > 0) {
      setNeedsLabel(rowsNeedLabelArray);
    }
  };

  const onEmptySelected = () => {
    if (selected !== null) setSelected(null);
    setNoGestures(!noGestures);
  };

  const onAddGesture = (selectedType) => {
    const { bounds, id, name } = page;
    const numberString = `${gesturesArray.length + 1}`;

    // let figma side know, time to place that rectangle
    sendToFigma('add-gesture', {
      bounds,
      name,
      page,
      number: numberString,
      pageId: id,
      gesture: selectedType,
      pageType
    });

    // scroll to bottom of main
    utils.scrollToBottomOfAnnotationStep();
  };

  const onSelect = (value) => {
    const newValue = value;

    setNoGestures(false);
    setSelected(newValue);
    onAddGesture(newValue);
  };

  const onRemoveGesture = (idToRemove) => {
    // remove from main state
    const newGesturesObj = { ...gestures };
    delete newGesturesObj[idToRemove];

    // update main state
    updateState('gestures', newGesturesObj);

    // remove node on Figma Document (array of IDs)
    removeNodes([idToRemove]);

    // check if already completed step
    const indexFound = stepsCompleted.indexOf('Complex gestures');
    if (indexFound >= 0) {
      const newStepsCompleted = [...stepsCompleted];
      newStepsCompleted.splice(indexFound, 1);

      // update main state
      updateState('stepsCompleted', newStepsCompleted);
    }
  };

  const onAnnotateGestures = () => {
    if (noGestures) {
      // let figma side know that no gestures are needed
      sendToFigma('no-gestures', {
        page,
        bounds: page.bounds,
        name: page.name,
        pageId: page.id,
        pageType
      });
    } else {
      // Check that all gestures have annotations
      if (labelNeeded) {
        setAnnotateAttempted(true);
        return;
      }

      let updatedGestures = { ...gestures };

      // update with latest labels
      Object.keys(labelsTemp).forEach((key) => {
        if (updatedGestures[key]) {
          updatedGestures = {
            ...updatedGestures,
            [key]: { ...updatedGestures[key], label: labelsTemp[key] }
          };
        }
      });

      updateState('gestures', updatedGestures);

      // add annotation text for gestures
      sendToFigma('annotate-complex-gestures', {
        gestures: Object.values(updatedGestures),
        page,
        pageType
      });
    }
  };

  const onChange = (e, id) => {
    const newLabelsTemp = { ...labelsTemp };

    // don't allow | or :
    const newLabelValue = e.target.value.replace(/[|:]/g, '');
    newLabelsTemp[id] = newLabelValue;

    setLabelsTemp(newLabelsTemp);
  };

  // Needs a label, and user tried to annotate without
  const showWarning = annotateAttempted && labelNeeded;

  React.useEffect(() => {
    checkForNeededLabels();
  }, [gestures]);

  const getPrimaryAction = () => {
    // Gestures are set and none are in progress,
    // allow user to confirm and annotate
    if (gesturesAreSet || noGestures) {
      return {
        completesStep: !labelNeeded,
        onClick: onAnnotateGestures
      };
    }

    return null;
  };

  return (
    <AnnotationStepPage
      title="Complex gestures"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {gesturesAreSet && (
          <React.Fragment>
            <HeadingStep
              number={3}
              style={{ marginBottom: 8 }}
              text="Describe the action for the alternative affordance"
            />
            {showWarning && (
              <React.Fragment>
                <Alert
                  icon={<SvgWarning />}
                  style={{ padding: 0 }}
                  text="Some actions are missing a description"
                  type="warning"
                />
                <div className="spacer1" />
              </React.Fragment>
            )}
            <div style={{ marginTop: showWarning ? 0 : -8 }}>
              {gesturesArray.map((key) => {
                const { id, label, type } = gestures[key];
                const gestureLabel = gestureTypesObj[type].label;
                const hasTempLabel = labelsTemp[id] || label;

                // is flagged for not having label
                const warnClass =
                  showWarning &&
                  needsLabel.includes(id) &&
                  hasTempLabel === null
                    ? ' warning'
                    : '';

                return (
                  <div key={key} className="flex-row-space-between">
                    <div className="flex-row-center">
                      <div className="gesture-type">
                        {`alternative to ${gestureLabel}`}
                      </div>

                      <div className="spacer2w" />
                      <div className="muted">Action</div>
                      <div className="spacer1w" />
                      <input
                        className={`input${warnClass}`}
                        type="text"
                        onChange={(e) => onChange(e, id)}
                        onFocus={() => {
                          // zoom to layer in figma
                          zoomTo([id], true);
                        }}
                        placeholder="Type action"
                        value={hasTempLabel || ''}
                      />
                    </div>

                    <div
                      aria-label="remove gesture"
                      className="btn-remove"
                      onClick={() => onRemoveGesture(id)}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) onRemoveGesture(id);
                      }}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="remove-dash" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="spacer1" />

            <div className="divider" />
            <div className="spacer2" />
          </React.Fragment>
        )}

        <React.Fragment>
          <HeadingStep
            number={1}
            text="Select a gesture that needs an alternative affordance."
          />
          {!gesturesAreSet && (
            <EmptyStepSelection
              id="no-gestures"
              isSelected={noGestures}
              onClick={onEmptySelected}
              text="no gestures"
            />
          )}

          {!noGestures && (
            <div className="button-group">
              {gestureTypesArray.map((type) => {
                const { label, icon } = gestureTypesObj[type];

                // handle non-interactive state
                // rectangle has already been created, lock in the gesture selection until step is completed)
                // const noEvents = isDisabled ? ' no-events' : '';
                const onClick = () => onSelect(type);

                return (
                  <div key={label} className="container-selection-button">
                    <div
                      className="selection-button"
                      onClick={onClick}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) onClick();
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div>{icon}</div>
                    </div>

                    <div className="selection-button-label">{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </React.Fragment>

        {selected && (
          <HeadingStep
            number={2}
            text={`Place the overlay on the onscreen elements that enable users to perform the ${selected.replace(
              /-/g,
              ' '
            )} action with one finger and taps.`}
          />
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ComplexGestures;
