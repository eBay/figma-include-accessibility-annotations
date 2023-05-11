import * as React from 'react';

// components
import {
  Alert,
  AnnotationStepPage,
  ContrastScreenshot,
  HeadingStep,
  LoadingSpinner
} from '../components';

// icons
import { SvgCarrot, SvgCheck, SvgText, SvgWarning } from '../icons';

// app state
import Context from '../context';

// helpers
import { contrast, utils } from '../constants';

const Contrast = () => {
  // main app state
  const cnxt = React.useContext(Context);
  const { contrastResults, page, pageType, stepsCompleted } = cnxt;
  const { sendToFigma, updateState, zoomTo } = cnxt;

  // local state
  const routeName = 'Contrast';
  const isCompleted = stepsCompleted.includes(routeName);
  const [isLoading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // display
  const didPass = failed === null && contrastResults !== null;
  const showRescan = isCompleted || contrastResults !== null;
  const arrowClass = showPreview ? 'rotate-180' : '';
  const showText = showPreview ? 'Hide' : 'Show';

  const onClick = (nodeId) => zoomTo([nodeId], true);

  const onColorContrastScan = async () => {
    // reset state if needed
    updateState('contrastResults', null);
    setFailed(null);

    // show loading state
    setLoading(true);

    // let thread catch up
    await utils.sleep(100);

    // let figma side know to start scan
    sendToFigma('color-contrast-scan', {
      page
    });
  };

  const confirmContrastCheck = () => {
    // let figma side know the state of this step
    sendToFigma('add-checkmark-layer', {
      layerName: 'Contrast Layer',
      create: true,
      page,
      pageType
    });
  };

  const onMessageListen = async (event) => {
    const { data, type } = event.data.pluginMessage;

    // only listen for this response type on this step
    if (type === 'color-contrast-result') {
      const { result } = data;
      const { imageWithoutTextLayers, imageWithTextLayers } = result;

      const bgImageData = await contrast.decodeToImageData(
        imageWithoutTextLayers
      );
      const imageUri = contrast.urlForImageBytes(imageWithTextLayers);

      const hotspots = [];
      const failedArray = [];
      result.textNodeInfos.map((textInfo) => {
        const contrastReport = contrast.computeTypeContrast(
          textInfo,
          bgImageData
        );

        // only if fail
        if (contrastReport.aa.status === 'fail') {
          failedArray.push({
            name: textInfo.name,
            nodeId: textInfo.nodeId,
            value: textInfo.value,
            ...contrastReport.aa
          });
        }

        hotspots.push({
          ...textInfo,
          ...contrastReport
        });

        return null;
      });

      const withHotspots = {
        nodeId: result.nodeId,
        name: result.name,
        imageUri,
        hotspots,
        width: result.width,
        height: result.height,
        pageBgColor: result.pageBgColor
      };

      const noErrorsFound = failedArray.length === 0;

      updateState('contrastResults', withHotspots);
      setFailed(noErrorsFound ? null : failedArray);
      setLoading(false);
    }
  };

  const togglePreview = () => {
    // toggle preview state
    setShowPreview(!showPreview);
  };

  React.useEffect(() => {
    // mount
    window.addEventListener('message', onMessageListen);

    // do we have results already?
    if (contrastResults !== null) {
      const failedArray = [];
      contrastResults.hotspots.map((hotspot) => {
        // only if fail
        if (hotspot.aa.status === 'fail') {
          failedArray.push({
            name: hotspot.name,
            nodeId: hotspot.nodeId,
            ...hotspot.aa
          });
        }

        return null;
      });

      if (failedArray.length > 0) setFailed(failedArray);
    }

    return () => {
      // unmount
      window.removeEventListener('message', onMessageListen);
    };
  }, []);

  const getPrimaryAction = () => {
    if (isLoading) return null;

    if (contrastResults !== null && failed === null) {
      return {
        completesStep: true,
        onClick: confirmContrastCheck
      };
    }

    return {
      buttonText:
        failed !== null || showRescan ? 'Re-scan design' : 'Scan contrast',
      completesStep: false,
      onClick: onColorContrastScan
    };
  };

  const getSecondaryAction = () => {
    if (!isLoading && contrastResults !== null) {
      if (failed !== null) {
        return {
          buttonText: 'Mark as fixed',
          completesStep: true,
          onClick: confirmContrastCheck
        };
      }

      return {
        buttonText: 'Re-scan design',
        skipsStep: false,
        onClick: onColorContrastScan
      };
    }

    return null;
  };

  return (
    <AnnotationStepPage
      title="Text color contrast"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        <HeadingStep
          number={1}
          text="Check if there are any color contrast issues"
        />

        {failed !== null && (
          <React.Fragment>
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text={`${failed.length} contrast issue${
                failed.length === 1 ? '' : 's'
              } found`}
              type="warning"
            />

            <div className="spacer3" />
          </React.Fragment>
        )}

        {isLoading && (
          <React.Fragment>
            <div className="spacer4" />

            <div className="w-100 flex-center">
              <LoadingSpinner size={36} />
              <div className="muted font-12 pt1">
                Scanning color contrast...
              </div>
            </div>
          </React.Fragment>
        )}

        {failed !== null && (
          <React.Fragment>
            <HeadingStep number={2} text="Fix the contrast issues found" />

            {failed.map(({ name, value, nodeId }) => (
              <div
                key={nodeId}
                className="contrast-row mb2"
                onClick={() => onClick(nodeId)}
                onKeyPress={() => onClick(nodeId)}
                role="link"
                tabIndex="0"
              >
                <div className="flex-row-center">
                  <div className="svg-theme mr2">
                    <SvgText />
                  </div>

                  <div className="contrast-name">{value || name}</div>
                </div>

                <div className="contrast-goto">Go to</div>
              </div>
            ))}

            <div className="spacer2" />

            <div
              className="flex-row-center border-radius-2 cursor-pointer"
              onClick={togglePreview}
              onKeyPress={togglePreview}
              role="button"
              tabIndex="0"
            >
              <div className={`svg-theme mr1 animated ${arrowClass}`}>
                <SvgCarrot />
              </div>

              <h2>{`${showText} preview`}</h2>
            </div>

            {showPreview && (
              <React.Fragment>
                <div className="spacer2" />

                <ContrastScreenshot report={contrastResults} />
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {didPass && (
          <div className="flex-row align-start">
            <div className="circle-success svg-theme-success mr1">
              <SvgCheck size={14} />
            </div>
            <p>
              All text passes AA contrast ratio requirement. Be sure to validate
              non-text contrast for interactive elements and meaningful
              graphics.
            </p>
          </div>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
};

export default Contrast;
