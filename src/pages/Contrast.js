import * as React from 'react';
import { contrast, utils } from '@/constants';

// components
import {
  Alert,
  AnnotationStepPage,
  BannerSuccess,
  ContrastScreenshot,
  HeadingStep,
  LoadingSpinner
} from '@/components';

// icons
import { SvgCarrot, SvgText, SvgWarning } from '@/icons';

// app state
import Context from '@/context';

function Contrast() {
  // main app state
  const cnxt = React.useContext(Context);
  const { contrastResults, page, pageType, stepsCompleted } = cnxt;
  const { sendToFigma, updateState, zoomTo } = cnxt;

  // local state
  const routeName = 'Contrast';
  const isCompleted = stepsCompleted.includes(routeName);
  const [isLoading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(null);
  const [failedBold, setFailedBold] = React.useState(null);
  const [failedReg, setFailedReg] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // display
  const didPass = failed === null && contrastResults !== null;
  const showRescan = isCompleted || contrastResults !== null;
  const arrowClass = showPreview ? '' : 'rotate-270';
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
      const failedBoldArray = [];
      const failedRegArray = [];

      result.textNodeInfos.map((textInfo) => {
        const contrastReport = contrast.computeTypeContrast(
          textInfo,
          bgImageData
        );

        // only if fail
        if (contrastReport.aa.status === 'fail') {
          const newObj = {
            name: textInfo.name,
            nodeId: textInfo.nodeId,
            value: textInfo.value,
            ...contrastReport.aa
          };

          if (textInfo.textStyleSamples.length > 0) {
            const { isBold } = textInfo.textStyleSamples[0];

            if (isBold) {
              failedBoldArray.push(newObj);
            } else {
              failedRegArray.push(newObj);
            }
          }

          failedArray.push(newObj);
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

      updateState('contrastResults', withHotspots);

      setFailed(failedArray.length === 0 ? null : failedArray);
      setFailedBold(failedBoldArray.length === 0 ? null : failedBoldArray);
      setFailedReg(failedRegArray.length === 0 ? null : failedRegArray);

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
      const failedBoldArray = [];
      const failedRegArray = [];

      contrastResults.hotspots.map((hotspot) => {
        // only if fail
        if (hotspot.aa.status === 'fail') {
          const newObj = {
            name: hotspot.name,
            nodeId: hotspot.nodeId,
            ...hotspot.aa
          };

          if (hotspot.textStyleSamples.length > 0) {
            const { isBold } = hotspot.textStyleSamples[0];

            if (isBold) {
              failedBoldArray.push(newObj);
            } else {
              failedRegArray.push(newObj);
            }
          }

          failedArray.push(newObj);
        }

        return null;
      });

      if (failedArray.length > 0) setFailed(failedArray);
      if (failedBoldArray.length > 0) setFailedBold(failedBoldArray);
      if (failedRegArray.length > 0) setFailedReg(failedRegArray);
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
          text="Check if there are any color contrast issues with text"
        />

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
            <Alert
              icon={<SvgWarning />}
              style={{ padding: 0 }}
              text={`${failed.length} contrast issue${
                failed.length === 1 ? '' : 's'
              } found`}
              type="warning"
            />

            <div className="spacer3" />

            <HeadingStep
              number={2}
              text="Fix large/bold text contrast issues (3:1 requirement)"
            />

            {failedBold === null && (
              <BannerSuccess text="All large/bold text passes AA contrast ratio requirement." />
            )}

            {failedBold !== null &&
              failedBold.map(({ name, value, nodeId }) => (
                <div
                  key={nodeId}
                  className="contrast-row mb2"
                  onClick={() => onClick(nodeId)}
                  onKeyDown={({ key }) => {
                    if (utils.isEnterKey(key)) onClick(nodeId);
                  }}
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

            <HeadingStep
              number={3}
              text="Fix small/regular text contrast issues (4.5:1 requirement)"
            />

            {failedReg === null && (
              <BannerSuccess text="All small/regular text passes AA contrast ratio requirement." />
            )}

            {failedReg !== null &&
              failedReg.map(({ name, value, nodeId }) => (
                <div
                  key={nodeId}
                  className="contrast-row mb2"
                  onClick={() => onClick(nodeId)}
                  onKeyDown={({ key }) => {
                    if (utils.isEnterKey(key)) onClick(nodeId);
                  }}
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
              onKeyDown={({ key }) => {
                if (utils.isEnterKey(key)) togglePreview();
              }}
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

            <div className="spacer4" />
          </React.Fragment>
        )}

        {didPass && (
          <BannerSuccess
            text="All text passes AA contrast ratio requirement. Be sure to validate
              non-text contrast for interactive elements and meaningful
              graphics."
          />
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default Contrast;
