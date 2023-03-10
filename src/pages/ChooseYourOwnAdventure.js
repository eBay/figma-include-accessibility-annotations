import * as React from 'react';

// icons
import { SvgMobile, SvgWeb } from '../icons';

// app state
import Context from '../context';

const ChooseYourOwnAdventure = () => {
  // main app state
  const { updateState } = React.useContext(Context);

  const onClick = (selectedType) => {
    updateState('pageType', selectedType);
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
    </div>
  );
};

export default React.memo(ChooseYourOwnAdventure);
