import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getPluginMessage, getPluginResizeMessage, utils } from '@/constants';

// data
import responsiveDefaultBreakpoints from '@/data/responsive-reflow-default-breakpoints.json';
import routes from '@/data/routes.json';
import routesNative from '@/data/routes-native.json';

// context
import Context from './index';

const sendToFigma = (type, data = null) => {
  parent.postMessage({ pluginMessage: { type, ...data } }, '*');
};

const removeNodes = (nodeIdsArray) => {
  sendToFigma('remove-nodes', { nodeIds: nodeIdsArray });
};

const zoomTo = (nodeIdsArray, selectNodes = false) => {
  sendToFigma('zoom-to', { nodeIds: nodeIdsArray, selectNodes });
};

function AppState({ children }) {
  const stepsArray = Object.keys(routes);
  const stepsNativeArray = Object.keys(routesNative);

  const [state, setState] = useState({
    // global ui
    alertMsg: null,
    condensedUI: false,
    isDevMode: false,
    isLoading: true,
    leftNavVisible: true,
    tipExpanded: true,

    // page changes
    hasDashboard: false,
    showDashboard: false,
    showPageChange: false,
    showSettings: false,

    // global accessibility data
    pages: [],
    otherPages: [],
    page: null,
    pageSelected: null,
    pageType: null,
    steps: stepsArray,
    stepsNative: stepsNativeArray,
    stepsCompleted: [],
    stepsData: {},

    // landmarks
    landmarks: {},

    // headings
    headings: {},
    headingTemp: null,

    // focus orders
    focusOrders: {},

    // alt text
    noImages: false,
    imagesData: [],
    imagesScanned: [],

    // contrast
    contrastResults: null,

    // focus grouping
    groups: [],

    // complex gestures
    gestures: {},

    // touch targets
    touchTargets: {},

    // color blindness
    colorBlindnessView: false,

    // responsive reflow
    responsiveBreakpoints: responsiveDefaultBreakpoints,

    // user data
    currentUser: null,
    newFeaturesIntro: [],
    sessionId: 0
  });

  const updateState = useCallback((key, value) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }, []);

  const messageFromFigma = useCallback(
    async (event) => {
      const pluginMessage = getPluginMessage(event, {
        isDevMode: state.isDevMode
      });
      if (!pluginMessage) return;

      const { data, type } = pluginMessage;

      switch (type) {
        // loading/scanning for a11y progress on current Figma document
        case 'loading-complete':
          // boost the wait time a bit
          await utils.sleep(200);

          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            pages: data.pages,
            otherPages: data.otherPages || [],
            hasDashboard:
              data.hasProgress || (data.otherPages || []).length > 0,
            showDashboard:
              data.hasProgress || (data.otherPages || []).length > 0,
            currentUser: data.currentUser,
            sessionId: data.sessionId
          }));

          await utils.sleep(200);

          // do we need to update old annotation key layers
          // (not possible in Dev Mode, the document is read-only)
          if (data.newKeyV2.length > 0 && state.isDevMode === false) {
            sendToFigma('update-annotation-key-v2', {
              layers: data.newKeyV2,
              pages: data.pages
            });
          }
          break;

        case 'load-user-preferences':
          const { breakpoints, newFeaturesIntro } = data;
          const { figmaDevMode, prefCondensedUI, prefTipExpanded } = data;

          // if custom breakpoints are set, use those
          const newBreakpoints = breakpoints || responsiveDefaultBreakpoints;

          setState((prevState) => ({
            ...prevState,
            responsiveBreakpoints: newBreakpoints,
            condensedUI: prefCondensedUI,
            isDevMode: figmaDevMode,
            leftNavVisible: !prefCondensedUI,
            newFeaturesIntro,
            tipExpanded: prefTipExpanded,
            // exclude the color blindness step from the dev mode flow
            ...(figmaDevMode && {
              steps: prevState.steps.filter(
                (step) => step !== 'Color blindness'
              ),
              stepsNative: prevState.stepsNative.filter(
                (step) => step !== 'Color blindness'
              )
            })
          }));

          // resize plugin onload if user pref is set
          if (prefCondensedUI) {
            sendToFigma('resize-plugin', getPluginResizeMessage(true));
          }
          break;

        // pre-load base64 images
        case 'base64-response':
          setState((prevState) => ({
            ...prevState,
            imagesScanned: data.newImagesScanned
          }));
          break;

        // show alert
        case 'alert-page-change':
          setState((prevState) => ({
            ...prevState,
            showPageChange: data.showAlert
          }));
          break;

        // user selected the start frame
        case 'start-frame':
          setState((prevState) => ({
            ...prevState,
            alertMsg: data?.msg || null,
            pageSelected: data?.msg ? null : data
          }));
          break;

        case 'initialize-pages-data':
          setState((prevState) => {
            const updatedPages = [
              ...prevState.pages,
              {
                ...data.main,
                stepsCompleted: [],
                stepsData: {},
                imagesScanned: [],
                type: prevState.pageType
              }
            ];

            return {
              ...prevState,
              hasDashboard: updatedPages.length > 0,
              pages: updatedPages
            };
          });
          break;

        // update pages data
        case 'update-pages-data':
          setState((prevState) => {
            const { stepsData, pages } = prevState;
            const { main, status, stepKey } = data;
            const updatedPages = [...pages];
            const updatedStepsData = { ...stepsData };
            const pageIndex = updatedPages.findIndex((p) => p.id === main.id);

            if (pageIndex > -1) {
              const updatedPage = { ...updatedPages[pageIndex] };

              if (status === 'add') {
                if (!updatedPage.stepsCompleted.includes(stepKey)) {
                  updatedPage.stepsCompleted.push(stepKey);
                  updatedPage.stepsData[stepKey] = {
                    ...data[stepKey],
                    stateKey: stepKey.toLowerCase(),
                    visible: true
                  };
                }

                // edge casing for focus order
                if (stepKey === 'Focus order') {
                  updatedPage.stepsCompleted.push('Reading order');
                  updatedPage.stepsData[stepKey] = {
                    ...data[stepKey],
                    stateKey: stepKey.toLowerCase(),
                    visible: true
                  };
                }

                updatedStepsData[stepKey] = {
                  id: data[stepKey].id,
                  stateKey: stepKey.toLowerCase(),
                  visible: true
                };
              }

              updatedPages[pageIndex] = updatedPage;
            }

            return {
              ...prevState,
              pages: updatedPages,
              stepsData: updatedStepsData
            };
          });
          break;

        // landmark confirmed (landmarks)
        case 'landmark-confirmed':
          setState((prevState) => ({
            ...prevState,
            landmarks: {
              ...prevState.landmarks,
              [data.id]: {
                id: data.id,
                label: null,
                name: data.name,
                type: data.landmarkType
              }
            }
          }));
          break;

        // focus order added (reading & focus order)
        case 'focus-order-added':
          const { id: focusOrdeId, focusOrderType, number } = data;

          const newFocusOrder = {
            id: focusOrdeId,
            number,
            type: focusOrderType
          };

          setState((prevState) => ({
            ...prevState,
            focusOrders: {
              ...prevState.focusOrders,
              [focusOrdeId]: newFocusOrder
            }
          }));
          break;

        // gesture confirmed (complex gestures)
        case 'gesture-confirmed':
          setState((prevState) => ({
            ...prevState,
            gestures: {
              ...prevState.gestures,
              [data.id]: {
                id: data.id,
                label: null,
                name: data.name,
                type: data.gestureType
              }
            }
          }));
          break;

        // touch target confirmed (touch targets)
        case 'touch-target-confirmed':
          setState((prevState) => ({
            ...prevState,
            touchTargets: {
              ...prevState.touchTargets,
              [data.id]: {
                id: data.id,
                name: data.name
              }
            }
          }));
          break;

        // images found from scan (alt text)
        case 'images-found':
          setState((prevState) => ({
            ...prevState,
            imagesScanned: data.images
          }));
          break;

        // listening for headings selected
        case 'headings-selected':
          setState((prevState) => ({
            ...prevState,
            headingTemp: data.selected[0]
          }));
          break;

        // no need for these yet, but a msg hook is here
        case 'selection-change':
        case 'touch-targets-checked':
          // console.log('msg type fired but not used yet');
          break;

        // handle any new messages we've yet to setup
        default:
          // eslint-disable-next-line
          console.warn(`unknown type "${type}" message from Figma`);
          break;
      }
    },
    [state.isDevMode]
  );

  const imageScan = useCallback(() => {
    const { page, pageType } = state;

    if (page) {
      // let figma side know, image scan on nodeID
      sendToFigma('image-scan', { id: page.id, page, pageType });
    }
  }, [state]);

  useEffect(() => {
    window.addEventListener('message', messageFromFigma);

    return () => {
      window.removeEventListener('message', messageFromFigma);
    };
  }, [messageFromFigma]);

  return (
    <Context.Provider
      value={{
        ...state,
        imageScan,
        removeNodes,
        sendToFigma,
        updateState,
        zoomTo,
        isProd: process.env.ISPROD,
        version: process.env.VERSION
      }}
    >
      {children}
    </Context.Provider>
  );
}

AppState.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export default AppState;
