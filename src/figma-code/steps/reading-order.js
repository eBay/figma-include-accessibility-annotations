import { figmaLayer, utils } from '@/constants';
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
  const { bounds, arrowType, name, page, pageId, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

  console.log('mainPageNode', mainPageNode);
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
