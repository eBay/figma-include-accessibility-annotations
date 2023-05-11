import * as React from 'react';

// components
import {
  AnnotationStepPage,
  Dropdown,
  HeadingStep,
  LoadingSpinner
} from '../components';
import ColorBlindnessFilter from '../components/ColorBlindnessFilter';

// helpers
import { contrast } from '../constants';

// app state
import Context from '../context';

const cbTypes = [
  { id: '0', value: 'None' },
  { id: '1', value: 'Protanopia' },
  { id: '2', value: 'Protanomaly' },
  { id: '3', value: 'Deuteranopia' },
  { id: '4', value: 'Deuteranomaly' },
  { id: '5', value: 'Tritanopia' },
  { id: '6', value: 'Tritanomaly' },
  { id: '7', value: 'Achromatopsia' },
  { id: '8', value: 'Achromatomaly' }
];

const ColorBlindness = () => {
  // main app state
  const cnxt = React.useContext(Context);
  const { colorBlindnessView, leftNavVisible, page, pageType } = cnxt;
  const { sendToFigma, stepsCompleted, updateState } = cnxt;

  // ui state
  const routeName = 'Color blindness';
  const isCompleted = stepsCompleted.includes(routeName);

  // local state
  const [loading, setLoading] = React.useState(false);
  const [designUri, setURI] = React.useState(null);
  const [cbType, setCBType] = React.useState('None');
  const [openedDropdown, setOpenedDropdown] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const onSelect = async (selected) => {
    setCBType(selected);
  };

  const showColorBlindnessViewer = () => {
    // show loading state
    setLoading(true);

    // loading image was killing the thread, causing loading state to not show, so delaying
    // https://www.figma.com/plugin-docs/frozen-plugins/
    setTimeout(() => {
      // let figma side know to start the viewer
      sendToFigma('start-color-blindness-view', {
        page
      });
    }, 100);
  };

  const confirmColorBlindnessChecked = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Color blindness Layer',
      create: true,
      page,
      pageType
    });
  };

  const onClose = () => {
    updateState('colorBlindnessView', false);

    // resize plugin (go back to their pref)
    const pluginWidth = leftNavVisible === false ? 516 : 700;
    sendToFigma('resize-plugin', {
      condensed: leftNavVisible === false,
      height: 518,
      width: pluginWidth
    });
  };

  const onMessageListen = async (event) => {
    const { data, type } = event.data.pluginMessage;

    // only listen for this response type on this step
    if (type === 'color-blindness-design-image') {
      setLoading(false);

      const { result, width } = data;
      const { imageWithTextLayers } = result;

      // display image
      const imageUri = contrast.urlForImageBytes(imageWithTextLayers);
      setURI(imageUri);

      // adjust plugin size depending on design
      const newIsMobile = width < 800;
      setIsMobile(newIsMobile);

      // get figma app dimensions
      const { outerHeight, outerWidth } = window;

      const isCondensed = leftNavVisible === false;

      const pluginHeight = outerHeight - 240;
      const pluginWidth = outerWidth - 440;

      sendToFigma('resize-plugin', {
        condensed: isCondensed,
        height: pluginHeight,
        width: pluginWidth
      });

      // show color blindness viewer
      updateState('colorBlindnessView', true);
    }
  };

  React.useEffect(() => {
    // mount
    window.addEventListener('message', onMessageListen);

    return () => {
      // unmount
      window.removeEventListener('message', onMessageListen);
    };
  }, []);

  const getPrimaryAction = () => {
    if (isCompleted === false) {
      return {
        buttonText: 'Color blindness viewer',
        completesStep: false,
        onClick: showColorBlindnessViewer
      };
    }

    return {
      buttonText: 'Color blindness checked',
      completesStep: true,
      onClick: confirmColorBlindnessChecked
    };
  };

  const getSecondaryAction = () => {
    if (isCompleted) {
      return {
        buttonText: 'View again',
        skipsStep: false,
        onClick: showColorBlindnessViewer
      };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="h-100 w-100 flex-center">
        <LoadingSpinner size={36} />
        <div className="muted font-12 pt1">Grabbing design file</div>
      </div>
    );
  }

  if (colorBlindnessView) {
    const cbTypeClass =
      cbType === null ? '' : cbType.toLowerCase().replace(/\s/g, '-');
    const isOpened = openedDropdown !== null;
    const mobileClass = isMobile ? ' is-mobile' : '';

    return (
      <main id="main" tabIndex="-1">
        <div className="cb-controls">
          <div className="flex-row-center">
            <p>Select Color blindness type:</p>

            <div className="spacer-xs-w" />

            <Dropdown
              data={cbTypes}
              index={cbType}
              isOpened={isOpened}
              onOpen={setOpenedDropdown}
              onSelect={onSelect}
              type={cbType}
            />
          </div>

          <button className="btn" onClick={onClose} type="button">
            Exit viewer
          </button>
        </div>

        <div className={`cb-preview-content${mobileClass}`}>
          <ColorBlindnessFilter />

          <img
            src={designUri}
            className={cbTypeClass}
            alt="current design file"
          />
        </div>
      </main>
    );
  }

  return (
    <AnnotationStepPage
      title="Use of color"
      bannerTipProps={{ pageType, routeName }}
      routeName={routeName}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        <HeadingStep
          number={1}
          text="Check if there are any color contrast issues with graphics"
        />

        <HeadingStep
          number={2}
          text="Take a look at the visualzation below to understand how your design might be perceived by people with color blindness"
        />
      </React.Fragment>
    </AnnotationStepPage>
  );
};

export default ColorBlindness;
