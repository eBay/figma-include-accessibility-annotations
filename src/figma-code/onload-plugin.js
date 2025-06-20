import { utils } from '@/constants';
import config from '@/figma-code/config';
import { findDescendentOfFrame } from '@/figma-code/frame-helpers';

export const preload = async () => {
  // async load fonts
  // https://www.figma.com/plugin-docs/api/properties/figma-loadfontasync/
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
};

const isA11yLayer = async (children, childNode, name) => {
  const { children: frameChildren } = childNode;

  const a11yCompletedLayers = [];
  const stepsData = {};

  // alt text images
  const imagesScannedArray = [];
  const imagesManualArray = [];

  // grab layer type (web or native)
  const a11yLayerType = utils.checkTypeOfA11yLayer(childNode.name);

  // grab main page a11y scan was for
  const ifExists = children.filter((child) => child.name === name);

  // page was renamed, don't proceed
  if (ifExists.length === 0) {
    // should the a11y layer be deleted?
    // eslint-disable-next-line no-console
    console.error(`frame "${name}" no longer exists on this page`);
    return null;
  }

  const existingAnnotationsFrame = frameChildren.find(
    (child) =>
      utils.nameBeforePipe(child.name) === config.a11yAnnotationLayerKeyV2
  );

  // old landmarks mapper (legacy)
  const marksLegacy = {
    banner: 'header',
    search: 'search',
    navigation: 'nav',
    main: 'main',
    'content-info': 'footer',
    complimentary: 'aside',
    form: 'form',
    region: 'section'
  };

  // loop through a11y layer steps
  await Promise.all(
    frameChildren.map(async (frameChild) => {
      // get layer without id/metadata
      const layerName = utils.nameBeforePipe(frameChild.name);

      const hasLayer = config.a11yMainLayers.filter((mainLayer) =>
        layerName.startsWith(mainLayer)
      );
      const stepName = layerName.replace(/ Layer/g, '');

      // no layers?
      if (hasLayer.length === 0) {
        if (
          frameChild?.id !== existingAnnotationsFrame?.id &&
          stepName !== 'Annotation overlay'
        ) {
          // eslint-disable-next-line no-console
          console.error(`no steps found in "${stepName}"`);
        }

        return;
      }

      // figure out which layer type it is
      if (config.a11yCheckboxLayers.includes(layerName)) {
        // is "checkbox" layer
        stepsData[stepName] = {
          id: frameChild.id,
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Landmarks') {
        // get landmark nodes and format
        const landmarks = {};
        frameChild.children.map((landmarkObj) => {
          // make sure it's a frame node OR group node (backwards compatibility)
          if (landmarkObj.type === 'FRAME' || landmarkObj.type === 'GROUP') {
            const [nameArray] = landmarkObj.name.split('|');
            const typeName = nameArray.replace('Landmark: ', '');

            // if we have a label, grab it
            const [type, label = null] = typeName.split(':');
            const typeTrim = type.trim();
            const newType =
              typeTrim in marksLegacy ? marksLegacy[typeTrim] : typeTrim;

            landmarks[landmarkObj.id] = {
              id: landmarkObj.id,
              label: label !== null ? label.trim() : label,
              name: landmarkObj.name,
              type: newType
            };
          }

          return null;
        });

        stepsData[stepName] = {
          id: frameChild.id,
          existingData: landmarks,
          stateKey: 'landmarks',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Headings') {
        // get heading nodes and format
        const headings = {};

        await Promise.all(
          frameChild.children.map(async (headingObj) => {
            // make sure it's a group node
            if (headingObj.type === 'GROUP') {
              const [nameArray, title, idRaw] = headingObj.name.split('|');
              const [, typeName = 'h2'] = nameArray.split(':');
              const id = idRaw.trim();
              const type = typeName.trim();

              const nodeHeading = await figma.getNodeByIdAsync(id);

              // make sure previously mapped node, still exists
              // prevent memory leak (if not found, don't add)
              if (nodeHeading !== null) {
                headings[id] = {
                  id,
                  bounds: nodeHeading.absoluteRenderBounds,
                  title,
                  type,
                  value: parseInt(type.replace(/\D+/g, ''), 10)
                };
              }
            }
          })
        );

        stepsData[stepName] = {
          id: frameChild.id,
          existingData: headings,
          stateKey: 'headings',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Focus order') {
        // get focus order nodes and format
        const focusOrders = {};

        await Promise.all(
          frameChild.children.map(async (focusOrderObj) => {
            // make sure it's a frame node
            if (focusOrderObj.type === 'FRAME') {
              const [, typeName] = focusOrderObj.name.split('|');
              const type = typeName.trim();

              // is it a mapped focus order type?
              if (type === 'tabs' || type === 'arrows') {
                const labelGroupLayer = focusOrderObj.findChild(
                  (n) => n.name === 'Label group'
                );
                const lastNumberLayer = labelGroupLayer.findChild(
                  (n) => n.name === 'Number'
                );
                const lastNumber = parseFloat(lastNumberLayer.characters);

                focusOrders[focusOrderObj.id] = {
                  id: focusOrderObj.id,
                  number: lastNumber,
                  type
                };
              }
            }
          })
        );

        const reorderByNumber = (obj) =>
          Object.fromEntries(
            Object.entries(obj).sort((a, b) => a[1].number - b[1].number)
          );

        stepsData[stepName] = {
          id: frameChild.id,
          existingData: reorderByNumber(focusOrders),
          stateKey: 'focusOrders',
          visible: frameChild.visible
        };

        // don't add multiple Reading order steps
        if (a11yCompletedLayers.includes('Reading order') === false) {
          a11yCompletedLayers.push('Reading order');
        }
      } else if (stepName === 'Reading order') {
        // set Reading order as completed if exists
        stepsData[stepName] = {
          id: frameChild.id,
          visible: frameChild.visible
        };

        // don't add multiple Reading order steps
        if (a11yCompletedLayers.includes(stepName) === false) {
          a11yCompletedLayers.push(stepName);
        }
      } else if (stepName === 'Alt text') {
        // get alt text nodes and format
        const altTextArray = [];

        await Promise.all(
          frameChild.children.map(async (altTextObj) => {
            const { name: nodeName, type: nodeType } = altTextObj;

            // make sure it's a frame node and not annotations layer
            if (
              nodeType === 'FRAME' &&
              nodeName.includes('No Images') === false &&
              nodeName.includes('Annotations') === false
            ) {
              const [labelArray, altTextRaw, originalName, idRaw] =
                nodeName.split('|');
              const [, typeName] = labelArray.split(':');
              const altTextString = altTextRaw.trim();
              const id = idRaw.trim();
              const nameString = originalName.trim();
              const type = typeName.trim();

              const nodeAltText = await figma.getNodeByIdAsync(id);

              // make sure previously mapped node, still exists
              if (nodeAltText !== null) {
                // get fills
                const { fills } = nodeAltText;
                let imageFill;

                // groups can not have fills set
                if (fills !== undefined) {
                  // get the first fill that is an image type
                  const fillsFilter = fills.filter(
                    (fill) => fill.type === 'IMAGE'
                  );
                  imageFill =
                    fillsFilter.length > 0 ? fillsFilter[0] : undefined;
                }

                // prevent memory leak (if not found, don't add)
                if (typeof imageFill === 'object') {
                  const { imageHash } = imageFill;

                  imagesScannedArray.push({
                    altText: altTextString,
                    hash: imageHash,
                    bounds: nodeAltText.absoluteRenderBounds,
                    id,
                    name: nameString,
                    displayType: 'scanned'
                  });

                  altTextArray.push({
                    id,
                    altText: altTextString,
                    bounds: nodeAltText.absoluteRenderBounds,
                    name: nameString,
                    type
                  });
                } else {
                  imagesManualArray.push({
                    altText: altTextString,
                    bounds: nodeAltText.absoluteRenderBounds,
                    id,
                    name: nameString,
                    displayType: 'manual'
                  });

                  altTextArray.push({
                    id,
                    altText: altTextString,
                    bounds: nodeAltText.absoluteRenderBounds,
                    name: nameString,
                    type
                  });
                }
              }
            }
          })
        );

        stepsData[stepName] = {
          id: frameChild.id,
          existingData: altTextArray,
          stateKey: 'imagesData',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Focus grouping') {
        // get focus groups nodes and format
        const groups = [];
        for (let l = 0; l < frameChild.children.length; l += 1) {
          const groupObj = frameChild.children[l];
          // make sure it's a group
          if (
            groupObj.name.startsWith('Group Area') &&
            groupObj.type === 'RECTANGLE'
          ) {
            groups.push(groups.length);
          }
        }

        // set Focus grouping as completed if exists
        stepsData[stepName] = {
          id: frameChild.id,
          existingData: groups,
          stateKey: 'groups',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Complex gestures') {
        // get gesture nodes and format
        const gestures = {};
        const gesturesAnnotationFrame = findDescendentOfFrame({
          frame: existingAnnotationsFrame,
          descendantNames: ['Complex gestures line']
        });

        for (let l = 0; l < frameChild.children.length; l += 1) {
          const gestureObj = frameChild.children[l];

          if (
            (gestureObj.type === 'GROUP' || gestureObj.type === 'FRAME') &&
            gestureObj.name.includes('Annotations') === false
          ) {
            // make sure it's a group node
            const [nameArray, id] = gestureObj.name.split('|');
            const typeName = nameArray.replace('Gesture: ', '');

            let label = null;

            // if we have an existing label, grab it from annotations frame
            if (gesturesAnnotationFrame) {
              // find annotation block for the id, if it exists
              const gestureAnnotationBlock =
                gesturesAnnotationFrame.children.find(
                  (annotationChild) => annotationChild.name.split('|')[1] === id
                );

              // get the label node if it exists
              const labelNode = findDescendentOfFrame({
                frame: gestureAnnotationBlock,
                descendantNames: [
                  'Gesture info',
                  'Gesture action',
                  'Gesture action value'
                ]
              });

              if (labelNode) {
                label = labelNode.characters;
              }
            }

            gestures[gestureObj.id] = {
              id: gestureObj.id,
              label: label !== null ? label.trim() : label,
              name: gestureObj.name,
              type: typeName.trim()
            };
          }
        }
        stepsData[stepName] = {
          id: frameChild.id,
          existingData: gestures,
          stateKey: 'gestures',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else if (stepName === 'Touch target') {
        // get touch target nodes and format
        const touchTargets = {};
        for (let l = 0; l < frameChild.children.length; l += 1) {
          const touchTargetObj = frameChild.children[l];

          // make sure it's a frame node
          if (touchTargetObj.type === 'RECTANGLE') {
            const [nameArray] = touchTargetObj.name.split('|');
            const typeName = nameArray.replace('Touch Target: ', '');

            // if we have a label, grab it
            const [type] = typeName.split(':');
            const typeTrim = type.trim();

            touchTargets[touchTargetObj.id] = {
              id: touchTargetObj.id,
              name: touchTargetObj.name,
              type: typeTrim
            };
          }
        }

        stepsData[stepName] = {
          id: frameChild.id,
          existingData: touchTargets,
          stateKey: 'touchTargets',
          visible: frameChild.visible
        };
        a11yCompletedLayers.push(stepName);
      } else {
        // eslint-disable-next-line
        console.error(`step "${stepName}" is not accounted for yet`);
      }
    })
  );

  const originalPage = ifExists[0];

  return {
    id: childNode.id,
    name,
    stepsCompleted: a11yCompletedLayers,
    stepsData,
    type: a11yLayerType,
    page: {
      bounds: originalPage.absoluteRenderBounds,
      id: originalPage.id,
      mainPageId: originalPage.parent.id,
      name
    },
    pageId: originalPage.id,
    imagesScanned: imagesScannedArray,
    imagesManual: imagesManualArray
  };
};

export const getPreviousScanData = async (pageSelected) => {
  let newPageSelected = pageSelected;

  // get current page user is on when opening plugin
  const { currentPage } = figma;
  const { children: topLevelLayers } = currentPage;

  const pages = [];
  const needsNewLayerKeyV2 = [];
  let hasProgress = false;

  // check if has children
  if (topLevelLayers.length > 0) {
    const regularFrames = [];
    const a11yFrames = [];

    // loop through frames, grab regular and accessibility types
    await Promise.all(
      topLevelLayers.map(async (layer) => {
        const name = utils.nameBeforePipe(layer.name);

        // is it a section node?
        if (layer.type === 'SECTION') {
          const { children: secLayers } = layer;

          await Promise.all(
            secLayers.map(async (secLayer) => {
              // is accessibility layer?
              if (secLayer.name.includes(config.a11ySuffix)) {
                const secLayerName = utils.nameBeforePipe(secLayer.name);
                const secLayerData = await isA11yLayer(
                  secLayers,
                  secLayer,
                  secLayerName
                );

                if (typeof secLayerData === 'object' && secLayerData !== null) {
                  pages.push(secLayerData);
                  a11yFrames.push(secLayer);

                  // check if we have children
                  if (secLayer.children.length > 0) {
                    secLayer.children.forEach((child) => {
                      // check if we need to update the layer key
                      if (child.name.includes(config.a11yAnnotationLayerKey)) {
                        needsNewLayerKeyV2.push({
                          id: child.id,
                          name: child.name,
                          parentId: secLayerData.pageId
                        });
                      }
                    });
                  }
                }
              } else {
                regularFrames.push(secLayer);
              }
            })
          );
        } else if (layer.name.includes(config.a11ySuffix)) {
          // is accessibility layer?
          const layerData = await isA11yLayer(topLevelLayers, layer, name);

          if (typeof layerData === 'object' && layerData !== null) {
            pages.push(layerData);
            a11yFrames.push(layer);

            // check if we have children
            if (layer.children.length > 0) {
              layer.children.forEach((child) => {
                // check if we need to update the layer key
                if (child.name.includes(config.a11yAnnotationLayerKey)) {
                  needsNewLayerKeyV2.push({
                    id: child.id,
                    name: child.name,
                    parentId: layerData.pageId
                  });
                }
              });
            }
          }
        } else {
          regularFrames.push(layer);
        }
      })
    );

    // do we have Accessibility steps completed?
    if (pages.length > 0) {
      hasProgress = true;
      newPageSelected = true;
    }

    // no Accessibility layers on this page?
    if (a11yFrames.length === 0) {
      // no previous data found
      // so let's check if a valid frame is selected off the bat
      const { selection } = figma.currentPage;
      const selectionLength = selection.length;

      // make sure only 1 frame is selected
      if (newPageSelected === false && selectionLength === 1) {
        const selectedNode = selection[0];
        const { id, name, parent } = selectedNode;

        // default message type and data returned
        let data = {};

        // make sure selected node is a FrameNode and on the Top-Level
        if (selectedNode.type === 'FRAME' && parent.type === 'PAGE') {
          // make sure selected is not an Accessibility Layer
          if (name.includes(config.a11ySuffix) === false) {
            data = {
              id,
              name,
              mainPageId: parent.id,
              bounds: selectedNode.absoluteRenderBounds
            };
          }
        }

        // send message response back to plugin frontend (ui.js)
        figma.ui.postMessage({
          type: 'start-frame',
          data
        });
      }
    }
  } else {
    // no frames are on this Figma page at all
  }

  // session update
  const { getAsync, setAsync } = figma.clientStorage;

  // check if key exists
  const sessionIdStored = await getAsync('sessionId');
  let sessionId = 1;

  // set or update
  if (sessionIdStored === undefined) {
    await setAsync('sessionId', 1);
  } else if (typeof sessionIdStored === 'number') {
    sessionId = sessionIdStored + 1;
    await setAsync('sessionId', sessionId);
  }

  // get current user
  // https://www.figma.com/plugin-docs/api/figma/#currentuser
  // User id used for anonymized usage analytics
  const { id } = figma.currentUser;
  const currentUser = id === undefined ? 'ANON' : id;

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'loading-complete',
    data: {
      hasProgress,
      pages,
      currentUser,
      sessionId,
      newKeyV2: needsNewLayerKeyV2
    }
  });

  return { newPageSelected };
};

export const getUserPreferences = async () => {
  // session update
  const { getAsync } = figma.clientStorage;

  // check for condensed view preference
  const prefCondensedUI = await getAsync('prefCondensedUI');
  const condensedUI = prefCondensedUI === undefined ? false : prefCondensedUI;

  // check for custom breakpoints
  const prefBreakpoints = await getAsync('prefBreakpoints');
  const breakpoints =
    prefBreakpoints === undefined ? null : JSON.parse(prefBreakpoints);

  // check for any feature flags
  // when a new feature is added, the UI might have a onboarding message/experience
  const prefNewFeaturesInfo = await getAsync('prefNewFeaturesInfo');
  const newFeaturesIntro =
    prefNewFeaturesInfo === undefined ? [] : JSON.parse(prefNewFeaturesInfo);

  // check for tip expanded preference
  const prefTipExpanded = await getAsync('prefTipExpanded');
  const tipExpanded = prefTipExpanded === undefined ? true : prefTipExpanded;

  // reset for development testing
  // const { deleteAsync } = figma.clientStorage;
  // await deleteAsync('prefBreakpoints');
  // await deleteAsync('prefNewFeaturesInfo');

  figma.ui.postMessage({
    type: 'load-user-preferences',
    data: {
      breakpoints,
      newFeaturesIntro,
      prefCondensedUI: condensedUI,
      prefTipExpanded: tipExpanded
    }
  });
};

export default {
  preload,
  getPreviousScanData,
  getUserPreferences
};
