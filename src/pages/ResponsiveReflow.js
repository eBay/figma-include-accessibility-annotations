import * as React from 'react';

// components
import { AnnotationStepPage, HeadingStep } from '../components';

// app state
import Context from '../context';

function ResponsiveReflow() {
  // main app state
  const cnxt = React.useContext(Context);
  const { page, pageType } = cnxt;
  const { sendToFigma } = cnxt;

  // local state
  const routeName = 'Responsive reflow';

  const confirmResponsiveReflowCheck = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Responsive reflow Layer',
      create: true,
      page,
      pageType
    });
  };

  return (
    <AnnotationStepPage
      bannerTipProps={{ pageType, routeName }}
      title="Responsive reflow"
      routeName={routeName}
      footerProps={{
        primaryAction: {
          completesStep: true,
          onClick: confirmResponsiveReflowCheck,
          buttonText: 'Mark as complete'
        },
        secondaryAction: null
      }}
    >
      <React.Fragment>
        <HeadingStep number={1} text="Define key screens from a flow" />

        <HeadingStep
          number={2}
          text="Mock up a variety of viewport sizes to show how the content reflows from desktop (1920px wide) to mobile (down to 320px wide)"
        />
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ResponsiveReflow;
