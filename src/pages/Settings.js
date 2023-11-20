import * as React from 'react';
import { utils } from '../constants';

// components
import { Footer } from '../components';

// icons
import { SvgArrowWidth, SvgPlus } from '../icons';

// app state
import Context from '../context';

function Settings() {
  // main app state
  const cnxt = React.useContext(Context);
  const { responsiveBreakpoints } = cnxt;
  const { sendToFigma, updateState } = cnxt;

  // local state
  const [breakpoints, setBreakpoints] = React.useState(responsiveBreakpoints);
  const [canSave, setCanSave] = React.useState(true);

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

      // update main app state
      updateState('responsiveBreakpoints', breakpoints);

      // back to dashboard
      updateState('showSettings', false);
    }
  };

  React.useEffect(() => {
    // mount
    checkCanSave();

    return () => {
      // unmount
    };
  }, [breakpoints]);

  return (
    <div className="settings">
      <h1>Settings</h1>

      <div className="spacer4" />

      <h2>Responsive breakpoints</h2>

      <div className="spacer2" />

      <div className="container-breakpoints">
        {breakpoints.map(({ id, name, width }, index) => {
          const key = `breakpoint-${id}-${index}`;
          const nameClass = name === '' ? ' warning' : '';
          const widthClass = isNumber(width) === false ? ' warning' : '';

          return (
            <div key={key} className="breakpoint-row flex-row-space-between">
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

      <Footer
        routeName="settings"
        primaryAction={{
          buttonText: 'Save',
          completesStep: false,
          isDisabled: canSave === false,
          onClick: saveBreakpoints
        }}
      />
    </div>
  );
}

export default Settings;
