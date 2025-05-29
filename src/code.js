import { utils } from '@/constants';
import {
  config,
  designerChecks,
  onloadPlugin,
  onSelectionChange,
  step,
  initializePage
} from '@/figma-code';

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

// selection for alt text listener
let listenForAltText = false;

// clear console every time plugin opens
// eslint-disable-next-line no-console
console.clear();

/* *****************************************************************************
 * run once on Figma load
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
  onSelectionChange(
    pageSelected,
    listenForHeadings,
    defaultHeadingType,
    listenForAltText
  );
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

  // update to v2 annotation key layer
  if (type === 'update-annotation-key-v2') {
    designerChecks.updateToAnnotationKeyV2(msg);
  }

  // no landmarks checked
  if (type === 'no-landmark') {
    step.landmarks.noLandmarks(msg);
  }

  // add landmark to frame
  if (type === 'add-landmark') {
    step.landmarks.add(msg);
  }

  // update landmark type
  if (type === 'update-landmark-type') {
    step.landmarks.updateType(msg);
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
      await step.headings.listener(msg);

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

  // add focus order
  if (type === 'add-focus-order') {
    step.readingOrder.addFocusOrder(msg);
  }

  // remove focus order
  if (type === 'remove-focus-order') {
    step.readingOrder.removeFocusOrder(msg);
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

  // set listening flag for alt text
  if (type === 'alt-text-listening-flag') {
    const { listen } = msg;

    listenForAltText = listen;
  }

  // add image manually (alt text)
  if (type === 'add-image-manually') {
    step.altText.addImageManually(msg);
  }

  // get base64 of image hash
  if (type === 'get-base64') {
    const { imagesManual, imagesScanned, page } = msg;

    const newImages = await utils.getBase64FromHash(
      imagesScanned,
      imagesManual,
      page
    );

    // combine new images (manual and scanned)
    const combinedImages = [...newImages.scanned, ...newImages.manual];

    figma.ui.postMessage({
      type: 'base64-response',
      data: {
        newImagesScanned: combinedImages
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

  // remove a focus group
  if (type === 'remove-focus-group') {
    step.focusGrouping.remove(msg);
  }

  // add touch target
  if (type === 'add-touch-target') {
    step.touchTarget.add(msg);
  }

  // check touch targets are valid
  if (type === 'check-touch-targets') {
    step.touchTarget.checkTouchTargets(msg);
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

  // responsive reflow (save breakpoints)
  if (type === 'save-breakpoints') {
    step.responsiveReflow.saveBreakpoints(msg);
  }

  // remove node(s) by array of IDs
  if (type === 'remove-nodes') {
    const { nodeIds } = msg;

    // loop through node IDs, and remove from Figma document
    await Promise.all(
      nodeIds.map(async (nodeId) => {
        const nodeToRemove = await figma.getNodeByIdAsync(nodeId);

        // prevent memory leak (if not found, can't be removed)
        if (nodeToRemove !== null) {
          // get layer name
          const layerName = utils.nameBeforePipe(nodeToRemove.name);

          // get current page user is on when opening plugin
          const { currentPage } = figma;
          const { children } = currentPage;

          await Promise.all(
            children.map(async ({ id, name }) => {
              // check if Text Zoom or Responsive reflow layers exists
              if (
                name === `${layerName} Text Zoom` ||
                name.startsWith(`${layerName} | Responsive |`)
              ) {
                // get node if still there
                const nodeToDelete = await figma.getNodeByIdAsync(id);

                // prevent memory leak (if not found, can't be deleted)
                if (nodeToDelete !== null) {
                  nodeToDelete.remove();
                }
              }

              return null;
            })
          );

          const parentId = nodeToRemove.parent.id;
          // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
          nodeToRemove.remove();

          // get parent node if still exists
          const parentNode = await figma.getNodeByIdAsync(parentId);

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
      })
    );

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
    const zoomNodes = await Promise.all(
      nodeIds.map((nodeId) => figma.getNodeByIdAsync(nodeId))
    );

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
    await Promise.all(
      nodeIds.map(async (nodeId) => {
        const nodeFound = await figma.getNodeByIdAsync(nodeId);

        // prevent memory leak (if not found, do nothing)
        if (nodeFound !== null) {
          // if hard value passed (visible), use that, else toggle visible state
          const changeVisibleTo =
            visible !== null ? visible : !nodeFound.visible;
          nodeFound.visible = changeVisibleTo;
          nodeFound.expanded = false;
        }

        return null;
      })
    );
  }

  // set tip expanded preference
  if (type === 'set-tip-preference') {
    const { expanded } = msg;

    // set user preference for tip expanded
    const { setAsync } = figma.clientStorage;
    await setAsync('prefTipExpanded', expanded);
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

  // set user preference for new feature(s) info seen
  // session update
  if (type === 'experience-seen') {
    const { view } = msg;
    const { getAsync, setAsync } = figma.clientStorage;

    // first get any previous data of features seen
    const prefNewFeaturesInfo = await getAsync('prefNewFeaturesInfo');
    const newFeaturesIntro =
      prefNewFeaturesInfo === undefined ? [] : JSON.parse(prefNewFeaturesInfo);

    // make sure it's not already accounted for
    if (newFeaturesIntro.includes(view) === false) {
      // add view to array
      newFeaturesIntro.push(view);
    }

    // update features seen
    await setAsync('prefNewFeaturesInfo', JSON.stringify(newFeaturesIntro));
  }

  // reset local storage
  // ///////////////////////////////////////////////////////////////////////////
  if (type === 'reset-local-storage') {
    // https://www.figma.com/plugin-docs/api/figma-clientStorage
    const { deleteAsync, keysAsync } = figma.clientStorage;

    const keysStored = await keysAsync();
    await Promise.all(
      keysStored.map(async (key) => {
        await deleteAsync(key);
      })
    );

    const notifyMsg =
      keysStored.length > 0
        ? 'Local storage cleared'
        : 'Nothing in local storage';

    figma.notify(notifyMsg, {
      timeout: config.notifyTime
    });
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
