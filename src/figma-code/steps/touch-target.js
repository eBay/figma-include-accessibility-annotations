import { colors, figmaLayer, utils } from '../../constants';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

const touchTargetsLayerName = 'Touch target Layer';

export const add = async (msg) => {
  const { bounds, page, pageId, pageType } = msg;
  const mainPageNode = await figma.getNodeByIdAsync(pageId);

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
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does touch targets exists already?
  const touchTargetsFrame = await utils.frameExistsOrCreate(
    mainFrame.id,
    touchTargetsLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  touchTargetsFrame.name = `${touchTargetsLayerName} | ${touchTargetsFrame.id}`;

  const targetsLength = touchTargetsFrame.children.length;
  const nextTargetNum = targetsLength + 1;
  const isFirst = nextTargetNum === 1;

  let xStart = 0;
  let yStart = 0;

  if (isFirst === false) {
    // get last target placed
    const lastTarget = touchTargetsFrame.children[targetsLength - 1];
    const { height, x, y } = lastTarget;

    // set new yStart below last target
    xStart = x;
    yStart = y + height;
  }

  // create rectangle
  const size = pageType === 'web' ? 24 : 48;
  const targetNode = figmaLayer.createRectangle({
    fillColor: colors.purpleDark,
    name: `Touch target ${nextTargetNum}`,
    height: size,
    radius: 4,
    opacity: 0.3,
    stroke: 0,
    strokeColor: colors.purpleDark,
    x: xStart,
    y: yStart,
    width: size
  });

  targetNode.constraints = {
    horizontal: 'SCALE',
    vertical: 'SCALE'
  };

  // add touch target block to greater touch targets frame
  touchTargetsFrame.appendChild(targetNode);

  // de-selection of layer on Figma document
  figma.currentPage.selection = [];

  // add touch targets frame within main Accessibility layer
  mainFrame.appendChild(touchTargetsFrame);

  // set selection of new touch target layer
  figma.currentPage.selection = [targetNode];

  // let the user know rectangle has been added
  figma.notify(`Touch target overlay added successfully!`, {
    timeout: config.notifyTime
  });

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'touch-target-confirmed',
    data: {
      id: targetNode.id,
      name: targetNode.name
    }
  });

  // collapse all frames
  touchTargetsFrame.expanded = false;
};

export const checkTouchTargets = async (msg) => {
  const { touchTargets } = msg;

  const validTargetNodes = (
    await Promise.all(
      Object.keys(touchTargets).map((nodeId) => figma.getNodeByIdAsync(nodeId))
    )
  ).filter(Boolean);

  // Rename the nodes based on how many we now have
  validTargetNodes.forEach((targetNode, index) => {
    // eslint-disable-next-line no-param-reassign
    targetNode.name = `Touch target ${index + 1}`;
  });

  const doRectanglesIntersect = (node1, node2) => {
    const overlapX =
      node1.x < node2.x + node2.width && node1.x + node1.width > node2.x;
    const overlapY =
      node1.y < node2.y + node2.height && node1.y + node1.height > node2.y;

    return overlapX && overlapY;
  };

  function doCirclesIntersect(node1, node2) {
    const radius1 = node1.width / 2.0;
    const radius2 = node2.width / 2.0;

    // Calculate the distance between the centers of the two circles
    const distanceX = node1.x - node2.x;
    const distanceY = node1.y - node2.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // If the distance is less than the sum of the radii, the circles intersect
    return distance <= radius1 + radius2;
  }

  function doesCircleIntersectRectangle(node1, node2) {
    const { x, y } = node1;
    const radius = node1.width / 2.0;

    const rx = node2.x;
    const ry = node2.y;
    const { width, height } = node2;

    // Check if circle's center is inside the rectangle
    if (rx <= x && x <= rx + width && ry <= y && y <= ry + height) {
      return true;
    }

    // Find the closest point in the rectangle to the circle's center
    const closestX = Math.max(rx, Math.min(x, rx + width));
    const closestY = Math.max(ry, Math.min(y, ry + height));

    // Calculate the distance between the circle's center and this closest point
    const distanceX = x - closestX;
    const distanceY = y - closestY;

    // If the distance is less than the circle's radius, an intersection occurs
    return distanceX * distanceX + distanceY * distanceY <= radius * radius;
  }

  const doesOverlap = (node1, node2) => {
    if (node1.type === 'spacing-circle') {
      return node2.type === 'spacing-circle'
        ? doCirclesIntersect(node1, node2)
        : doesCircleIntersectRectangle(node1, node2);
    }
    return doRectanglesIntersect(node1, node2);
  };

  // In terms of WCAG compliance, this is the same on native and web
  const targetSize = 24;

  const checkOverlap = (nodes) => {
    const overlapIssues = [];

    // if more than 1 node exists
    if (nodes.length > 1) {
      // check if any nodes overlap
      for (let i = 0; i < nodes.length; i += 1) {
        const node1 = nodes[i];

        for (let j = i + 1; j < nodes.length; j += 1) {
          const node2 = nodes[j];

          // check if nodes overlap
          if (doesOverlap(node1, node2)) {
            const node2Postfix = node2.name.split(' ')[2];
            overlapIssues.push({
              type: 'overlap',
              nodeIds: [node1.id, node2.id],
              label: `${node1.name} & ${node2Postfix}`
            });
          }
        }
      }
    }

    return overlapIssues;
  };

  const checkSizeAndSpacing = (nodes) => {
    const isUndersized = (node) =>
      node.width < targetSize || node.height < targetSize;

    const undersizedNodes = [];
    const nodesToCompare = [];
    const sizeIssueNodes = [];

    nodes.forEach((node) => {
      if (isUndersized(node)) {
        // If the node is undersized, we need to see if it passes
        // via the spacing exception. We will set up a spacing-circle
        // that is 24x24 centered at the center of mass for the node
        const centerOfMass = {
          x: node.x + node.width / 2,
          y: node.y + node.height / 2
        };
        const compareNode = {
          id: node.id,
          name: node.name,
          x: centerOfMass.x,
          y: centerOfMass.y,
          width: targetSize,
          height: targetSize,
          type: 'spacing-circle'
        };
        undersizedNodes.push(compareNode); // add spacing node to the undersized list
        nodesToCompare.push(compareNode); // we also need to add the spacing node to the comparison list
      }

      // No matter what, push the original node to the comparison list
      nodesToCompare.push(node);
    });

    undersizedNodes.forEach((node) => {
      let overlapsWithAnother = false;
      for (
        let i = 0;
        !overlapsWithAnother && i < nodesToCompare.length;
        i += 1
      ) {
        const compareAgainst = nodesToCompare[i];
        if (
          compareAgainst.id !== node.id &&
          doesOverlap(node, compareAgainst)
        ) {
          sizeIssueNodes.push(node);
          overlapsWithAnother = true;
        }
      }
    });

    return sizeIssueNodes.map((node) => ({
      type: 'size',
      nodeIds: [node.id],
      label: node.name
    }));
  };

  const overlapIssues = checkOverlap(validTargetNodes);
  const sizeIssues = checkSizeAndSpacing(validTargetNodes);
  const issueNodes = overlapIssues.concat(sizeIssues);

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'touch-targets-checked',
    data: {
      targets: validTargetNodes.map((node) => ({
        id: node.id,
        name: node.name
      })),
      issues: issueNodes
    }
  });
};

export default { add, checkTouchTargets };
