import * as React from 'react';

// components
import { AnnotationStepPage, HeadingStep } from '@/components';

// app state
import Context from '@/context';

function TextZoom() {
  // main app state
  const cnxt = React.useContext(Context);
  const { page, pageType } = cnxt;
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

  return (
    <AnnotationStepPage
      bannerTipProps={{ pageType, routeName }}
      title="Text resizing"
      routeName={routeName}
      footerProps={{
        primaryAction:
          isCompleted || frameCopied
            ? {
                buttonText: 'Overflow documented',
                completesStep: true,
                onClick: confirmTextZoomCheck
              }
            : {
                buttonText: 'Copy design with larger text',
                completesStep: false,
                onClick: onStartCopy
              },
        secondaryAction:
          isCompleted || frameCopied
            ? {
                buttonText: 'Copy again',
                skipsStep: false,
                onClick: onStartCopy
              }
            : null
      }}
    >
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
    </AnnotationStepPage>
  );
}

export default TextZoom;
