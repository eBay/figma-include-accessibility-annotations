import React from 'react';
import PropTypes from 'prop-types';
import { utils } from '../constants';

// data
import routes from '../data/routes.json';
import routesNative from '../data/routes-native.json';

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

class AppState extends React.Component {
  constructor() {
    super();

    // get steps array
    const stepsArray = Object.keys(routes);
    const stepsNativeArray = Object.keys(routesNative);

    // default state
    this.state = {
      // global ui
      alertMsg: null,
      condensedUI: false,
      isLoading: true,
      leftNavVisible: true,

      // page changes
      hasDashboard: false,
      showDashboard: false,
      showPageChange: false,

      // global accessibility data
      pages: [],
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

      // color blindness
      colorBlindnessView: false,

      // user data
      currentUser: null,
      sessionId: 0
    };

    this.updateState = this.updateState.bind(this);
    this.messageFromFigma = this.messageFromFigma.bind(this);
    this.imageScan = this.imageScan.bind(this);
  }

  componentDidMount() {
    window.addEventListener('message', this.messageFromFigma);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.messageFromFigma);
  }

  // main listener for all messages from Figma bridge
  // https://www.figma.com/plugin-docs/how-plugins-run/
  async messageFromFigma(event) {
    const { data, type } = event.data.pluginMessage;
    const { pageType, pages } = this.state;

    switch (type) {
      // loading/scanning for a11y progress on current Figma document
      case 'loading-complete':
        // boost the wait time a bit
        await utils.sleep(200);

        this.setState({
          isLoading: false,
          pages: data.pages,
          hasDashboard: data.hasProgress,
          showDashboard: data.hasProgress,
          currentUser: data.currentUser,
          sessionId: data.sessionId
        });
        break;

      case 'load-user-preferences':
        const { prefCondensedUI } = data;

        // resize plugin onload if user pref is set
        if (prefCondensedUI === true) {
          sendToFigma('resize-plugin', {
            condensed: true,
            height: 518,
            width: 516
          });
        }

        this.setState({
          condensedUI: prefCondensedUI,
          leftNavVisible: !prefCondensedUI
        });

        break;

      // pre-load base64 images
      case 'base64-response':
        this.setState({
          imagesScanned: data.newImagesScanned
        });
        break;

      // show alert
      case 'alert-page-change':
        this.setState({
          showPageChange: data.showAlert
        });
        break;

      // user selected the start frame
      case 'start-frame':
        // do we need to tell the user something?
        if (data?.msg) {
          // let user know of selection parameters
          this.setState({
            alertMsg: data.msg,
            pageSelected: null
          });
        } else {
          // set selected page data (for confirmation)
          this.setState({
            alertMsg: null,
            pageSelected: data
          });
        }
        break;

      case 'initialize-pages-data':
        const mainFrame = data.main;

        const dashPages = [...pages];

        dashPages.push({
          ...mainFrame,
          stepsCompleted: [],
          stepsData: {},
          imagesScanned: [],
          type: pageType
        });

        // update main state
        this.setState({
          hasDashboard: dashPages.length > 0,
          pages: dashPages
        });

        break;

      // update pages data
      case 'update-pages-data':
        const { stepsData } = this.state;
        const { main, status, stepKey } = data;

        const newPages = [...pages];
        const newStepsData = { ...stepsData };

        if (status === 'add') {
          const indexFound = pages.findIndex((p) => p.id === main.id);
          const newPage = newPages[indexFound];

          // make sure it's not already present
          if (newPage.stepsCompleted.includes(stepKey) === false) {
            newPage.stepsCompleted.push(stepKey);
            newPage.stepsData[stepKey] = {
              ...data[stepKey],
              stateKey: stepKey.toLowerCase(),
              visible: true
            };
          }
        }

        // check if we have previous steps data
        if (stepKey in newStepsData) {
          // remove old ID reference
          delete newStepsData[stepKey];
        }

        // add steps data
        if (status === 'add') {
          newStepsData[stepKey] = data[stepKey];
        }

        // update main state
        this.setState({
          hasDashboard: newPages.length > 0,
          pages: newPages,
          stepsData: newStepsData
        });

        break;

      // landmark confirmed (landmarks)
      case 'landmark-confirmed':
        const { landmarks } = this.state;

        const { id, landmarkType, name } = data;
        const newEntry = {
          id,
          label: null,
          name,
          type: landmarkType
        };
        const newLandmarksObj = { ...landmarks, [id]: newEntry };

        this.setState({
          landmarks: newLandmarksObj
        });
        break;

      // gesture confirmed (complex gestures)
      case 'gesture-confirmed':
        const { gestures } = this.state;
        const { id: gestureId } = data;

        const newGesture = {
          id: gestureId,
          label: null,
          name: data.name,
          type: data.gestureType
        };

        this.setState({
          gestures: { ...gestures, [gestureId]: newGesture }
        });
        break;

      // images found from scan (alt text)
      case 'images-found':
        this.setState({
          imagesScanned: data.images
        });
        break;

      // listening for headings selected
      case 'headings-selected':
        const { selected } = data;
        this.setState({ headingTemp: selected[0] });
        break;

      // no need for this yet, but a msg hook is here
      case 'selection-change':
        break;

      // handle any new messages we've yet to setup
      default:
        console.warn(`unknown type "${type}" message from Figma`);
        break;
    }
  }

  imageScan() {
    const { page, pageType } = this.state;
    const { id } = page;

    // let figma side know, image scan on nodeID
    sendToFigma('image-scan', { id, page, pageType });
  }

  updateState(key, value) {
    this.setState({
      [key]: value
    });
  }

  render() {
    const { children } = this.props;

    // global ui
    const { alertMsg, condensedUI, isLoading, leftNavVisible } = this.state;

    // page changes
    const { hasDashboard, showDashboard, showPageChange } = this.state;

    // global accessibility data
    const { pages, page, pageSelected, pageType } = this.state;
    const { steps, stepsNative, stepsCompleted, stepsData } = this.state;

    // landmarks
    const { landmarks } = this.state;

    // headings
    const { headings, headingTemp } = this.state;

    // alt text
    const { noImages, imagesData, imagesScanned } = this.state;

    // contrast
    const { contrastResults } = this.state;

    // focus grouping
    const { groups } = this.state;

    // complex gestures
    const { gestures } = this.state;

    // color blindness
    const { colorBlindnessView } = this.state;

    // user data
    const { currentUser, sessionId } = this.state;

    return (
      <Context.Provider
        value={{
          // global ui
          alertMsg,
          condensedUI,
          isLoading,
          leftNavVisible,

          // page changes
          hasDashboard,
          showDashboard,
          showPageChange,

          // global accessibility data
          pages,
          page,
          pageSelected,
          pageType,
          steps,
          stepsNative,
          stepsCompleted,
          stepsData,

          // landmarks
          landmarks,

          // headings
          headings,
          headingTemp,

          // alt text
          noImages,
          imagesData,
          imagesScanned,

          // contrast
          contrastResults,

          // focus grouping
          groups,

          // complex gestures
          gestures,

          // color blindness
          colorBlindnessView,

          // global helpers
          imageScan: this.imageScan,
          removeNodes,
          sendToFigma,
          updateState: this.updateState,
          zoomTo,

          // user data
          currentUser,
          sessionId,

          // environment and project
          isProd: process.env.ISPROD,
          version: process.env.VERSION
        }}
      >
        {children}
      </Context.Provider>
    );
  }
}

AppState.propTypes = {
  // required
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export default AppState;
