import * as React from 'react';
import { utils } from '../constants';

// components
import {
  AnnotationStepPage,
  scrollToBottomOfAnnotationStep,
  HeadingStep
} from '../components';

// icons
import { SvgCheck } from '../icons';

// icons: reading order
import SvgReadingOrder from '../icons/reading-order';
import readingOrderTypes from '../data/reading-order-types';

// app state
import Context from '../context';

const customFooter = (
  <React.Fragment>
    <div className="spacer2" />

    <div className="flex-row justify-center">
      <SvgReadingOrder.SvgHelp1 />
      <div className="spacer1w" />
      <SvgReadingOrder.SvgHelp2 />
    </div>

    <div className="flex-row justify-center">
      <div className="reading-order-text font-10">
        ex. z-pattern: left-to-right, top-to-bottom
      </div>
      <div className="spacer1w" />
      <div className="reading-order-text font-10">
        ex. by column, top-to-bottom, left-to-right
      </div>
    </div>
  </React.Fragment>
);

function ReadingOrder() {
  // main app state
  const cnxt = React.useContext(Context);
  const { page, pageType, sendToFigma } = cnxt;
  const { stepsCompleted } = cnxt;

  // state defaults
  const routeName = 'Reading order';
  const isCompleted = stepsCompleted.includes(routeName);

  // local state
  const [hasArrows, setHasArrows] = React.useState(isCompleted);

  const onAddArrow = (arrowType = 'right') => {
    const { bounds, id, name } = page;

    // let figma side know, time to place that new arrow
    sendToFigma('add-reading-order-arrow', {
      bounds,
      firstArrow: !hasArrows,
      arrowType,
      name,
      page,
      pageId: id,
      pageType
    });

    // update ui to show step 2
    setHasArrows(true);
    scrollToBottomOfAnnotationStep();
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
      bannerTipProps={{ pageType, routeName, footer: customFooter }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        <HeadingStep number={1} text="Add arrows in chosen direction" />

        <div className="button-group">
          {Object.values(readingOrderTypes).map((readingOrderType) => {
            const onClick = () => {
              onAddArrow(readingOrderType.id);
            };

            return (
              <div
                key={readingOrderType.id}
                className="container-selection-button"
              >
                <div
                  role="button"
                  onClick={onClick}
                  onKeyDown={({ key }) => {
                    if (utils.isEnterKey(key)) onClick();
                  }}
                  className="selection-button"
                  tabIndex={-1}
                >
                  {readingOrderType.icon}
                </div>

                <div className="selection-button-label">
                  {readingOrderType.label}
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
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ReadingOrder;
