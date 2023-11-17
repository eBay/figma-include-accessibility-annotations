import * as React from 'react';
import { utils } from '../constants';

// components
import { AnnotationStepPage, HeadingStep } from '../components';

// icons
import { SvgArrowWidth, SvgPlus } from '../icons';

// app state
import Context from '../context';

function ResponsiveReflow() {
  // main app state
  const cnxt = React.useContext(Context);
  const { newFeaturesIntro, responsiveBreakpoints } = cnxt;
  const { page, pageType, sendToFigma, stepsCompleted } = cnxt;

  // local state
  const routeName = 'Responsive reflow';
  const isCompleted = stepsCompleted.includes(routeName);
  const [breakpoints, setBreakpoints] = React.useState(responsiveBreakpoints);
  const [canSave, setCanSave] = React.useState(true);
  const [isLoading, setLoading] = React.useState(false);

  // check if empty or contains anything but numbers
  const isNumber = (value) => {
    if (value === '') return false;

    return !isNaN(value);
  };

  // ui state
  const showOnboarding =
    newFeaturesIntro.includes('responsive-reflow-breakpoints') === false;
  const firstStepText = showOnboarding
    ? 'Check the widths of representative screens for each responsive breakpoint. We will keep these breakpoint(s) in "Settings" on your dashboard if you want to change it in the future.'
    : 'Mock up a variety of viewport sizes to show how the content reflows.';

  const onBreakpointChange = (e, index, key) => {
    const newValue = e.target.value;
    const newBreakpoints = [...breakpoints];

    // only allow 1 to 20 characters for name
    if (key === 'name' && newValue.length > 18) {
      return;
    }

    // update new value
    newBreakpoints[index][key] = newValue;

    // update state
    setBreakpoints(newBreakpoints);
  };

  const checkCanSave = () => {
    let newCanSave = true;
    const newBreakpoints = [...breakpoints];

    // sanitize data and check if we can save
    breakpoints.forEach(({ name, width }, index) => {
      if (name === '' || width === '') {
        newCanSave = false;
      }

      // check if width is a number
      if (isNumber(width) === false || width < 320) {
        newBreakpoints[index].width = 320;
      } else if (width > 3000) {
        newBreakpoints[index].width = 3000;
      }
    });

    // sort breakpoints by width
    newBreakpoints.sort((a, b) => a.width - b.width);

    setCanSave(newCanSave);
    setBreakpoints(newBreakpoints);
  };

  const addBreakpoint = () => {
    const newBreakpoints = [...breakpoints];
    const newId = breakpoints.length + 1;

    // add new breakpoint
    newBreakpoints.push({
      id: newId.toString(),
      name: '',
      width: ''
    });

    setBreakpoints(newBreakpoints);
    setCanSave(false);
  };

  const removeBreakpoint = (index) => {
    const newBreakpoints = [...breakpoints];

    // remove breakpoint
    newBreakpoints.splice(index, 1);

    setBreakpoints(newBreakpoints);
  };

  const saveBreakpoints = () => {
    let newCanSave = true;

    // sanitize data and check if we can save
    breakpoints.forEach(({ name, width }) => {
      if (name === '' || width === '') {
        newCanSave = false;
      }
    });

    if (newCanSave === false) {
      setCanSave(false);
    } else {
      // save breakpoints
    }
  };

  const onCreateClones = async () => {
    // show loading state
    setLoading(true);

    // let thread catch up
    await utils.sleep(100);

    // let figma side know to create responsive designs
    sendToFigma('create-responsive-designs', {
      page
    });
  };

  const confirmResponsiveReflowCheck = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Responsive reflow Layer',
      create: true,
      page,
      pageType
    });
  };

  const getPrimaryAction = () => {
    if (isLoading) return null;

    // first time seeing this page? show onboarding/breakpoints
    if (showOnboarding) {
      return {
        buttonText: 'Save breakpoints',
        completesStep: false,
        isDisabled: canSave === false,
        onClick: saveBreakpoints
      };
    }

    if (isCompleted) {
      return {
        completesStep: true,
        onClick: confirmResponsiveReflowCheck
      };
    }

    return {
      buttonText: 'Copy design in different viewports',
      completesStep: false,
      onClick: onCreateClones
    };
  };

  return (
    <AnnotationStepPage
      bannerTipProps={{ pageType, routeName }}
      title="Responsive reflow"
      routeName={routeName}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        <HeadingStep number={1} text={firstStepText} />

        {showOnboarding && (
          <div className="container-breakpoints">
            {breakpoints.map(({ id, name, width }, index) => {
              const nameClass = name === '' ? ' warning' : '';
              const widthClass = isNumber(width) === false ? ' warning' : '';

              return (
                <div key={id} className="breakpoint-row flex-row-space-between">
                  <div className="flex-row-center">
                    <div className="flex-row-center mr2">
                      <div className="breakpoint-label">Name:</div>

                      <input
                        className={`input-name${nameClass}`}
                        type="text"
                        onBlur={checkCanSave}
                        onChange={(e) => onBreakpointChange(e, index, 'name')}
                        value={name}
                      />
                    </div>

                    <div className="flex-row-center">
                      <div className="breakpoint-label">
                        <SvgArrowWidth />
                        Width:
                      </div>
                      <input
                        className={`input-width${widthClass}`}
                        type="text"
                        onBlur={checkCanSave}
                        onChange={(e) => onBreakpointChange(e, index, 'width')}
                        value={width}
                      />
                      px
                    </div>
                  </div>

                  <div
                    aria-label="remove breakpoint"
                    className="btn-remove"
                    onClick={() => removeBreakpoint(index)}
                    onKeyDown={(e) => {
                      if (utils.isEnterKey(e.key)) removeBreakpoint(index);
                    }}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="remove-dash" />
                  </div>
                </div>
              );
            })}

            <div className="divider" />

            <div
              className="add-breakpoint-row flex-row-center"
              onClick={addBreakpoint}
              onKeyDown={({ key }) => {
                if (utils.isEnterKey(key)) addBreakpoint();
              }}
              role="button"
              tabIndex="0"
            >
              <SvgPlus />
              Add breakpoint
            </div>

            <div className="divider" />
          </div>
        )}

        {isCompleted && (
          <HeadingStep
            number={2}
            text="Adjust the layouts to ensure that there is no horizontal scrolling when the page is viewed on smaller devices."
          />
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default ResponsiveReflow;
