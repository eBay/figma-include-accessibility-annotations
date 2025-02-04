import * as React from 'react';
import { utils } from '@/constants';

// components
import {
  AnnotationStepPage,
  Dropdown,
  EmptyStepSelection,
  HeadingStep,
  Alert
} from '@/components';

// icons
import { SvgText, SvgWarning } from '@/icons';

// app state
import Context from '@/context';

// data
import headingTypesWeb from '@/data/heading-types';
import headingTypesNative from '@/data/heading-types-native';

function Headings() {
  // main app state
  const cnxt = React.useContext(Context);
  const { headings, headingTemp, page, pageType } = cnxt;
  const { stepsCompleted, sendToFigma, updateState } = cnxt;

  const headingTypes =
    pageType === 'web' ? headingTypesWeb : headingTypesNative;
  const headingTypesArray = Object.keys(headingTypes);
  const headingTypesArrayDropdown = headingTypesArray.map((id) => ({
    id,
    value: headingTypes[id].value
  }));

  // ui state
  const headingsArray = Object.keys(headings);
  const headingsAreSet = headingsArray.length !== 0;

  // state defaults
  const routeName = 'Headings';
  const isCompleted = stepsCompleted.includes(routeName);
  const defaultNoHeadings = isCompleted && headingsArray.length === 0;

  // local state
  const [noHeadings, setNoHeadings] = React.useState(defaultNoHeadings);
  const [openedDropdown, setOpenedDropdown] = React.useState(null);
  const [showWarning, setShowWarning] = React.useState(false);

  // start of selection of headings
  const onHeadingsListenStart = () => {
    // start listening for headings selection
    sendToFigma('headings-listener', {
      page,
      pageType,
      shouldListen: true
    });
  };

  const onHeadingsListenStop = () => {
    // stop listening for headings selection
    sendToFigma('headings-listener', { page, pageType });
  };

  const onEmptySelected = () => {
    const newNoHeadings = !noHeadings;
    setNoHeadings(newNoHeadings);

    if (newNoHeadings) {
      onHeadingsListenStop();
    } else {
      onHeadingsListenStart();
    }
  };

  const sortAndStoreHeadingsObj = (tempHeadingsObj) => {
    // sort h1 to h6
    const objectValues = Object.values(tempHeadingsObj);
    const sorted = objectValues.sort((a, b) => a.value - b.value);

    // back to object
    const newHeadingsObj = {};
    sorted.map((heading) => {
      newHeadingsObj[heading.id] = heading;
      return null;
    });

    // update main state
    updateState('headings', newHeadingsObj);
  };

  const onInitialTypeSelect = (headingType) => {
    if (!headingTemp) {
      setShowWarning(true);
      return;
    }

    const newHeading = {
      ...headingTemp,
      type: headingTypes[headingType].value,
      value: headingTypes[headingType].id
    };

    sendToFigma('add-heading', {
      page,
      pageType,
      heading: newHeading
    });

    // update main state
    sortAndStoreHeadingsObj({ ...headings, [newHeading.id]: newHeading });
    updateState('headingTemp', null);
    onHeadingsListenStart();
  };

  const onTypeUpdate = (type, key) => {
    const tempHeadingsObj = { ...headings };
    tempHeadingsObj[key].type = type;
    tempHeadingsObj[key].value = parseInt(type.replace(/\D+/g, ''), 10); // help with sorting
    sortAndStoreHeadingsObj(tempHeadingsObj);
  };

  const onRemoveHeading = (id) => {
    const heading = headings[id];

    sendToFigma('remove-heading', {
      page,
      pageType,
      heading
    });

    // remove from main state
    const newHeadingsObj = { ...headings };
    delete newHeadingsObj[id];

    // update main state
    updateState('headings', newHeadingsObj);
  };

  const onHeadingsConfirmed = () => {
    if (noHeadings) {
      sendToFigma('no-heading', {
        page,
        bounds: page.bounds,
        name: page.name,
        pageId: page.id,
        pageType
      });
    } else {
      // all is good to go, tell figma to add overlay layer
      sendToFigma('confirm-headings', { headings, page, pageType });
    }
  };

  React.useEffect(() => {
    if (headingTemp) {
      setShowWarning(false);
      // onHeadingsListenStop();
      utils.scrollToBottomOfAnnotationStep();
    }
  }, [headingTemp]);

  React.useEffect(() => {
    // mount
    onHeadingsListenStart();

    return () => {
      // unmount
      // if user leaves the step early, while listening for headings selection,
      // stop listening for headings selection
      sendToFigma('headings-listener', { page, pageType });
    };
  }, []);

  const getPrimaryAction = () => {
    if (headingsAreSet || noHeadings) {
      return {
        onClick: onHeadingsConfirmed, // create annotations
        completesStep: true
      };
    }

    return null;
  };

  const stepOneText = headingTemp
    ? `“${headingTemp.title}” selected`
    : `Select ${
        pageType === 'web' ? 'a heading' : 'all headings'
      } on your Figma page (text layers only)`;

  return (
    <AnnotationStepPage
      title="Headings"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {headingsArray.length > 0 && (
          <React.Fragment>
            {headingsArray.map((key) => {
              const { id, title, type } = headings[key];
              const isOpened = openedDropdown === id;

              return (
                <div key={id} className="flex-row-space-between">
                  <div className="flex-row-center">
                    <SvgText fill="#b3b3b3" />

                    <div className="heading-title">{title}</div>
                  </div>

                  <div className="flex-row-center">
                    {pageType === 'web' && (
                      <Dropdown
                        align="right"
                        data={headingTypesArrayDropdown}
                        index={id}
                        isOpened={isOpened}
                        onOpen={setOpenedDropdown}
                        onSelect={onTypeUpdate}
                        type={type}
                      />
                    )}

                    <div className="spacer1w" />

                    <div
                      aria-label="remove heading"
                      className="btn-remove"
                      onClick={() => onRemoveHeading(id)}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) onRemoveHeading(id);
                      }}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="remove-dash" />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="spacer1" />

            <div className="divider" />

            <div className="spacer3" />
          </React.Fragment>
        )}

        <HeadingStep number={1} text={stepOneText} />

        {showWarning && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text="Select text in your figma frame first"
              type="warning"
            />
            <div className="spacer2" />
          </React.Fragment>
        )}

        {!headingsAreSet && (
          <EmptyStepSelection
            id="no-headings"
            isSelected={noHeadings}
            onClick={onEmptySelected}
            text="no headings"
          />
        )}

        {!noHeadings && (
          <React.Fragment>
            <HeadingStep number={2} text="Choose heading level" />

            <div className="button-group" role="radiogroup">
              {headingTypesArray.map((type) => {
                const { label, icon } = headingTypes[type];

                const onClick = () => {
                  onInitialTypeSelect(type);
                };

                return (
                  <div key={label} className="container-selection-button">
                    <div
                      className="selection-button"
                      onClick={onClick}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) onClick();
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div>{icon}</div>
                    </div>

                    <div className="selection-button-label">
                      heading
                      <br />
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default Headings;
