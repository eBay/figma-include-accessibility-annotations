import * as React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { utils } from '../constants';

// components
import ProgressPieChart from './ProgressPieChart';

// icons
import { SvgCheck, SvgChevronLeft, SvgMobile, SvgWeb } from '../icons';

// app state
import Context from '../context';

// data
import routes from '../data/routes.json';
import routesNative from '../data/routes-native.json';

function NavLeft({ progress }) {
  // main app state
  const cnxt = React.useContext(Context);
  const { colorBlindnessView, leftNavVisible, pageType, stepsCompleted } = cnxt;
  const { sendToFigma, updateState } = cnxt;

  // flow type
  const isWeb = pageType === 'web';
  const routeData = isWeb ? routes : routesNative;
  const Icon = isWeb ? SvgWeb : SvgMobile;

  const toggleLeftNav = () => {
    // resize plugin
    const pluginWidth = leftNavVisible ? 516 : 700;
    sendToFigma('resize-plugin', {
      condensed: leftNavVisible,
      height: 518,
      width: pluginWidth
    });

    // set condense UI
    updateState('condensedUI', leftNavVisible);

    // toggle nav
    updateState('leftNavVisible', !leftNavVisible);
  };

  const rotateClass = leftNavVisible ? 'rotate-right' : 'rotate-left';

  // handle encouragement
  let encouragement = 'Welcome';
  if (typeof progress === 'number') {
    if (progress === 100) {
      encouragement = 'Done!';
    } else if (progress > 80) {
      encouragement = 'Almost done!';
    } else if (progress > 50) {
      encouragement = 'Half-way through';
    } else if (progress > 30) {
      encouragement = 'Doing great!';
    } else if (progress > 10) {
      encouragement = 'Just started';
    }
  }

  return (
    <nav>
      <div className="container-flow-type">
        <div className="svg-theme">
          <Icon />
        </div>
        <div className="flow-text">{pageType}</div>
      </div>

      {colorBlindnessView === false && (
        <div
          className="toggle-nav"
          onClick={toggleLeftNav}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) toggleLeftNav();
          }}
          role="button"
          tabIndex="0"
        >
          <div className={`svg-theme animated ${rotateClass}`}>
            <SvgChevronLeft size={14} />
          </div>
        </div>
      )}

      <ul>
        {Object.keys(routeData).map((routeLabel) => {
          const { label, path, percent } = routeData[routeLabel];
          const isCompleted = stepsCompleted.includes(routeLabel);

          return (
            <li key={routeLabel} className={isCompleted ? 'completed' : null}>
              <NavLink
                to={path}
                // if keyboard user, put focus on main content after navigation
                onClick={() => {
                  const elMain = document.getElementById('main');

                  if (elMain !== null) {
                    elMain.focus();
                  }

                  updateState('colorBlindnessView', false);
                }}
              >
                <div className="left-nav-link">
                  <div className="flex-row-center">
                    <div className="step-marker">
                      <div className="step-inner" />
                      <div className="svg-theme_inverse">
                        <SvgCheck size={14} />
                      </div>
                    </div>
                    <div className="step-label">{label}</div>
                  </div>
                  <div>{`${isCompleted ? percent : 0}%`}</div>
                </div>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="absolute-bottom w-100">
        <div className="container-progress">
          <div className="progress-encourage">{encouragement}</div>
          <ProgressPieChart progress={progress || 0} />
        </div>
      </div>
    </nav>
  );
}

NavLeft.defaultProps = {
  progress: null
};

NavLeft.propTypes = {
  // optional
  progress: PropTypes.number
};

export default React.memo(NavLeft);
