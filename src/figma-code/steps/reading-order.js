import { figmaLayer, utils } from '../../constants';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

export const addArrow = (msg) => {
  const { bounds, firstArrow, arrowType, name, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

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
  const mainFrame = utils.frameExistsOrCreate(parent.id, mainLayerName, dims);

  // does Reading order exists already?
  const readingOrderFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    readingOrderLayerName,
    { height, width }
  );

  // update with id (for future scanning)
  readingOrderFrame.name = `${readingOrderLayerName} | ${readingOrderFrame.id}`;

  const arrowNumber = readingOrderFrame.children.length + 1;
  const arrowName = firstArrow ? 'Start Arrow' : `Arrow ${arrowNumber}`;
  const yStart = firstArrow ? 50 : 100;

  // Could be cool to find the most recently placed arrow, and make the yStart based on that
  const arrow = figmaLayer.createArrow({
    arrowType,
    name: arrowName,
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

export const confirm = (msg) => {
  const { page, pageType } = msg;
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const readingOrderLayerName = 'Reading order Layer';

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Reading order layer exists already?
  const readingOrderExists = utils.checkIfChildNameExists(
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

export default { addArrow, confirm };
