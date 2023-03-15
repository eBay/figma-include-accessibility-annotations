import * as React from 'react';

// icons
import { SvgArrowRight, SvgMobile, SvgWeb } from '../icons';

// app state
import Context from '../context';

const ChooseYourOwnAdventure = () => {
  // main app state
  const { updateState, version } = React.useContext(Context);

  const onClick = (selectedType) => {
    updateState('pageType', selectedType);
  };

  const backToDashboard = () => {
    updateState('showDashboard', true);
  };

  return (
    <div className="flex-center h-100 relative">
      <p className="strong">Choose your adventure</p>

      <div className="spacer2" />

      <div className="flex-row-center">
        <div
          className="select-page-block"
          onClick={() => onClick('web')}
          onKeyPress={() => onClick('web')}
          role="button"
          tabIndex="0"
        >
          <div className="select-page-type">
            <SvgWeb />
          </div>
          <p>web</p>
        </div>

        <div className="spacer6w" />

        <div
          className="select-page-block"
          onClick={() => onClick('native')}
          onKeyPress={() => onClick('native')}
          role="button"
          tabIndex="0"
        >
          <div className="select-page-type">
            <SvgMobile />
          </div>
          <p>native</p>
        </div>
      </div>

      <div className="absolute-bottom-left">
        <div
          className="flex-row-center border-radius-2 link cursor-pointer"
          onClick={backToDashboard}
          onKeyPress={backToDashboard}
          role="button"
          tabIndex="0"
        >
          <div className="svg-theme-stroke_link rotate-180">
            <SvgArrowRight />
          </div>
          <div className="spacer1w" />
          Back
        </div>
      </div>

      <div className="absolute-bottom-right muted">{`v.${version}`}</div>
    </div>
  );
};

export default React.memo(ChooseYourOwnAdventure);
