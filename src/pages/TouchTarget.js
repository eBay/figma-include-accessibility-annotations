import * as React from 'react';
import propTypes from 'prop-types';
import { getPluginMessage, utils } from '@/constants';

// components
import {
  Alert,
  AnnotationStepPage,
  BannerSuccess,
  DevStepIncomplete,
  EmptyStepSelection,
  HeadingStep
} from '@/components';

// icons
import { SvgWarning } from '@/icons';

// icons: touch target
import SvgTouchTarget from '@/icons/touch-target';

// app state
import Context from '@/context';

function TouchTarget() {
  // main app state
  const cnxt = React.useContext(Context);
  const { isDevMode, page, pageType, stepsCompleted, sendToFigma } = cnxt;
  const { touchTargets, updateState, zoomTo } = cnxt;

  // ui state
  const targetsArray = Object.keys(touchTargets);

  // state defaults
  const routeName = 'Touch target';
  const isCompleted = stepsCompleted.includes(routeName);
  const numTargets = targetsArray.length;
  const defaultNoTargets = isCompleted && numTargets === 0;

  // local state
  const [hasCheckedTouchTargets, setHasCheckedTouchTargets] =
    React.useState(false);
  const [errors, setErrorsFound] = React.useState([]);
  const [hasSelectedNoTargets, setHasSelectedNoTargets] =
    React.useState(defaultNoTargets);

  const onEmptySelected = () => {
    setHasSelectedNoTargets(!hasSelectedNoTargets);
  };

  const onAddTouchTarget = () => {
    const { bounds, id } = page;

    // re-start checker
    setHasCheckedTouchTargets(false);
    setHasSelectedNoTargets(false);

    // scroll to bottom of main
    utils.scrollToBottomOfAnnotationStep();

    sendToFigma('add-touch-target', {
      bounds,
      page,
      pageId: id,
      pageType
    });
  };

  const checkTouchTargets = () => {
    // check for overlapping or min size of touch target
    sendToFigma('check-touch-targets', {
      page,
      pageId: page.id,
      pageType,
      touchTargets
    });
  };

  const confirmTouchTargetCheck = () => {
    sendToFigma('add-checkmark-layer', {
      layerName: 'Touch target Layer',
      create: true,
      page,
      pageType,
      stateKey: 'touchTargets',
      existingData: touchTargets
    });
  };

  const onMessageListen = async (event) => {
    const pluginMessage = getPluginMessage(event, { isDevMode });
    if (!pluginMessage) return;

    const { data, type } = pluginMessage;

    // only listen for this response type on this step
    if (type === 'touch-targets-checked') {
      const { issues, targets } = data;
      const targetObj = {};
      targets.forEach((target) => {
        targetObj[target.id] = target;
      });

      updateState('touchTargets', targetObj);

      if (targets.length === 0) {
        setHasCheckedTouchTargets(false);
      } else {
        setErrorsFound(issues);
        setHasCheckedTouchTargets(true);
        utils.scrollToBottomOfAnnotationStep();
      }
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

  const checkText =
    errors.length > 0 && hasCheckedTouchTargets ? 'Re-check' : 'Check';

  const getPrimaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: pageType === 'web' ? 'Next' : 'Done',
        completesStep: true,
        onClick: () => null
      };
    }

    if (!numTargets && !hasSelectedNoTargets) return null;
    if (numTargets && (errors.length > 0 || !hasCheckedTouchTargets)) {
      return {
        completesStep: false,
        onClick: checkTouchTargets,
        buttonText: `${checkText} touch targets`
      };
    }
    return {
      completesStep: true,
      onClick: confirmTouchTargetCheck,
      buttonText: 'Save and continue'
    };
  };

  const getSecondaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: 'Prev',
        onClick: () => null,
        isPrev: true
      };
    }

    if (!numTargets || (numTargets && !hasCheckedTouchTargets)) return null;
    if (errors.length > 0) {
      return {
        buttonText: 'Mark as fixed',
        completesStep: true,
        onClick: confirmTouchTargetCheck
      };
    }
    return {
      completesStep: false,
      onClick: checkTouchTargets,
      buttonText: `Re-check touch targets`
    };
  };

  return (
    <AnnotationStepPage
      title="Touch target checks"
      completed={isCompleted}
      bannerTipProps={{ pageType, routeName }}
      routeName={routeName}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        {isDevMode === false && (
          <React.Fragment>
            <HeadingStep
              number={1}
              text={`<p style="display: inline">Place annotations for targets. <span style="font-style: italic;">Include</span> will flag where these overlap or have insufficient spacing.</p>`}
            />

            {!numTargets && (
              <EmptyStepSelection
                id="all-touch-targets-clear"
                isSelected={hasSelectedNoTargets}
                onClick={onEmptySelected}
                text="No targets to check"
              />
            )}

            {hasSelectedNoTargets === false && (
              <div className="button-group" role="radiogroup">
                <div key="Add target" className="container-selection-button">
                  <div
                    aria-label="add touch target"
                    className="selection-button"
                    onClick={onAddTouchTarget}
                    onKeyDown={(e) => {
                      if (utils.isEnterKey(e.key)) onAddTouchTarget();
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <SvgTouchTarget.SvgCustom />
                    </div>
                  </div>

                  <div className="selection-button-label">add target</div>
                </div>
              </div>
            )}

            {numTargets > 0 && (
              <React.Fragment>
                <div className="spacer1" />
                <HeadingStep number={2} text="Check the touch targets" />
              </React.Fragment>
            )}

            {hasCheckedTouchTargets === true && errors.length === 0 && (
              <BannerSuccess text="All touch targets meet minimum size and spacing requirements" />
            )}

            {errors.length > 0 && (
              <React.Fragment>
                <Alert
                  icon={<SvgWarning />}
                  style={{ padding: 0 }}
                  text="Some of your touch targets are overlapping or do not meet the minimum size or spacing requirements."
                  type="warning"
                />

                <div className="spacer2" />

                {errors.length > 0 && (
                  <>
                    <HeadingStep
                      number={3}
                      text="Increase the size of the target or the spacing from other targets (24px by 24px minimum requirement)"
                    />
                    {errors.map((error) => (
                      <TouchTargetError
                        zoomTo={zoomTo}
                        key={`error-${error.nodeIds.join(',')}`}
                        error={error}
                      />
                    ))}
                  </>
                )}

                <div className="divider" />
              </React.Fragment>
            )}
            <div className="spacer3" />
          </React.Fragment>
        )}

        {isDevMode === true && isCompleted === false && (
          <DevStepIncomplete
            label="touch targets"
            text="The design has not been checked for touch targets. Check with the designer about completing this step."
          />
        )}

        {isDevMode === true && isCompleted && (
          <React.Fragment>
            <HeadingStep text="Implement" />

            {numTargets > 0 && (
              <React.Fragment>
                <p>
                  All touch targets are either defined by visible components or
                  have enough clear space. Ask designer for any clarification to
                  ensure comfortably large targets.
                </p>

                <div className="space-md" />

                {targetsArray.map((key) => {
                  const { id, name } = touchTargets[key];

                  return (
                    <div
                      key={id}
                      aria-label="goto touch target"
                      className="cursor-pointer border-radius-2 row-touch-target-dev flex-row-center"
                      onClick={() => zoomTo([id], true)}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) zoomTo([id], true);
                      }}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="landmark-block" />
                      <div className="space-xsw" />
                      <div className="touch-target-name">{name}</div>
                    </div>
                  );
                })}
              </React.Fragment>
            )}

            {numTargets === 0 && (
              <p>
                Designs were marked as verified manually. Check with the
                designer if you believe any targets are too small or too closely
                positioned.
              </p>
            )}

            <div className="space-md" />
            <div className="divider" />
            <div className="space-md" />

            <HeadingStep text="Test" />
            <ul className="disc">
              <li>Run an automated accessibility test.</li>
            </ul>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

function TouchTargetError({ error, zoomTo }) {
  const Icon =
    error.type === 'overlap'
      ? SvgTouchTarget.SvgOverlap
      : SvgTouchTarget.SvgResize;
  const onClick = () => zoomTo(error.nodeIds, true);

  return (
    <div className="row-line-item flex-row-space-between error-line-item">
      <div
        className="flex-row-center cursor-pointer"
        onClick={onClick}
        onKeyDown={(e) => {
          if (utils.isEnterKey(e.key)) onClick();
        }}
        role="button"
        tabIndex="0"
      >
        <Icon />
        <div className="ml1">{error.label}</div>
      </div>
    </div>
  );
}

TouchTargetError.propTypes = {
  error: propTypes.shape({
    type: propTypes.string.isRequired,
    label: propTypes.string.isRequired,
    nodeIds: propTypes.arrayOf(propTypes.string)
  }).isRequired,
  zoomTo: propTypes.func.isRequired
};

export default TouchTarget;
