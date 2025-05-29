import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { utils } from '@/constants';

// components
import {
  AnnotationStepPage,
  Dropdown,
  HeadingStep,
  Toggle
} from '@/components';

// icons
import { SvgCheck, SvgReorder } from '@/icons';

// data
import focusOrderTypes from '@/data/focus-order-types';
import readingOrderTypes from '@/data/reading-order-types';

// app state
import Context from '@/context';

const focusTypesArray = Object.keys(focusOrderTypes);
const focusTypesArrayDropdown = focusTypesArray.map((id) => ({
  id,
  value: id
}));

function ReadingOrder() {
  // main app state
  const cnxt = React.useContext(Context);
  const { focusOrders, page, pageType, stepsCompleted, sendToFigma } = cnxt;
  const { updateState } = cnxt;

  // ui state
  const focusOrdersKeys = Object.keys(focusOrders);
  const focusOrdersAreSet = focusOrdersKeys.length !== 0;

  // state defaults
  const routeName = 'Reading order';
  const isCompletedInitial =
    stepsCompleted.includes(routeName) || focusOrdersAreSet;

  // local state
  const [isCompleted, setIsCompleted] = React.useState(isCompletedInitial);
  const [hasArrows, setHasArrows] = React.useState(false);
  const [hasKeyboardFocus, setKeyboardFocus] =
    React.useState(focusOrdersAreSet);
  const [openedDropdown, setOpenedDropdown] = React.useState(null);

  const onAddArrow = (arrowType = 'right') => {
    const { bounds, id, name } = page;

    // let figma side know, time to place that new arrow
    sendToFigma('add-reading-order-arrow', {
      bounds,
      arrowType,
      name,
      page,
      pageId: id,
      pageType
    });

    // update ui to show step 2
    setHasArrows(true);
    setIsCompleted(true);

    utils.scrollToBottomOfAnnotationStep();
  };

  const onAddFocusOrder = (focusOrderType = 'tabs') => {
    const { bounds, id, name } = page;

    // scroll down to always show the focus order options
    utils.scrollToBottomOfAnnotationStep();

    // let figma side know, time to place that new focus order
    sendToFigma('add-focus-order', {
      bounds,
      focusOrderType,
      name,
      page,
      pageId: id,
      pageType
    });

    setIsCompleted(true);
  };

  const updateNumbers = (obj) => {
    const entries = Object.entries(obj).sort(
      (a, b) => a[1].number - b[1].number
    );

    let baseNumber = 1;
    let subNumber = 0;

    entries.forEach(([, item]) => {
      if (item.type === 'tabs') {
        item.number = baseNumber;
        baseNumber += 1;
        subNumber = 0;
      } else if (item.type === 'arrows') {
        subNumber += 0.1;
        item.number = parseFloat((baseNumber - 1 + subNumber).toFixed(1));
      }
    });

    return obj;
  };

  const onTypeUpdate = (type, key) => {
    const newFocusOrdersObj = { ...focusOrders };
    newFocusOrdersObj[key].type = type;

    // check if no tabs are present
    const hasTabs = Object.values(newFocusOrdersObj).some(
      (item) => item.type === 'tabs'
    );

    // don't allow to remove the last tab
    if (hasTabs === false) {
      newFocusOrdersObj[key].type = 'tabs';
    }

    // update numbers per new types being set
    const resortedNumbers = updateNumbers(newFocusOrdersObj);

    updateState('focusOrders', resortedNumbers);

    // update the figma side with the new type
    sendToFigma('update-focus-orders', {
      focusOrderObject: resortedNumbers
    });
  };

  const onRemoveFocusOrder = (id) => {
    const focusOrder = focusOrders[id];

    // remove from main state
    const newFocusOrdersObj = { ...focusOrders };
    delete newFocusOrdersObj[id];

    // update numbers per type removal
    const resortedNumbers = updateNumbers(newFocusOrdersObj);

    // remove from figma (if it exists)
    sendToFigma('remove-focus-order', {
      page,
      pageType,
      focusOrder
    });

    // update main state
    updateState('focusOrders', resortedNumbers);

    // update the figma side with the new type
    sendToFigma('update-focus-orders', {
      focusOrderObject: resortedNumbers
    });
  };

  const onDoneWithReadingOrder = () => {
    // all is good to go
    sendToFigma('confirm-reading-order', { page, pageType });
  };

  const getPrimaryAction = () => {
    if (isCompleted) {
      return { completesStep: true, onClick: onDoneWithReadingOrder };
    }

    return null;
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const draggedItem = focusOrders[draggableId];

    // ensure that "tabs" items cannot be removed from the first position
    if (draggedItem.type === 'tabs' && sourceIndex === 0) return;

    // ensure that "arrows" items cannot be placed before the first "tabs" item
    if (draggedItem.type === 'arrows' && destinationIndex === 0) return;

    const newFocusOrders = { ...focusOrders };
    const focusOrderKeys = Object.keys(newFocusOrders);

    // remove the dragged item from its original position
    focusOrderKeys.splice(sourceIndex, 1);

    // insert the dragged item at the new position
    focusOrderKeys.splice(destinationIndex, 0, draggableId);

    const reorderedFocusOrders = {};
    focusOrderKeys.forEach((key) => {
      reorderedFocusOrders[key] = newFocusOrders[key];
    });

    // reassign the "number" values based on new order
    let currentNumber = 1;
    let currentSubNumber = 1.1;

    focusOrderKeys.forEach((key) => {
      const item = reorderedFocusOrders[key];

      if (item.type === 'tabs') {
        item.number = currentNumber;
        currentNumber += 1;
        currentSubNumber = 1.1;
      } else if (item.type === 'arrows') {
        const previousTabIndex = focusOrderKeys
          .slice(0, focusOrderKeys.indexOf(key))
          .reverse()
          .findIndex((k) => reorderedFocusOrders[k].type === 'tabs');

        const previousTab =
          focusOrderKeys[focusOrderKeys.indexOf(key) - previousTabIndex - 1];

        if (previousTab) {
          const tabNumber = reorderedFocusOrders[previousTab].number;
          item.number = parseFloat(`${tabNumber}.${currentSubNumber}`);
          currentSubNumber += 1;
        }
      }
    });

    updateState('focusOrders', reorderedFocusOrders);

    // update the figma side with the new order and labels
    sendToFigma('update-focus-orders', {
      focusOrderObject: reorderedFocusOrders
    });
  };

  const getChildCount = (parentNumber) => {
    const children = Object.values(focusOrders).filter((item) => {
      const itemNumber = item.number.toString();
      return itemNumber.startsWith(`${parentNumber}.`);
    });

    return children.length;
  };

  return (
    <AnnotationStepPage
      title="Reading order"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {focusOrdersAreSet && (
          <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tabs">
                {(p1) => (
                  <div {...p1.droppableProps} ref={p1.innerRef}>
                    {Object.keys(focusOrders).map((key, index) => {
                      const { id, number, type } = focusOrders[key];
                      const isOpened = openedDropdown === id;
                      const allowDelete = getChildCount(number) === 0;

                      return (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(p2) => (
                            <div
                              ref={p2.innerRef}
                              {...p2.draggableProps}
                              {...p2.dragHandleProps}
                              className="focus-order-line"
                              data-number={number}
                              data-type={type}
                            >
                              <div className="flex-row-center">
                                <div className="drag-handle flex-row-center">
                                  <div className="spacer1w" />
                                  <SvgReorder />
                                  <div className="spacer1w" />

                                  <p>{number}</p>
                                </div>

                                <Dropdown
                                  align="left"
                                  data={focusTypesArrayDropdown}
                                  index={id}
                                  isOpened={isOpened}
                                  onOpen={setOpenedDropdown}
                                  onSelect={onTypeUpdate}
                                  type={type}
                                />
                              </div>

                              {allowDelete && (
                                <div
                                  aria-label="remove focus order"
                                  className="btn-remove"
                                  onClick={() => onRemoveFocusOrder(id)}
                                  onKeyDown={(e) => {
                                    if (utils.isEnterKey(e.key))
                                      onRemoveFocusOrder(id);
                                  }}
                                  role="button"
                                  tabIndex="0"
                                >
                                  <div className="remove-dash" />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {p1.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="spacer2" />
          </div>
        )}

        <HeadingStep number={1} text="Add arrows in chosen direction" />

        <div className="button-group">
          {Object.values(readingOrderTypes).map((readingOrderType) => {
            const onClick = () => {
              onAddArrow(readingOrderType.id);
            };

            return (
              <div
                key={readingOrderType.id}
                className="container-selection-button small"
              >
                <div
                  aria-label={`Add ${readingOrderType.label} arrow`}
                  role="button"
                  onClick={onClick}
                  onKeyDown={({ key }) => {
                    if (utils.isEnterKey(key)) onClick();
                  }}
                  className="selection-button small"
                  tabIndex="0"
                >
                  {readingOrderType.icon}
                </div>
              </div>
            );
          })}
        </div>

        {hasArrows === true && (
          <React.Fragment>
            <div className="spacer2" />

            <div className="flex-row align-start">
              <div className="circle-success svg-theme-success mr1">
                <SvgCheck size={14} />
              </div>
              <p>Arrow placed in Figma</p>
            </div>

            <div className="spacer2" />

            <HeadingStep
              number={2}
              text="Position arrows to reflect the desired order of consuming content in the page/section you are designing"
            />
          </React.Fragment>
        )}

        {hasArrows === false && <div className="spacer2" />}

        <div className="divider" />
        <div className="spacer3" />

        <Toggle
          checked={hasKeyboardFocus}
          label="Keyboard focus order"
          onChange={(val) => {
            setKeyboardFocus(val);
          }}
        />

        {hasKeyboardFocus && (
          <React.Fragment>
            <div className="spacer2" />

            <HeadingStep
              number={1}
              text="Mark focus order where different from the reading order."
            />

            <div className="button-group">
              {Object.values(focusOrderTypes).map((item) => {
                const onClick = () => {
                  onAddFocusOrder(item.id);
                };

                return (
                  <div key={item.id} className="container-selection-button">
                    <div
                      aria-label="Add focus order"
                      role="button"
                      onClick={onClick}
                      onKeyDown={({ key }) => {
                        if (utils.isEnterKey(key)) onClick();
                      }}
                      className="selection-button"
                      tabIndex="0"
                    >
                      {item.icon}
                    </div>

                    <div className="selection-button-label">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ReadingOrder;
