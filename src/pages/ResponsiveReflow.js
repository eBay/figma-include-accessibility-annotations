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
  const { page, pageType, sendToFigma, stepsCompleted, updateState } = cnxt;

  // local state
  const routeName = 'Responsive reflow';
  const isCompleted = stepsCompleted.includes(routeName);
  const [breakpoints, setBreakpoints] = React.useState(responsiveBreakpoints);
  const [canSave, setCanSave] = React.useState(true);
  const [reflowCreated, setReflowCreated] = React.useState(false);

  // ui state
  const showOnboarding =
    newFeaturesIntro.includes('responsive-reflow-breakpoints') === false;
  const firstStepText = showOnboarding
    ? 'Check the widths of representative screens for each responsive breakpoint. We will keep these breakpoint(s) in "Settings" on your dashboard if you want to change it in the future.'
    : 'Mock up a variety of viewport sizes to show how the content reflows.';

  // check if empty or contains anything but numbers
  const isNumber = (value) => {
    if (value === '') return false;

    return !isNaN(value);
  };

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
    let newCanSave = breakpoints.length > 0;

    // sanitize data and check if we can save
    breakpoints.forEach(({ name, width }) => {
      if (name === '' || width === '') {
        newCanSave = false;
      }
    });

    setCanSave(newCanSave);
  };

  const sanitizeBreakpoints = () => {
    const newBreakpoints = [...breakpoints];

    // sanitize data and check if we can save
    breakpoints.forEach(({ width }, index) => {
      // check if width is a number
      if (isNumber(width) === false || width < 320) {
        newBreakpoints[index].width = 320;
      } else if (width > 3000) {
        newBreakpoints[index].width = 3000;
      }
    });

    // sort breakpoints by width
    newBreakpoints.sort((a, b) => a.width - b.width);

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
  };

  const removeBreakpoint = (index) => {
    const newBreakpoints = [...breakpoints];

    // remove breakpoint
    newBreakpoints.splice(index, 1);

    // re-index ids
    newBreakpoints.forEach((item, i) => {
      newBreakpoints[i].id = i.toString();
    });

    setBreakpoints(newBreakpoints);
  };

  const saveBreakpoints = () => {
    let newCanSave = true;

    // double check we have valid data
    breakpoints.forEach(({ name, width }) => {
      if (name === '' || width === '') {
        newCanSave = false;
      }
    });

    // if we can't save, show warning
    if (newCanSave === false) {
      setCanSave(false);
    } else {
      // save breakpoints
      sendToFigma('save-breakpoints', {
        breakpoints
      });

      // user has now seen the new features intro for responsive design
      sendToFigma('experience-seen', { view: 'responsive-reflow-breakpoints' });

      // update local state for this new feature that has been seen
      const featuresUpdated = [...newFeaturesIntro];
      featuresUpdated.push('responsive-reflow-breakpoints');

      // update main app state
      updateState('newFeaturesIntro', featuresUpdated);
      updateState('responsiveBreakpoints', breakpoints);
    }
  };

  const onCreateDesigns = async () => {
    // let thread catch up
    await utils.sleep(100);

    // let figma side know to create responsive designs
    sendToFigma('create-responsive-designs', {
      page,
      breakpoints
    });

    setReflowCreated(true);
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

  React.useEffect(() => {
    // mount
    checkCanSave();

    return () => {
      // unmount
    };
  }, [breakpoints]);

  // break this out so it updates
  const primaryAction =
    isCompleted || reflowCreated
      ? {
          buttonText: 'Responsive reflow documented',
          completesStep: true,
          onClick: confirmResponsiveReflowCheck
        }
      : {
          buttonText: 'Copy design in different viewports',
          completesStep: false,
          onClick: onCreateDesigns
        };

  return (
    <AnnotationStepPage
      bannerTipProps={{ pageType, routeName }}
      title="Responsive reflow"
      routeName={routeName}
      footerProps={{
        primaryAction: showOnboarding
          ? {
              buttonText: 'Save breakpoints',
              completesStep: false,
              isDisabled: canSave === false,
              onClick: saveBreakpoints
            }
          : primaryAction,
        secondaryAction:
          isCompleted || reflowCreated
            ? {
                buttonText: 'Copy again',
                skipsStep: false,
                onClick: onCreateDesigns
              }
            : null
      }}
    >
      <React.Fragment>
        <HeadingStep number={1} text={firstStepText} />

        {showOnboarding && (
          <div className="container-breakpoints">
            {breakpoints.map(({ id, name, width }, index) => {
              const key = `breakpoint-${id}-${index}`;
              const nameClass = name === '' ? ' warning' : '';
              const widthClass = isNumber(width) === false ? ' warning' : '';

              return (
                <div
                  key={key}
                  className="breakpoint-row flex-row-space-between"
                >
                  <div className="flex-row-center">
                    <div className="flex-row-center mr2">
                      <div className="breakpoint-label">Name:</div>

                      <input
                        className={`input-name${nameClass}`}
                        type="text"
                        onBlur={sanitizeBreakpoints}
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
                        onBlur={sanitizeBreakpoints}
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
          </div>
        )}

        {(isCompleted || reflowCreated) && (
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
