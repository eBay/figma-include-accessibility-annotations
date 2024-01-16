import * as React from 'react';

// components
import { AnnotationStepPage, HeadingStep } from '../components';

// icons: touch target
import SvgTouchTarget from '../icons/touch-target';

// app state
import Context from '../context';

const customFooter = (
  <React.Fragment>
    <div className="spacer2" />

    <div className="flex-row justify-center">
      <SvgTouchTarget.SvgHelp1 />
      <div className="spacer1w" />
      <SvgTouchTarget.SvgHelp2 />
    </div>

    <div className="flex-row justify-center">
      <div className="reading-order-text font-10">
        ex. touch targets for icons don&apos;t overlap
      </div>
      <div className="spacer1w" />
      <div className="reading-order-text font-10">
        ex. touch target for a group of elements
      </div>
    </div>
  </React.Fragment>
);

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
      bannerTipProps={{ pageType, routeName, footer: customFooter }}
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
          text="Check if there are any small elements that need to have the touch target marked up (e.g. an icon without background)."
        />

        <HeadingStep
          number={2}
          text="Add any additional annotation for elements to be regarded as one area (e.g. an image + CTA tile)."
        />
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default TouchTarget;
