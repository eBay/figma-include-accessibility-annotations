import * as React from 'react';

// components
import { AnnotationStepPage, HeadingStep } from '../components';

// app state
import Context from '../context';

function TouchTarget() {
  // main app state
  const cnxt = React.useContext(Context);
  const { page, pageType, sendToFigma } = cnxt;

  // local state
  const routeName = 'Touch target';

  const confirmScreenSizeCheck = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Touch target Layer',
      create: true,
      page,
      pageType
    });
  };

  return (
    <AnnotationStepPage
      title="Touch target checks"
      bannerTipProps={{ pageType, routeName }}
      routeName={routeName}
      footerProps={{
        primaryAction: {
          completesStep: true,
          onClick: confirmScreenSizeCheck,
          buttonText: 'Touch targets checked'
        },
        secondaryAction: null
      }}
    >
      <React.Fragment>
        <HeadingStep
          number={1}
          text="Look at the interactive elements (like links, icon buttons). Is their visual footprint meeting the minimum size requirements?"
        />

        <HeadingStep
          number={2}
          text="For the interactive elements that are too small visually, draw a touch target area and include in dev hand-off documentation"
        />
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default TouchTarget;
