import { utils } from './constants';
import {
  config,
  designerChecks,
  onloadPlugin,
  onSelectionChange,
  step,
  initializePage
} from './figma-code';

/* *****************************************************************************
 * initial setup
 **************************************************************************** */

// https://www.figma.com/plugin-docs/api/properties/figma-showui/
figma.showUI(__html__, { height: 518, width: 700, themeColors: true });

// de-select all layers on plugin open
// turned this off per Anna's request
//
// if no previous data is set,
// and a valid frame is selected when plugin is opened,
// we will show the "Run scan" option
// figma.currentPage.selection = [];

/* *****************************************************************************
 * globals
 **************************************************************************** */

// is in page scan for accessibility mode?
let pageSelected = false;

// will set this when plugin loads (see: figma.once('run'))
let currentPageID = null;

// selection for headings listener
let listenForHeadings = false;
let defaultHeadingType = 2;

// clear console every time plugin opens
// eslint-disable-next-line no-console
console.clear();

/* *****************************************************************************
 * Run once on Figma load
 * this searches current figma page for any a11y layers, previous data created
 * https://www.figma.com/plugin-docs/api/figma/#once
 **************************************************************************** */
figma.once('run', async () => {
  // eslint-disable-next-line no-console
  console.log('plugin has started');

  // preload fonts
  await onloadPlugin.preload();

  // get current page user is on when opening plugin
  const { currentPage } = figma;

  // setting this global for "currentpagechange" listener
  currentPageID = currentPage.id;

  // get any previous scanned data on current figma page
  // if found, populates dashboard on plugin load
  const { newPageSelected } = onloadPlugin.getPreviousScanData(pageSelected);

  // if dashboard data is found, don't listen for new page selection yet
  pageSelected = newPageSelected;

  // load any user preferences
  await onloadPlugin.getUserPreferences();
});

/* *****************************************************************************
 * Listener for Figma layer selection change
 * https://www.figma.com/plugin-docs/api/properties/figma-on/#selectionchange
 **************************************************************************** */
figma.on('selectionchange', () => {
  onSelectionChange(pageSelected, listenForHeadings, defaultHeadingType);
});

/* *****************************************************************************
 * Main listener on Figma scene side
 * https://www.figma.com/plugin-docs/api/figma-ui/#onmessage
 *
 * more on message passing: https://www.figma.com/plugin-docs/how-plugins-run
 **************************************************************************** */
figma.ui.onmessage = async (msg) => {
  const { type } = msg;

  // initialize main accessibility frame for page
  if (type === 'page-initialized') {
    initializePage(msg);
  }

  // page selected flag
  if (type === 'page-selected') {
    const { isSelected } = msg;

    // set global flag
    pageSelected = isSelected;
  }

  if (type === 'steps-completed') {
    designerChecks.createOrUpdateDesignerChecksFrame(msg);
  }

  // no landmarks checked
  if (type === 'no-landmark') {
    step.landmarks.noLandmarks(msg);
  }

  // add landmark to frame
  if (type === 'add-landmark') {
    step.landmarks.add(msg);
  }

  // landmarks completed (annotation placement)
  if (type === 'completed-landmark') {
    step.landmarks.completed(msg);
  }

  // landmark update with label
  if (type === 'update-landmark-label') {
    step.landmarks.updateWithLabel(msg);
  }

  // no headings checked
  if (type === 'no-heading') {
    step.headings.noHeadings(msg);
  }

  // listener for headings selection
  if (type === 'headings-listener') {
    const { newListenForHeadings, newDefaultHeadingType } =
      step.headings.listener(msg);

    // global flag for selection change logic
    // see figma.on('selectionchange')
    listenForHeadings = newListenForHeadings;
    defaultHeadingType = newDefaultHeadingType;
  }

  // headings selected confirmed
  if (type === 'confirm-headings') {
    step.headings.confirm(msg);
  }

  if (type === 'add-heading') {
    step.headings.addHeading(msg);
  }

  if (type === 'remove-heading') {
    step.headings.removeHeading(msg);
  }

  // add reading order arrow
  if (type === 'add-reading-order-arrow') {
    step.readingOrder.addArrow(msg);
  }

  // reading order step confirmed
  if (type === 'confirm-reading-order') {
    step.readingOrder.confirm(msg);
  }

  // image scan
  if (type === 'image-scan') {
    await step.altText.imageScan(msg);
  }

  // add alt text layer
  if (type === 'add-alt-text') {
    step.altText.add(msg);
  }

  // get base64 of image hash
  if (type === 'get-base64') {
    const newImagesScanned = await utils.getBase64FromHash(msg.imagesScanned);

    figma.ui.postMessage({
      type: 'base64-response',
      data: {
        newImagesScanned
      }
    });
  }

  // color contrast scan
  if (type === 'color-contrast-scan') {
    await step.colorContrast.scan(msg);
  }

  // text zoom copy
  if (type === 'text-zoom-clone') {
    step.textZoom.createClone(msg);
  }

  // no gestures checked
  if (type === 'no-gestures') {
    step.complexGestures.noComplexGestures(msg);
  }

  // add gesture rectangle
  if (type === 'add-gesture') {
    step.complexGestures.add(msg);
  }

  // gestures completed (annotation placement)
  if (type === 'completed-gesture') {
    step.complexGestures.completed(msg);
  }

  if (type === 'annotate-complex-gestures') {
    step.complexGestures.annotateComplexGestures(msg);
  }

  // no focus groups checked
  if (type === 'no-groups') {
    step.focusGrouping.noGroups(msg);
  }

  // add a focus group
  if (type === 'add-focus-group') {
    step.focusGrouping.add(msg);
  }

  if (type === 'remove-focus-group') {
    step.focusGrouping.remove(msg);
  }

  // create layer for "checkmark" steps
  if (type === 'add-checkmark-layer') {
    step.checkmark.add(msg);
  }

  // grab design file image and start the viewer
  if (type === 'start-color-blindness-view') {
    step.colorBlindness.getDesignFile(msg);
  }

  // responsive reflow (create designs)
  if (type === 'create-responsive-designs') {
    step.responsiveReflow.createResponsiveDesigns(msg);
  }

  // remove node(s) by array of IDs
  if (type === 'remove-nodes') {
    const { nodeIds } = msg;

    // loop through node IDs, and remove from Figma document
    nodeIds.map((nodeId) => {
      const nodeToRemove = figma.getNodeById(nodeId);

      // prevent memory leak (if not found, can't be removed)
      if (nodeToRemove !== null) {
        // check if Text Zoom layer exists
        const layerName = utils.nameBeforePipe(nodeToRemove.name);

        // get current page user is on when opening plugin
        const { currentPage } = figma;
        const { children } = currentPage;

        children.map(({ id, name }) => {
          if (name === `${layerName} Text Zoom`) {
            // get text zoom node if still exists
            const textZoomNode = figma.getNodeById(id);

            // prevent memory leak (if not found, can't be removed)
            if (textZoomNode !== null) {
              textZoomNode.remove();
            }
          }

          return null;
        });

        const parentId = nodeToRemove.parent.id;
        // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
        nodeToRemove.remove();

        // get parent node if still exists
        const parentNode = figma.getNodeById(parentId);

        // prevent memory leak (if not found, can't be removed)
        if (parentNode !== null) {
          // are old annotations the only thing left?
          if (parentNode.children.length === 1) {
            // annotations clean up
            const childName = parentNode.children[0].name;

            // make sure it's an annotation layer
            if (childName.includes('Annotations')) {
              parentNode.children[0].remove();
            }
          }
        }
      }

      return nodeId;
    });

    const addS = nodeIds.length === 1 ? '' : 's';

    // let the user know layer(s) have been removed
    figma.notify(`Layer${addS} removed successfully!`, {
      timeout: config.notifyTime
    });
  }

  // zoom into view (and select in Figma)
  if (type === 'zoom-to') {
    const { nodeIds, selectNodes } = msg;

    // get nodes by id
    const zoomNodes = nodeIds.map((nodeId) => figma.getNodeById(nodeId));

    // also select them in Figma document?
    if (selectNodes) {
      figma.currentPage.selection = zoomNodes;
    }

    // https://www.figma.com/plugin-docs/api/figma-viewport/#scrollandzoomintoview
    figma.viewport.scrollAndZoomIntoView(zoomNodes);
  }

  // deselect all layers
  if (type === 'deselect-all-layers') {
    figma.currentPage.selection = [];
  }

  // make all step layers visible on current Figma page
  if (type === 'show-all-layers') {
    // make all accessibility layers visible
    utils.showAllLayers(config.a11ySuffix);
  }

  // toggle or set visibility of node
  if (type === 'visible') {
    const { nodeIds, visible = null } = msg;

    // loop through node IDs to show/hide
    nodeIds.map((nodeId) => {
      const nodeFound = figma.getNodeById(nodeId);

      // prevent memory leak (if not found, do nothing)
      if (nodeFound !== null) {
        // if hard value passed (visible), use that, else toggle visible state
        const changeVisibleTo = visible !== null ? visible : !nodeFound.visible;
        nodeFound.visible = changeVisibleTo;
        nodeFound.expanded = false;
      }

      return null;
    });
  }

  // resize plugin
  if (type === 'resize-plugin') {
    const { condensed, height, width } = msg;

    // https://www.figma.com/plugin-docs/api/figma-ui/#resize
    figma.ui.resize(width, height);

    // set user preference for condensed view
    // https://www.figma.com/plugin-docs/api/figma-clientStorage
    const { setAsync } = figma.clientStorage;
    await setAsync('prefCondensedUI', condensed);
  }

  // close plugin
  if (type === 'close-plugin') {
    // https://www.figma.com/plugin-docs/api/figma-ui/#close
    figma.closePlugin();
  }
};

/* *****************************************************************************
 * On figma top-level page change
 * https://www.figma.com/plugin-docs/api/properties/figma-on/#currentpagechange
 **************************************************************************** */
figma.on('currentpagechange', () => {
  // get current page user is now on
  const { currentPage } = figma;

  figma.ui.postMessage({
    type: 'alert-page-change',
    data: {
      showAlert: currentPageID !== currentPage.id
    }
  });
});

/* *****************************************************************************
 * On plugin close
 * https://www.figma.com/plugin-docs/api/properties/figma-on/#close
 **************************************************************************** */
figma.on('close', () => {
  // eslint-disable-next-line no-console
  console.log('plugin has closed');

  // make all accessibility layers visible
  // this is to case for when developers have read-only access,
  // they can still see all the a11y layers
  utils.showAllLayers(config.a11ySuffix);
});
