import { colors, figmaLayer, utils } from '@/constants';
import config from '@/figma-code/config';
import { getOrCreateMainA11yFrame } from '@/figma-code/frame-helpers';

export const addArrow = async (msg) => {
  const { bounds, arrowType, name, pageId, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify(
      'Error occurred (add-reading-order-arrow::mainPageNodeNotFound)',
      {
        error: true,
        timeout: config.notifyTime
      }
    );
    return;
  }

  // main data and setup
  const { x, y, height, width } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
  const readingOrderLayerName = 'Reading order Layer';

  // get main A11y frame if it exists (or create it)
  const { parent } = mainPageNode;
  const dims = { x, y, height, width };
  const mainFrame = await utils.frameExistsOrCreate(
    parent.id,
    mainLayerName,
    dims
  );
  // const mainAnnotationsFrame = getOrCreateMainAnnotationsFrame({
  //   mainFrame,
  //   page
  // });

  // does Reading order exists already?
  const readingOrderFrame = await utils.frameExistsOrCreate(
    mainFrame.id,
    readingOrderLayerName,
    { height, width }
  );

  // update with id (for future scanning)
  readingOrderFrame.name = `${readingOrderLayerName} | ${readingOrderFrame.id}`;

  const arrowsLength = readingOrderFrame.children.length;
  const arrowNumber = arrowsLength + 1;
  const isFirst = arrowNumber === 1;
  const arrowName = isFirst
    ? `Start Arrow | ${arrowType}`
    : `Arrow ${arrowNumber} | ${arrowType}`;

  let xStart = 50;
  let yStart = 50;

  // if not first arrow, get last arrow's x/y
  if (isFirst === false) {
    const lastChild = readingOrderFrame.children[arrowsLength - 1];
    const { absoluteBoundingBox } = lastChild;

    // if | is found, get the prevType
    const hasPipe = lastChild.name.includes('|');
    const prevType = hasPipe
      ? lastChild.name.split('|')[1].trim()
      : 'downRight';

    let xDiff = 0;
    let yDiff = 0;

    switch (prevType) {
      case 'downLeft':
        yDiff = absoluteBoundingBox.height;
        break;
      case 'left':
        break;
      case 'upRight':
        xDiff = absoluteBoundingBox.width;
        break;
      case 'upLeft':
        break;
      case 'up':
        break;
      case 'down':
        yDiff = absoluteBoundingBox.height;
        break;
      case 'right':
        xDiff = absoluteBoundingBox.width;
        break;
      case 'downRight':
        xDiff = absoluteBoundingBox.width;
        yDiff = absoluteBoundingBox.height;
        break;
      default:
        break;
    }

    switch (arrowType) {
      case 'downLeft':
        xDiff -= figmaLayer.arrowSize + 4;
        yDiff += 4;
        break;
      case 'left':
        xDiff -= figmaLayer.arrowSize + 4;
        break;
      case 'upLeft':
        xDiff -= figmaLayer.arrowSize + 2;
        yDiff -= figmaLayer.arrowSize + 2;
        break;
      case 'upRight':
        yDiff -= figmaLayer.arrowSize + 2;
        xDiff -= 2;
        break;
      case 'right':
        xDiff += 4;
        break;
      case 'downRight':
        xDiff += 2;
        yDiff += 2;
        break;
      case 'up':
        yDiff -= figmaLayer.arrowSize + 4;
        break;
      case 'down':
        yDiff += 4;
        break;
      default:
        break;
    }

    xStart = lastChild.x + xDiff;
    yStart = lastChild.y + yDiff;
  }

  const arrow = await figmaLayer.createArrow({
    arrowType,
    name: arrowName,
    x: xStart,
    y: yStart
  });

  // add arrow within Reading order layer
  readingOrderFrame.appendChild(arrow);

  // add within main Accessibility layer
  mainFrame.appendChild(readingOrderFrame);

  // set selection of new Arrow layer
  figma.currentPage.selection = [arrow];

  // let the user know arrow has been added
  figma.notify(`Arrow added successfully!`, {
    timeout: config.notifyTime
  });
};

export const addFocusOrder = async (msg) => {
  const { bounds, focusOrderType, name, pageId, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

  // node not found
  if (mainPageNode === null) {
    figma.notify('Error occurred (add-focus-order::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // main data and setup
  const { x, y, height, width } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
  const focusOrderLayerName = 'Focus order Layer';

  // get main A11y frame if it exists (or create it)
  const { parent } = mainPageNode;
  const dims = { x, y, height, width };
  const mainFrame = await utils.frameExistsOrCreate(
    parent.id,
    mainLayerName,
    dims
  );

  // does focus orders exists already?
  const focusOrdersFrame = await utils.frameExistsOrCreate(
    mainFrame.id,
    focusOrderLayerName,
    {
      height,
      width
    }
  );

  // update with id (for future scanning)
  focusOrdersFrame.name = `${focusOrderLayerName} | ${focusOrdersFrame.id}`;

  const itemsCount = focusOrdersFrame.children.length;
  const nextFocusNum = itemsCount + 1;
  const isFirst = nextFocusNum === 1;

  let xStart = 0;
  let yStart = 0;

  if (isFirst === false) {
    // get last focus order placed
    const lastFocusOrder = focusOrdersFrame.children[itemsCount - 1];

    // set new yStart below last target
    xStart = lastFocusOrder.x;
    yStart = lastFocusOrder.y + lastFocusOrder.height;
  }

  // create a container frame for the focus order node and annotation
  const focusOrderContainer = figmaLayer.createTransparentFrame({
    name: `Focus order ${nextFocusNum} Container`,
    x: xStart,
    y: yStart,
    height: 96,
    width: 120
  });
  focusOrderContainer.expanded = false;

  // create rectangle
  const focusOrderNode = figmaLayer.createRectangle({
    fillColor: colors.deepTeal,
    name: `Focus order ${nextFocusNum}`,
    height: 96,
    radius: 4,
    opacity: 0,
    dashed: focusOrderType === 'arrows',
    stroke: 2,
    strokeColor: colors.deepTeal,
    x: 0,
    y: 0,
    width: 120
  });

  focusOrderNode.constraints = {
    horizontal: 'SCALE',
    vertical: 'SCALE'
  };

  // create background rectangle for annotationGroup
  const numberString = nextFocusNum.toString();
  const widthAdj = numberString.length * 4;
  const backgroundRect = figmaLayer.createRectangle({
    name: 'Annotation Background',
    x: 0,
    y: 0,
    fillColor: colors.deepTeal,
    height: 24,
    width: 32 + widthAdj,
    stroke: 1,
    strokeColor: colors.deepTeal,
    opacity: 1,
    radius: 0,
    radiusMixed: [{ bottomRightRadius: 2 }]
  });

  // Create vector (e.g., an arrow) with fallback
  const vectorNode = figma.createVector();
  vectorNode.name = `Arrow ${nextFocusNum}`;

  // define the arrow shape
  const isArrows = focusOrderType === 'arrows';
  const vectorNetwork = isArrows
    ? {
        vertices: [
          // First path: Right arrow
          { x: 9, y: 5 }, // 0: Right arrow start
          { x: 12, y: 8 }, // 1: Right arrow middle
          { x: 9, y: 11 }, // 2: Right arrow end

          // First path: Left arrow
          { x: 7, y: 11 }, // 3: Left arrow start
          { x: 4, y: 8 }, // 4: Left arrow middle
          { x: 7, y: 5 }, // 5: Left arrow end

          // Second path: Horizontal top lines
          { x: 12, y: 0.5 }, // 6: Horizontal top 1 start
          { x: 9, y: 0.5 }, // 7: Horizontal top 1 end
          { x: 16, y: 0.5 }, // 8: Horizontal top 2 start
          { x: 14, y: 0.5 }, // 9: Horizontal top 2 end
          { x: 7, y: 0.5 }, // 10: Horizontal top 3 start
          { x: 4, y: 0.5 }, // 11: Horizontal top 3 end
          { x: 2, y: 0.5 }, // 12: Horizontal top 4 start
          { x: 0, y: 0.5 }, // 13: Horizontal top 4 end

          // Second path: Vertical lines
          { x: 0.5, y: 2 }, // 14: Vertical line 1 start
          { x: 0.5, y: 0 }, // 15: Vertical line 1 end
          { x: 0.5, y: 7 }, // 16: Vertical line 2 start
          { x: 0.5, y: 4 }, // 17: Vertical line 2 end
          { x: 15.5, y: 7 }, // 18: Vertical line 3 start
          { x: 15.5, y: 4 }, // 19: Vertical line 3 end
          { x: 0.5, y: 12 }, // 20: Vertical line 4 start
          { x: 0.5, y: 9 }, // 21: Vertical line 4 end
          { x: 15.5, y: 12 }, // 22: Vertical line 5 start
          { x: 15.5, y: 9 }, // 23: Vertical line 5 end
          { x: 0.5, y: 16 }, // 24: Vertical line 6 start
          { x: 0.5, y: 14 }, // 25: Vertical line 6 end
          { x: 15.5, y: 16 }, // 26: Vertical line 7 start
          { x: 15.5, y: 14 }, // 27: Vertical line 7 end
          { x: 15.5, y: 2 }, // 28: Vertical line 8 start
          { x: 15.5, y: 0 }, // 29: Vertical line 8 end

          // Second path: Horizontal bottom lines
          { x: 0, y: 15.5 }, // 30: Horizontal bottom 1 start
          { x: 2, y: 15.5 }, // 31: Horizontal bottom 1 end
          { x: 4, y: 15.5 }, // 32: Horizontal bottom 2 start
          { x: 7, y: 15.5 }, // 33: Horizontal bottom 2 end
          { x: 9, y: 15.5 }, // 34: Horizontal bottom 3 start
          { x: 12, y: 15.5 }, // 35: Horizontal bottom 3 end
          { x: 14, y: 15.5 }, // 36: Horizontal bottom 4 start
          { x: 16, y: 15.5 } // 37: Horizontal bottom 4 end
        ],
        segments: [
          // First path: Right arrow
          { start: 0, end: 1 }, // Line from (9, 5) to (12, 8)
          { start: 1, end: 2 }, // Line from (12, 8) to (9, 11)

          // First path: Left arrow
          { start: 3, end: 4 }, // Line from (7, 11) to (4, 8)
          { start: 4, end: 5 }, // Line from (4, 8) to (7, 5)

          // Second path: Horizontal top lines
          { start: 6, end: 7 }, // Line from (12, 0.5) to (9, 0.5)
          { start: 8, end: 9 }, // Line from (16, 0.5) to (14, 0.5)
          { start: 10, end: 11 }, // Line from (7, 0.5) to (4, 0.5)
          { start: 12, end: 13 }, // Line from (2, 0.5) to (0, 0.5)

          // Second path: Vertical lines
          { start: 14, end: 15 }, // Line from (0.5, 2) to (0.5, 0)
          { start: 16, end: 17 }, // Line from (0.5, 7) to (0.5, 4)
          { start: 18, end: 19 }, // Line from (15.5, 7) to (15.5, 4)
          { start: 20, end: 21 }, // Line from (0.5, 12) to (0.5, 9)
          { start: 22, end: 23 }, // Line from (15.5, 12) to (15.5, 9)
          { start: 24, end: 25 }, // Line from (0.5, 16) to (0.5, 14)
          { start: 26, end: 27 }, // Line from (15.5, 16) to (15.5, 14)
          { start: 28, end: 29 }, // Line from (15.5, 2) to (15.5, 0)

          // Second path: Horizontal bottom lines
          { start: 30, end: 31 }, // Line from (0, 15.5) to (2, 15.5)
          { start: 32, end: 33 }, // Line from (4, 15.5) to (7, 15.5)
          { start: 34, end: 35 }, // Line from (9, 15.5) to (12, 15.5)
          { start: 36, end: 37 } // Line from (14, 15.5) to (16, 15.5)
        ],
        regions: [] // No filled regions (stroke only)
      }
    : {
        vertices: [
          // Arrow (first path)
          { x: 24, y: 10 }, // 0: Arrow start
          { x: 28.6, y: 14.6 }, // 1: Arrow middle
          { x: 24, y: 19.2 }, // 2: Arrow end

          // Rectangle outline (second path, first subpath)
          { x: 29, y: 6 }, // 3: Start of rectangle
          { x: 29, y: 3 }, // 4: Top-right before arc
          { x: 27, y: 1 }, // 5: Top-right after arc
          { x: 3, y: 1 }, // 6: Top-left before arc
          { x: 1, y: 3 }, // 7: Top-left after arc
          { x: 1, y: 27 }, // 8: Bottom-left before arc
          { x: 3, y: 29 }, // 9: Bottom-left after arc
          { x: 27, y: 29 }, // 10: Bottom-right before arc
          { x: 29, y: 27 }, // 11: Bottom-right after arc
          { x: 29, y: 23 }, // 12: End of rectangle

          // Vertical line (second path, second subpath)
          { x: 29, y: 10 }, // 13: Vertical line start
          { x: 29, y: 19 }, // 14: Vertical line end

          // Horizontal line (second path, third subpath)
          { x: 27.5, y: 14.5 }, // 15: Horizontal line start
          { x: 14.5, y: 14.5 } // 16: Horizontal line end
        ],
        segments: [
          // Arrow
          { start: 0, end: 1 }, // Line from (24, 10) to (28.6, 14.6)
          { start: 1, end: 2 }, // Line from (28.6, 14.6) to (24, 19.2)

          // Rectangle outline
          { start: 3, end: 4 }, // Line from (29, 6) to (29, 3)
          { start: 4, end: 5 }, // Approximate arc from (29, 3) to (27, 1)
          { start: 5, end: 6 }, // Line from (27, 1) to (3, 1)
          { start: 6, end: 7 }, // Approximate arc from (3, 1) to (1, 3)
          { start: 7, end: 8 }, // Line from (1, 3) to (1, 27)
          { start: 8, end: 9 }, // Approximate arc from (1, 27) to (3, 29)
          { start: 9, end: 10 }, // Line from (3, 29) to (27, 29)
          { start: 10, end: 11 }, // Approximate arc from (27, 29) to (29, 27)
          { start: 11, end: 12 }, // Line from (29, 27) to (29, 23)

          // Horizontal line
          { start: 15, end: 16 } // Line from (27.5, 14.5) to (14.5, 14.5)
        ],
        regions: [] // No filled regions (stroke only)
      };

  // Try setVectorNetworkAsync, fallback to vectorPaths
  try {
    if (typeof vectorNode.setVectorNetworkAsync === 'function') {
      await vectorNode.setVectorNetworkAsync(vectorNetwork);
    } else {
      // Fallback to vectorPaths for older API versions
      vectorNode.vectorPaths = [
        {
          windingRule: 'NONZERO',
          data: 'M0 0 L8 8 L0 16' // Matches the VectorNetwork shape
        }
      ];
      figma.notify(
        'Warning: Using deprecated vectorPaths API as setVectorNetworkAsync is unavailable',
        {
          timeout: config.notifyTime
        }
      );
    }
  } catch (error) {
    figma.notify(`Error creating vector: ${error.message}`, {
      error: true,
      timeout: config.notifyTime
    });
    // Fallback to vectorPaths in case of error
    vectorNode.vectorPaths = [
      {
        windingRule: 'NONZERO',
        data: 'M0 0 L8 8 L0 16'
      }
    ];
  }

  vectorNode.strokes = [{ type: 'SOLID', color: colors.white }];
  vectorNode.strokeWeight = 2;
  vectorNode.resize(16, 16); // Small size for the vector
  vectorNode.x = 3; // Position left of focusOrderNode, relative to container
  vectorNode.y = 3; // Position above focusOrderNode, relative to container

  // create text node for the number
  const numberNode = figma.createText();
  numberNode.name = `Number ${nextFocusNum}`;
  numberNode.characters = `${nextFocusNum}`;
  numberNode.fontSize = 16; // Match add function
  numberNode.fills = [{ type: 'SOLID', color: colors.white }]; // Match add function
  numberNode.fontName = { family: 'Roboto', style: 'Bold' };
  numberNode.textAutoResize = 'WIDTH_AND_HEIGHT';
  numberNode.x = 24; // Relative to container
  numberNode.y = 2; // Relative to container

  // group vector and number nodes
  const toGroupArray = [backgroundRect, vectorNode, numberNode];
  const annotationGroup = figma.group(toGroupArray, focusOrderContainer);
  annotationGroup.name = 'Annotation Number';
  annotationGroup.expanded = false;

  // append nodes to container
  focusOrderContainer.appendChild(focusOrderNode);
  focusOrderContainer.appendChild(annotationGroup);

  // add focus order container to greater focus order frame
  focusOrdersFrame.appendChild(focusOrderContainer);

  // add focus order frame within main accessibility layer
  mainFrame.appendChild(focusOrdersFrame);

  // set selection of new focus order container
  figma.currentPage.selection = [focusOrderContainer];

  // let the user know rectangle has been added
  figma.notify(`Focus order overlay added successfully!`, {
    timeout: config.notifyTime
  });
};

export const confirm = async (msg) => {
  const { page, pageType } = msg;
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const readingOrderLayerName = 'Reading order Layer';

  // get main A11y frame if it exists (or create it)
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does Reading order layer exists already?
  const readingOrderExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    readingOrderLayerName
  );

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Reading order',
      'Reading order': {
        id: readingOrderExists
      },
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: page.id,
        page: {
          bounds,
          id: page.id,
          mainPageId,
          name: saniName
        }
      }
    }
  });

  // let the user know layer(s) have been added/updated
  const notifyMsg = readingOrderExists !== null ? 'updated' : 'added';
  figma.notify(`Reading order layer has been ${notifyMsg} successfully!`, {
    timeout: config.notifyTime
  });
};

export default { addArrow, addFocusOrder, confirm };
