import * as React from 'react';
import { contrast, utils } from '@/constants';

// components
import { AnnotationStepPage, HeadingStep, LoadingSpinner } from '@/components';
import ColorBlindnessFilter from '@/components/ColorBlindnessFilter';

// icons
import { SvgCarrot } from '@/icons';

// app state
import Context from '@/context';

// data
import colorBlindnessTypesObj from '@/data/color-blindness-types';

const colorBlindnessTypesArray = Object.keys(colorBlindnessTypesObj);

function ColorBlindness() {
  // main app state
  const cnxt = React.useContext(Context);
  const { colorBlindnessView, page, pageType } = cnxt;
  const { sendToFigma, stepsCompleted, updateState } = cnxt;

  // ui state
  const routeName = 'Color blindness';
  const isCompleted = stepsCompleted.includes(routeName);

  // local state
  const [loading, setLoading] = React.useState(false);
  const [designUri, setURI] = React.useState(null);
  const [selected, setSelected] = React.useState('None');
  const [showGlossary, setShowGlossary] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  // display
  const arrowGlossaryClass = showGlossary ? '' : 'rotate-270';
  const arrowPreviewClass = showPreview ? '' : 'rotate-270';

  const showColorBlindnessViewer = () => {
    // show loading state
    setLoading(true);

    // hide glossary for now
    setShowGlossary(false);

    // set to first filter
    setSelected('Tritanomaly');

    // scroll up just in case
    utils.scrollToBottomOfAnnotationStep();

    // loading image was killing the thread, causing loading state to not show, so delaying
    // https://www.figma.com/plugin-docs/frozen-plugins/
    setTimeout(() => {
      // let figma side know to start the viewer
      sendToFigma('start-color-blindness-view', {
        page
      });
    }, 100);
  };

  const onClose = () => {
    updateState('colorBlindnessView', false);
  };

  const confirmColorBlindnessChecked = () => {
    onClose();

    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Color blindness Layer',
      create: true,
      page,
      pageType
    });
  };

  const onMessageListen = async (event) => {
    const { data, type } = event.data.pluginMessage;

    // only listen for this response type on this step
    if (type === 'color-blindness-design-image') {
      setLoading(false);

      const { result } = data;
      const { imageWithTextLayers } = result;

      // display image
      const imageUri = contrast.urlForImageBytes(imageWithTextLayers);
      setURI(imageUri);

      // show color blindness viewer
      updateState('colorBlindnessView', true);

      setShowPreview(true);
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
    if (colorBlindnessView) {
      return {
        buttonText: 'All looks good',
        completesStep: true,
        onClick: confirmColorBlindnessChecked
      };
    }

    if (isCompleted === false) {
      return {
        buttonText: 'Generate preview',
        completesStep: false,
        onClick: showColorBlindnessViewer
      };
    }

    return {
      buttonText: 'Color checked',
      completesStep: true,
      onClick: confirmColorBlindnessChecked
    };
  };

  const getSecondaryAction = () => {
    if (isCompleted && colorBlindnessView === false) {
      return {
        buttonText: 'View again',
        skipsStep: false,
        onClick: showColorBlindnessViewer
      };
    }

    return null;
  };

  const cbTypeClass =
    selected === null ? '' : selected.toLowerCase().replace(/\s/g, '-');

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
          text="Generate a preview of your design through different lenses and toggle between the views"
        />

        <HeadingStep
          number={2}
          text="Take a look at the visualization below to understand how your design might be perceived by people with color blindness"
        />

        <div className="divider" />

        <div className="spacer2" />

        <div
          className="flex-row-center border-radius-2 cursor-pointer"
          onClick={() => setShowGlossary(!showGlossary)}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) {
              setShowGlossary(!showGlossary);
            }
          }}
          role="button"
          tabIndex="0"
        >
          <div className={`svg-theme mr1 animated ${arrowGlossaryClass}`}>
            <SvgCarrot />
          </div>

          <h2>Glossary</h2>
        </div>

        {showGlossary && (
          <React.Fragment>
            <div className="spacer2" />

            {colorBlindnessTypesArray.map((type) => {
              const { desc, icon, population } = colorBlindnessTypesObj[type];

              return (
                <div className="cb-glossary-item" key={type}>
                  {icon}
                  <div className="cb-glossary-desc">{`${desc} `}</div>
                  <span className="cb-pop">{`${population} population`}</span>
                </div>
              );
            })}
          </React.Fragment>
        )}

        {loading && (
          <div className="w-100 flex-center">
            <div className="spacer2" />
            <LoadingSpinner size={36} />
            <div className="muted font-12 pt1">Grabbing design file</div>
          </div>
        )}
        {colorBlindnessView && (
          <React.Fragment>
            <div className="spacer2" />

            <div
              className="flex-row-center border-radius-2 cursor-pointer"
              onClick={() => setShowPreview(!showPreview)}
              onKeyDown={({ key }) => {
                if (utils.isEnterKey(key)) {
                  setShowPreview(!showPreview);
                }
              }}
              role="button"
              tabIndex="0"
            >
              <div className={`svg-theme mr1 animated ${arrowPreviewClass}`}>
                <SvgCarrot />
              </div>

              <h2>Preview</h2>
            </div>
          </React.Fragment>
        )}

        {showPreview && (
          <React.Fragment>
            <div className="cb-controls">
              <div className="cb-types">
                {colorBlindnessTypesArray.map((type) => {
                  const { icon, value } = colorBlindnessTypesObj[type];

                  const isSelected = value === selected;
                  const newValue = isSelected ? 'None' : value;
                  const selectedClass = isSelected ? ' cb-selected' : '';

                  return (
                    <div
                      className={`cb-type${selectedClass}`}
                      key={type}
                      onClick={() => setSelected(newValue)}
                      onKeyDown={({ key }) => {
                        if (utils.isEnterKey(key)) {
                          setSelected(newValue);
                        }
                      }}
                      role="button"
                      tabIndex="0"
                    >
                      {icon}
                      <div className="cb-name">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cb-preview-content">
              <ColorBlindnessFilter />

              <img
                src={designUri}
                className={cbTypeClass}
                alt="current design file"
              />
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ColorBlindness;
