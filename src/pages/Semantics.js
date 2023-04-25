import * as React from 'react';

// components
import {
  Alert,
  AnnotationStepPage,
  scrollToBottomOfAnnotationStep,
  EmptyStepSelection,
  HeadingStep
} from '../components';

// icons
import { SvgInfo } from '../icons';

// app state
import Context from '../context';

// get semantic types
import semanticsTypesObj from '../data/semantic-types';

const semanticsTypesArray = Object.keys(semanticsTypesObj);
const semanticsOnlyOnce = ['main', 'banner', 'content-info'];

const Semantics = () => {
  // main app state
  const cnxt = React.useContext(Context);
  const { semantics, page, pageType, stepsCompleted } = cnxt;
  const { removeNodes, sendToFigma, updateState, zoomTo } = cnxt;

  // ui state
  const routeName = 'Semantics';
  const semanticsArray = Object.keys(semantics);
  const semanticsValue = Object.values(semantics);
  const semanticsAreSet = semanticsArray.length !== 0;

  // state defaults
  const isCompleted = stepsCompleted.includes(routeName);
  const defaultNoSemantics = isCompleted && semanticsArray.length === 0;

  // local state
  const [selected, setSelected] = React.useState(null);
  const [noSemantics, setNoSemantics] = React.useState(defaultNoSemantics);
  const [needsLabel, setNeedsLabel] = React.useState([]);
  const [labelsTemp, setLabelsTemp] = React.useState({});

  const onAddSemantic = (semanticType) => {
    const { bounds, id } = page;

    // scroll to bottom of main
    scrollToBottomOfAnnotationStep();

    // let figma side know, time to place that rectangle
    sendToFigma('add-semantic', {
      bounds,
      page,
      pageId: id,
      semantic: semanticType,
      pageType
    });
  };

  const onRemoveSemantic = (idToRemove) => {
    // remove from main state
    const newSemanticsObj = { ...semantics };
    delete newSemanticsObj[idToRemove];

    // update main state
    updateState('semantics', newSemanticsObj);

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
    setNoSemantics(false);
    onAddSemantic(value);
  };

  const showInfo =
    needsLabel.length > 0 &&
    Object.keys(labelsTemp).length !== needsLabel.length;

  const onDoneWithSemantics = () => {
    if (noSemantics) {
      sendToFigma('no-semantic', {
        page,
        bounds: page.bounds,
        name: page.name,
        pageId: page.id,
        pageType
      });
    } else {
      sendToFigma('completed-semantic', {
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
    Object.values(semantics).map((row) => {
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
    Object.values(semantics).map((row) => {
      const { id, label, type } = row;

      // has duplicate row and no label?
      const noLabel = label === null || label === '';
      if (typesDupArray.includes(type) && noLabel) {
        rowsNeedLabelArray.push(id);
      }

      return null;
    });

    // do we have semantics that need labels?
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
    console.log(`id: {1}, type: {2}`, id, type);
    
    // grab label if exists in temp
    // onBlur with original value doesn't do any updates to Figma
    const value = labelsTemp[id]?.value || null;

    // update label if needed
    if (value !== null) {
      // update label on figma document
      sendToFigma('update-semantic-label', { id, semanticType: type, value });
    }
  };

  const onEmptySelected = () => {
    if (selected !== null) setSelected(null);
    setNoSemantics(!noSemantics);
  };

  // on semantics change, check for duplicates to add labels to
  React.useEffect(() => {
    // mount
    checkForDuplicates();
  }, [semantics]);

  const getPrimaryAction = () => {
    if (semanticsAreSet || noSemantics) {
      return {
        completesStep: true,
        // isDisabled: showInfo,
        onClick: onDoneWithSemantics
      };
    }

    return null;
  };

  return (
    <AnnotationStepPage
      title="Semantics"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {showInfo && (
          <React.Fragment>
            <Alert
              icon={<SvgInfo />}
              style={{ padding: 0 }}
              text="Optional: label duplicate semantics for distinction."
              type="info"
            />
            <div className="spacer1" />
          </React.Fragment>
        )}

        {semanticsAreSet && (
          <React.Fragment>
            {semanticsArray.map((key) => {
              const { id, label, type } = semantics[key];

              const showLabel = label !== null || needsLabel.includes(id);
              const hasTempLabel = labelsTemp[id]?.value || label;

              // is flagged for not having label
              const infoClass =
                needsLabel.includes(id) && hasTempLabel === null
                  ? ' info'
                  : '';

              return (
                <div key={key} className="row-semantic flex-row-space-between">
                  <div className="flex-row-center">
                    <div className="semantic-type">{`${type}`}</div>

                    {showLabel && (
                      <React.Fragment>
                        <div className="spacer2w" />
                        <div className="muted">Label</div>
                        <div className="spacer1w" />
                        <input
                          className={`input${infoClass}`}
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
                    onClick={() => onRemoveSemantic(id)}
                    onKeyPress={() => onRemoveSemantic(id)}
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

        <HeadingStep number={1} text="Select semantic type" />
        {!semanticsAreSet && (
          <EmptyStepSelection
            isSelected={noSemantics}
            onClick={onEmptySelected}
            stepName="semantics"
          />
        )}
        {!noSemantics && (
          <div className="button-group">
            {semanticsTypesArray.map((type) => {
              const { label, icon } = semanticsTypesObj[type];

              // check if limit usage has been reached
              const maxUsageReached = semanticsValue.filter(
                (l) => l.type === type && semanticsOnlyOnce.includes(type)
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
                    onKeyPress={onClick}
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
};

export default Semantics;
