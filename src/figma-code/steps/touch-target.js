import { colors, figmaLayer, utils } from '../../constants';
import config from '../config';
import {
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from '../frame-helpers';

// data
import touchTargetTypesObj from '../../data/touch-target-types';

const touchTargetsLayerName = 'Touch target Layer';

export const add = (msg) => {
  const { bounds, targetType, page, pageId, pageType } = msg;
  const { label } = touchTargetTypesObj[targetType];

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-touch-target::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });
  const mainAnnotationsFrame = getOrCreateMainAnnotationsFrame({
    mainFrame,
    page
  });

  // does touch targets exists already?
  const touchTargetsFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    touchTargetsLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  touchTargetsFrame.name = `${touchTargetsLayerName} | ${touchTargetsFrame.id}`;

  let targetNode = null;

  // what type of touch target does the user want to create?
  if (targetType === 'custom') {
    // create rectangle
    targetNode = figmaLayer.createRectangle({
      fillColor: colors.purpleDark,
      name: `Touch Target: ${targetType}`,
      height: 100,
      opacity: 0.3,
      stroke: 0,
      strokeColor: colors.purpleDark,
      width: 300
    });

    targetNode.constraints = {
      horizontal: 'SCALE',
      vertical: 'SCALE'
    };
  } else {
    // create circle
    targetNode = figmaLayer.createCircle({
      fillColor: colors.purpleDark,
      name: `Touch Target: ${targetType}`,
      opacity: 0.3,
      size: 24,
      stroke: 0,
      strokeColor: colors.purpleDark
    });
  }

  targetNode.x = 0;
  targetNode.y = 0;

  // add touch target block to greater touch targets frame
  touchTargetsFrame.appendChild(targetNode);

  // de-selection of layer on Figma document
  figma.currentPage.selection = [];

  // add touch targets frame within main Accessibility layer
  mainFrame.appendChild(touchTargetsFrame);

  // set selection of new touch target layer
  figma.currentPage.selection = [targetNode];

  const labelFormatted = label.replace(/<br \/>/g, ' ');

  // let the user know rectangle has been added
  figma.notify(`${labelFormatted} overlay added successfully!`, {
    timeout: config.notifyTime
  });

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'touch-target-confirmed',
    data: {
      id: targetNode.id,
      label,
      name: targetNode.name,
      touchTargetType: targetType
    }
  });

  figma.viewport.scrollAndZoomIntoView([mainPageNode, mainAnnotationsFrame]);

  // collapse all frames
  touchTargetsFrame.expanded = false;
};

export const checkTouchTargets = (msg) => {
  const { touchTargets } = msg;

  const doesOverlap = (node1Id, node2Id) => {
    const node1 = figma.getNodeById(node1Id);
    const node2 = figma.getNodeById(node2Id);

    const overlapX =
      node1.x < node2.x + node2.width && node1.x + node1.width > node2.x;
    const overlapY =
      node1.y < node2.y + node2.height && node1.y + node1.height > node2.y;

    return overlapX && overlapY;
  };

  const checkOverlap = (nodes) => {
    const overlappingNodes = [];

    // if more than 1 node exists
    if (nodes.length > 1) {
      // check if any nodes overlap
      for (let i = 0; i < nodes.length; i += 1) {
        const node1 = nodes[i];

        for (let j = i + 1; j < nodes.length; j += 1) {
          const node2 = nodes[j];

          // check if nodes overlap
          if (doesOverlap(node1, node2)) {
            overlappingNodes.push(node1);
          }
        }
      }
    }

    return overlappingNodes;
  };

  const overlaps = checkOverlap(Object.keys(touchTargets));

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'touch-targets-checked',
    data: {
      overlapsFound: overlaps
    }
  });
};

export default { add, checkTouchTargets };
