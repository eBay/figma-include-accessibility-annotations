import * as React from 'react';
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

  // state defaults
  const routeName = 'Reading order';
  const isCompleted = stepsCompleted.includes(routeName);

  // ui state
  const focusOrdersKeys = Object.keys(focusOrders);
  const focusOrdersAreSet = focusOrdersKeys.length !== 0;

  // local state
  const [hasArrows, setHasArrows] = React.useState(isCompleted);
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
    utils.scrollToBottomOfAnnotationStep();
  };

  const onAddFocusOrder = (focusOrderType = 'tabs') => {
    const { bounds, id, name } = page;

    // let figma side know, time to place that new focus order
    sendToFigma('add-focus-order', {
      bounds,
      focusOrderType,
      name,
      page,
      pageId: id,
      pageType
    });
  };

  const onTypeUpdate = (type, key) => {
    const newFocusOrdersObj = { ...focusOrders };
    newFocusOrdersObj[key].type = type;

    updateState('focusOrders', newFocusOrdersObj);
  };

  const onRemoveFocusOrder = (id) => {
    const focusOrder = focusOrders[id];

    // remove from main state
    const newFocusOrdersObj = { ...focusOrders };
    delete newFocusOrdersObj[id];

    // remove from figma (if it exists)
    sendToFigma('remove-focus-order', {
      page,
      pageType,
      focusOrder
    });

    // update main state
    updateState('focusOrders', newFocusOrdersObj);
  };

  const onDoneWithReadingOrder = () => {
    // all is good to go
    sendToFigma('confirm-reading-order', { page, pageType });
  };

  const getPrimaryAction = () => {
    if (hasArrows) {
      return { completesStep: true, onClick: onDoneWithReadingOrder };
    }
    return null;
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
        {focusOrdersKeys.map((key) => {
          const { id, number, type } = focusOrders[key];
          const isOpened = openedDropdown === id;

          return (
            <div key={id} className="focus-order-line">
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

              <div
                aria-label="remove focus order"
                className="btn-remove"
                onClick={() => onRemoveFocusOrder(id)}
                onKeyDown={(e) => {
                  if (utils.isEnterKey(e.key)) onRemoveFocusOrder(id);
                }}
                role="button"
                tabIndex="0"
              >
                <div className="remove-dash" />
              </div>
            </div>
          );
        })}

        <div className="spacer2" />

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
