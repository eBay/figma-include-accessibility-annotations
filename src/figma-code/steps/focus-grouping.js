import { figmaLayer, utils } from '../../constants';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

const focusGroupLayerName = 'Focus grouping Layer';
const focusGroupRectName = 'Group Area';

export const noGroups = (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (no-group::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const { parent } = mainPageNode;
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Focus grouping exists already?
  const focusGroupFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    focusGroupLayerName,
    {
      height: pageH,
      width: pageW
    }
  );
  // update with id (for future scanning)
  focusGroupFrame.name = `${focusGroupLayerName} | ${focusGroupFrame.id}`;

  // add within main Accessibility layer
  mainFrame.appendChild(focusGroupFrame);

  // grab main page a11y scan was for
  const ifExists = parent.children.filter((c) => c.name === saniName);
  const originalPage = ifExists[0];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Focus grouping',
      'Focus grouping': {
        id: focusGroupFrame.id
      },
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId,
        page: {
          bounds,
          id: originalPage.id,
          mainPageId: pageId,
          name: saniName
        }
      }
    }
  });
};

export const add = (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-focus-group::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const { parent } = mainPageNode;
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Focus grouping exists already?
  const focusGroupFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    focusGroupLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  focusGroupFrame.name = `${focusGroupLayerName} | ${focusGroupFrame.id}`;

  // create group overlay layer
  const rectNode = figmaLayer.createRectangle({
    name: focusGroupRectName,
    height: 100,
    width: 300,
    opacity: 0
  });

  // add rectangle within Landmark layer
  focusGroupFrame.appendChild(rectNode);

  // add within main Accessibility layer
  mainFrame.appendChild(focusGroupFrame);

  // set selection of new Rectangle layer
  figma.currentPage.selection = [rectNode];

  // let the user know rectangle has been added
  figma.notify('Group overlay added successfully!', {
    timeout: config.notifyTime
  });

  // if this is the first group added, update main state for dashboard
  if (focusGroupFrame?.children.length === 1) {
    // grab main page a11y scan was for
    const [originalPage] = parent.children.filter((c) => c.name === saniName);

    // update pagesData
    figma.ui.postMessage({
      type: 'update-pages-data',
      data: {
        status: 'add',
        stepKey: 'Focus grouping',
        'Focus grouping': {
          id: focusGroupFrame.id
        },
        main: {
          id: mainFrame.id,
          name: saniName,
          pageId,
          page: {
            bounds,
            id: originalPage.id,
            mainPageId: pageId,
            name: saniName
          }
        }
      }
    });
  }
};

export const remove = (msg) => {
  const { groupIndex, page, pageType } = msg;

  const mainPageNode = figma.getNodeById(page.id);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-focus-group::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Focus grouping exists already?
  const focusGroupFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    focusGroupLayerName,
    page
  );

  if (focusGroupFrame) {
    const groupRects = focusGroupFrame.children.filter(
      (frame) => frame.name === focusGroupRectName
    );

    const nodeToRemove = groupRects[groupIndex];
    nodeToRemove.remove();
  }
};

export default {
  noGroups,
  add,
  remove
};
