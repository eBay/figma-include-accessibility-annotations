import * as React from 'react';

// components
import {
  AnnotationStepPage,
  DevStepIncomplete,
  HeadingStep
} from '@/components';

// app state
import Context from '@/context';

function TextZoom() {
  // main app state
  const cnxt = React.useContext(Context);
  const { isDevMode, page, pageType } = cnxt;
  const { sendToFigma, stepsCompleted } = cnxt;

  // local state
  const routeName = 'Text zoom';

  // TODO: figure out how to initialize this with existing work / existing frame copied
  const isCompleted = stepsCompleted.includes(routeName);
  const [frameCopied, setFrameCopied] = React.useState(false);

  const onStartCopy = () => {
    // let figma side know to start clone for text zoom
    sendToFigma('text-zoom-clone', {
      page,
      pageType
    });

    setFrameCopied(true);
  };

  const confirmTextZoomCheck = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Text zoom Layer',
      create: true,
      page,
      pageType
    });
  };

  const getPrimaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: 'Next',
        completesStep: true,
        onClick: () => null
      };
    }

    return isCompleted || frameCopied
      ? {
          buttonText: 'Overflow documented',
          completesStep: true,
          onClick: confirmTextZoomCheck
        }
      : {
          buttonText: 'Copy design with larger text',
          completesStep: false,
          onClick: onStartCopy
        };
  };

  const getSecondaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: 'Prev',
        onClick: () => null,
        isPrev: true
      };
    }

    return isCompleted || frameCopied
      ? {
          buttonText: 'Copy again',
          skipsStep: false,
          onClick: onStartCopy
        }
      : null;
  };

  return (
    <AnnotationStepPage
      bannerTipProps={{ pageType, routeName }}
      title="Text resizing"
      completed={isCompleted}
      routeName={routeName}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        {isDevMode === false && (
          <React.Fragment>
            <HeadingStep
              number={1}
              text={`Create an example with text size enlarged${
                pageType === 'web'
                  ? ' 200% (e.g from 14px to 28px for body text)'
                  : ''
              }.`}
            />

            {(frameCopied || isCompleted) && (
              <HeadingStep
                number={2}
                text="Define overflow behavior (is the container getting larger? is the text wrapping? is there an ellipsis truncation?)"
              />
            )}
          </React.Fragment>
        )}

        {isDevMode === true &&
          (isCompleted ? (
            <React.Fragment>
              <HeadingStep text="Implement" />
              <p>
                Use provided mock for implementing truncation or reflow as text
                resizes. Check with the designer if you believe it should be
                different.
              </p>

              <div className="space-md" />
              <div className="divider" />
              <div className="space-md" />

              <HeadingStep text="Test" />
              {pageType === 'web' ? (
                <ul className="disc">
                  <li>Resize text to 200%, using zoom or browser settings.</li>
                  <li>
                    Ensure that enlarged text remains understandable. Text
                    should not extend beyond container, overlap with other page
                    content, or get clipped.
                  </li>
                  <li>Test at multiple breakpoints.</li>
                </ul>
              ) : (
                <React.Fragment>
                  <p>At different text sizes, up to 200%, check for:</p>
                  <ul className="disc">
                    <li>
                      All functionality is available and all text remains
                      understandable.
                    </li>
                    <li>No overlapping text.</li>
                    <li>No text extending beyond its bounds.</li>
                    <li>No content is hidden/cropped offscreen.</li>
                    <li>
                      If text is truncated, users can discover the full text.
                    </li>
                  </ul>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <DevStepIncomplete label="text resizing" />
          ))}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default TextZoom;
