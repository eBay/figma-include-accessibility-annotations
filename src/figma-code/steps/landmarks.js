import { colors, figmaLayer, utils } from '../../constants';
import { createTransparentFrame } from '../../constants/figma-layer';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

// data
import landmarksTypesObj from '../../data/landmark-types';

const landmarkLayerName = 'Landmarks Layer';

export const noLandmarks = (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (no-landmark::mainPageNodeNotFound)', {
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

  // does Landmarks exists already?
  const landmarksFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    landmarkLayerName,
    {
      height: pageH,
      width: pageW
    }
  );
  // update with id (for future scanning)
  landmarksFrame.name = `${landmarkLayerName} | ${landmarksFrame.id}`;

  // add within main Accessibility layer
  mainFrame.appendChild(landmarksFrame);

  // grab main page a11y scan was for
  const ifExists = parent.children.filter((c) => c.name === saniName);
  const originalPage = ifExists[0];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Landmarks',
      Landmarks: {
        id: landmarksFrame.id,
        existingData: {}
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
  const { bounds, landmark, page, pageId, pageType } = msg;
  const { label } = landmarksTypesObj[landmark];

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-landmark::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Landmarks exists already?
  const landmarksFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    landmarkLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  landmarksFrame.name = `${landmarkLayerName} | ${landmarksFrame.id}`;

  const landmarksLength = landmarksFrame.children.length;
  const currentLandmarkNum = landmarksLength + 1;
  const isFirst = currentLandmarkNum === 1;

  let xStart = 0;
  let yStart = 0;

  if (isFirst === false) {
    // get last landmark
    const lastLandmark = landmarksFrame.children[landmarksLength - 1];
    const { height, x, y } = lastLandmark;

    // set new yStart below last landmark
    xStart = x;
    yStart = y + height;
  }

  // create landmark layer
  const landmarkBlock = createTransparentFrame({
    name: `Landmark: ${landmark}`,
    x: xStart,
    y: yStart,
    width: 300,
    height: 100
  });

  const landmarkBlockName = `Landmark: ${landmark} | ${landmarkBlock.id}`;
  landmarkBlock.name = landmarkBlockName;

  // create rectangle / background
  const rectNode = figmaLayer.createRectangle({
    name: `Landmark Area: ${landmark}`,
    height: 100,
    width: 300
  });

  rectNode.constraints = {
    horizontal: 'SCALE',
    vertical: 'SCALE'
  };
  rectNode.x = 0;
  rectNode.y = 0;

  // add rectangle within Landmark layer
  landmarkBlock.appendChild(rectNode);

  // create label background with auto-layout
  const labelFrame = figmaLayer.createFrame({
    name: 'Label Background',
    height: 1,
    width: 1,
    x: 0,
    y: 0,
    opacity: 1
  });
  labelFrame.layoutMode = 'HORIZONTAL';
  labelFrame.horizontalPadding = 12;
  labelFrame.verticalPadding = 8;
  labelFrame.counterAxisSizingMode = 'AUTO';
  labelFrame.cornerRadius = 8;

  // do NOT have it scale with the surrounding frame
  labelFrame.constraints = {
    horizontal: 'MIN',
    vertical: 'MIN'
  };

  // create annotation name for label
  const labelNode = figma.createText();
  labelNode.name = `Landmark Name: ${label}`;
  labelNode.fontSize = 15;
  labelNode.characters = label;
  labelNode.fills = [{ type: 'SOLID', color: colors.white }];
  labelNode.fontName = { family: 'Roboto', style: 'Bold' };

  // add label node to frame
  labelFrame.appendChild(labelNode);

  // Add label frame to landmark block
  landmarkBlock.appendChild(labelFrame);

  // Add landmark block to greater landmarks frame
  landmarksFrame.appendChild(landmarkBlock);

  // de-selection of layer on Figma document
  figma.currentPage.selection = [];

  // add landmarks frame within main Accessibility layer
  mainFrame.appendChild(landmarksFrame);

  // set selection of new landmark layer
  figma.currentPage.selection = [landmarkBlock];

  // let the user know rectangle has been added
  figma.notify(`${landmark} overlay added successfully!`, {
    timeout: config.notifyTime
  });

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'landmark-confirmed',
    data: {
      id: landmarkBlock.id,
      landmarkType: landmark,
      name: landmarkBlockName
    }
  });

  // collapse all frames
  landmarksFrame.expanded = false;
  labelFrame.expanded = false;
  landmarkBlock.expanded = false;
};

export const completed = (msg) => {
  const { page, pageType, landmarks = {} } = msg;

  // main data and setup
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
  const landmarksLayerName = 'Landmarks Layer';

  // does Accessibility layer exists already?
  const accessExists = utils.checkIfChildNameExists(mainPageId, mainLayerName);

  let mainFrame = null;

  // if Accessibility layer doesn't exist
  if (accessExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-landmark::accessExists)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }
  // already exists, grab by Node ID
  mainFrame = figma.getNodeById(accessExists);

  // does Landmarks exists already?
  const landmarksExists = utils.checkIfChildNameExists(
    mainFrame.id,
    landmarksLayerName
  );

  // if Landmarks layer doesn't exist
  if (landmarksExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-landmark::landmarksExists)', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // already exists, grab by Node ID
  const landmarksFrame = figma.getNodeById(landmarksExists);

  // grab main page a11y scan was for
  const { parent } = mainFrame;
  const [originalPage] = parent.children.filter((c) => c.name === saniName);

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Landmarks',
      Landmarks: {
        id: landmarksFrame.id,
        existingData: landmarks
      },
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: originalPage.id,
        page: {
          bounds,
          id: originalPage.id,
          mainPageId,
          name: saniName
        }
      }
    }
  });
};

export const updateWithLabel = (msg) => {
  const { id, value, landmarkType } = msg;
  const { label } = landmarksTypesObj[landmarkType];

  // get landmark
  const landmarkNode = figma.getNodeById(id);

  // prevent memory leak (if not found, early return)
  if (landmarkNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred: please restart plugin if this continues.', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // set width of label background to account for new length
  const newValue = utils.capitalize(value.toLowerCase());
  const newLabel = `${label} ${newValue}`;
  const widthMin = 52;
  const labelWidth = Math.floor(newLabel.length * 9.5);
  const newLabelWidth = labelWidth < widthMin ? widthMin : labelWidth;

  const updateName = (node) => {
    const landmarkNameNode = figma.getNodeById(node.id);
    landmarkNameNode.characters = newLabel;
  };

  // loop through children and make changes as needed
  landmarkNode.children.map((childNode) => {
    const { name } = childNode;
    const lowerName = name.toLowerCase();

    if (lowerName === 'label background') {
      if (childNode.children.length > 0) {
        // new version: label is child of background frame
        const labelChild = childNode.children[0];
        const labelName = labelChild.name.toLowerCase();
        if (labelName.includes('landmark name:')) {
          updateName(labelChild);
        }
      } else {
        // old version compatability: resize label based on new width
        childNode.resize(newLabelWidth, 32);
      }
    } else if (lowerName.includes('landmark name:')) {
      // old version compatiability: update new label
      updateName(childNode);
    }

    // update name of parent layer for future scanning/pick up where you left off
    landmarkNode.name = `Landmark: ${landmarkType}:${newValue} | ${landmarkNode.id}`;

    return null;
  });
};

export default {
  noLandmarks,
  add,
  completed,
  updateWithLabel
};
