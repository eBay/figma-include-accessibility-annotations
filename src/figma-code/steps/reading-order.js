import { colors, figmaLayer, utils } from '@/constants';
import config from '@/figma-code/config';
import { getOrCreateMainA11yFrame } from '@/figma-code/frame-helpers';

const arrowsNetwork = {
  vertices: [
    // first path: right arrow
    { x: 9, y: 5 },
    { x: 12, y: 8 },
    { x: 9, y: 11 },

    // first path: left arrow
    { x: 7, y: 11 },
    { x: 4, y: 8 },
    { x: 7, y: 5 },

    // second path: horizontal top lines
    { x: 12, y: 0.5 },
    { x: 9, y: 0.5 },
    { x: 16, y: 0.5 },
    { x: 14, y: 0.5 },
    { x: 7, y: 0.5 },
    { x: 4, y: 0.5 },
    { x: 2, y: 0.5 },
    { x: 0, y: 0.5 },

    // second path: vertical lines
    { x: 0.5, y: 2 },
    { x: 0.5, y: 0 },
    { x: 0.5, y: 7 },
    { x: 0.5, y: 4 },
    { x: 15.5, y: 7 },
    { x: 15.5, y: 4 },
    { x: 0.5, y: 12 },
    { x: 0.5, y: 9 },
    { x: 15.5, y: 12 },
    { x: 15.5, y: 9 },
    { x: 0.5, y: 16 },
    { x: 0.5, y: 14 },
    { x: 15.5, y: 16 },
    { x: 15.5, y: 14 },
    { x: 15.5, y: 2 },
    { x: 15.5, y: 0 },

    // second path: horizontal bottom lines
    { x: 0, y: 15.5 },
    { x: 2, y: 15.5 },
    { x: 4, y: 15.5 },
    { x: 7, y: 15.5 },
    { x: 9, y: 15.5 },
    { x: 12, y: 15.5 },
    { x: 14, y: 15.5 },
    { x: 16, y: 15.5 }
  ],
  segments: [
    // first path: right arrow
    { start: 0, end: 1 },
    { start: 1, end: 2 },

    // first path: left arrow
    { start: 3, end: 4 },
    { start: 4, end: 5 },

    // second path: horizontal top lines
    { start: 6, end: 7 },
    { start: 8, end: 9 },
    { start: 10, end: 11 },
    { start: 12, end: 13 },

    // second path: vertical lines
    { start: 14, end: 15 },
    { start: 16, end: 17 },
    { start: 18, end: 19 },
    { start: 20, end: 21 },
    { start: 22, end: 23 },
    { start: 24, end: 25 },
    { start: 26, end: 27 },
    { start: 28, end: 29 },

    // second path: horizontal bottom lines
    { start: 30, end: 31 },
    { start: 32, end: 33 },
    { start: 34, end: 35 },
    { start: 36, end: 37 }
  ],
  regions: []
};

const tabsNetwork = {
  vertices: [
    // arrow (first path)
    { x: 24, y: 10 },
    { x: 28.6, y: 14.6 },
    { x: 24, y: 19.2 },

    // rectangle outline (second path, first subpath)
    { x: 29, y: 6 },
    { x: 29, y: 3 },
    { x: 27, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 3 },
    { x: 1, y: 27 },
    { x: 3, y: 29 },
    { x: 27, y: 29 },
    { x: 29, y: 27 },
    { x: 29, y: 23 },

    // vertical line (second path, second subpath)
    { x: 29, y: 10 },
    { x: 29, y: 19 },

    // horizontal line (second path, third subpath)
    { x: 27.5, y: 14.5 },
    { x: 14.5, y: 14.5 }
  ],
  segments: [
    // arrow
    { start: 0, end: 1 },
    { start: 1, end: 2 },

    // rectangle outline
    { start: 3, end: 4 },
    { start: 4, end: 5 },
    { start: 5, end: 6 },
    { start: 6, end: 7 },
    { start: 7, end: 8 },
    { start: 8, end: 9 },
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 11, end: 12 },

    // horizontal line
    { start: 15, end: 16 }
  ],
  regions: []
};

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
  let nextFocusNum = itemsCount + 1;
  const isFirst = nextFocusNum === 1;

  let xStart = 0;
  let yStart = 0;

  if (isFirst === false) {
    // get last focus order placed
    const lastFocusOrder = focusOrdersFrame.children[itemsCount - 1];

    // set new yStart below last target
    xStart = lastFocusOrder.x;
    yStart = lastFocusOrder.y + lastFocusOrder.height;

    // arrows are a child navigation action
    // const lastType = lastFocusOrder.name.split('|')[1].trim();
    const labelGroupLayer = lastFocusOrder.findChild(
      (n) => n.name === 'Label group'
    );
    const lastNumberLayer = labelGroupLayer.findChild(
      (n) => n.name === 'Number'
    );
    const lastNumber = parseFloat(lastNumberLayer.characters);

    // set next focus number
    if (focusOrderType === 'arrows') {
      nextFocusNum = parseFloat((lastNumber + 0.1).toFixed(1));
    } else {
      nextFocusNum = parseInt(lastNumber, 10) + 1;
    }
  }

  // create a container frame for the focus order node and annotation
  const focusOrderContainer = figmaLayer.createTransparentFrame({
    name: `Focus order | ${focusOrderType}`,
    x: xStart,
    y: yStart,
    height: 96,
    width: 120
  });
  focusOrderContainer.expanded = false;

  // create rectangle
  const focusOrderNode = figmaLayer.createRectangle({
    fillColor: colors.deepTeal,
    name: 'Focus order dimensions',
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
    name: 'Label background',
    x: 0,
    y: 0,
    fillColor: colors.deepTeal,
    height: 24,
    width: 32 + widthAdj,
    stroke: 1,
    strokeColor: colors.deepTeal,
    opacity: 1,
    radius: 0,
    radiusMixed: [{ bottomRightRadius: 2 }, { topLeftRadius: 2 }]
  });

  // create vector (e.g., an arrow) with fallback
  const vectorNode = figma.createVector();
  vectorNode.name = 'Arrow';

  // define the arrow shape
  const isArrows = focusOrderType === 'arrows';
  const vectorNetwork = isArrows ? arrowsNetwork : tabsNetwork;
  await vectorNode.setVectorNetworkAsync(vectorNetwork);

  vectorNode.strokes = [{ type: 'SOLID', color: colors.white }];
  vectorNode.strokeWeight = 1;
  vectorNode.x = 4;
  vectorNode.y = 4;
  vectorNode.resize(16, 16);

  // create text node for the number
  const numberNode = figma.createText();
  numberNode.name = 'Number';
  numberNode.characters = `${nextFocusNum}`;
  numberNode.fontSize = 16;
  numberNode.fills = [{ type: 'SOLID', color: colors.white }];
  numberNode.fontName = { family: 'Roboto', style: 'Bold' };
  numberNode.textAutoResize = 'WIDTH_AND_HEIGHT';
  numberNode.x = 24;
  numberNode.y = 2;

  // add within focus order container first
  focusOrderContainer.appendChild(backgroundRect);
  focusOrderContainer.appendChild(vectorNode);
  focusOrderContainer.appendChild(numberNode);

  // group vector and number nodes
  const toGroupArray = [backgroundRect, vectorNode, numberNode];
  const annotationGroup = figma.group(toGroupArray, focusOrderContainer);
  annotationGroup.name = 'Label group';
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

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'focus-order-added',
    data: {
      focusOrderType,
      id: focusOrderContainer.id
    }
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
