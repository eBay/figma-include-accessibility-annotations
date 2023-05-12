import { colors, figmaLayer, utils } from '../../constants';
import { createTransparentFrame } from '../../constants/figma-layer';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

const semanticLayerName = 'Semantics Layer';
// TIPS for Semantics adapted from https://developer.mozilla.org/en-US/docs/Web/Accessibility

export const noSemantics = (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (no-semantic::mainPageNodeNotFound)', {
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

  // does Semantics exists already?
  const semanticsFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    semanticLayerName,
    {
      height: pageH,
      width: pageW
    }
  );
  // update with id (for future scanning)
  semanticsFrame.name = `${semanticLayerName} | ${semanticsFrame.id}`;

  // add within main Accessibility layer
  mainFrame.appendChild(semanticsFrame);

  // grab main page a11y scan was for
  const ifExists = parent.children.filter((c) => c.name === saniName);
  const originalPage = ifExists[0];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Semantics',
      Semantics: {
        id: semanticsFrame.id
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
  const { bounds, semantic, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-semantic::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Semantics exists already?
  const semanticsFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    semanticLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  semanticsFrame.name = `${semanticLayerName} | ${semanticsFrame.id}`;

  // create semantic layer
  const semanticBlock = createTransparentFrame({
    name: `Semantic: ${semantic}`,
    x: 0,
    y: 0,
    width: 300,
    height: 100
  });

  const semanticBlockName = `Semantic: ${semantic} | ${semanticBlock.id}`;
  semanticBlock.name = semanticBlockName;

  // Create rectangle / background
  const rectNode = figmaLayer.createRectangle({
    name: `Semantic Area: ${semantic}`,
    height: 100,
    width: 300
  });

  rectNode.constraints = {
    horizontal: 'SCALE',
    vertical: 'SCALE'
  };
  rectNode.x = 0;
  rectNode.y = 0;

  // add rectangle within Semantic layer
  semanticBlock.appendChild(rectNode);

  // create annotation label
  const semanticDisplay = utils.capitalize(semantic).replace(/-/g, ' ');

  // Create label background with auto-layout
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
  // Do NOT have it scale with the surrounding frame
  labelFrame.constraints = {
    horizontal: 'MIN',
    vertical: 'MIN'
  };

  // create annotation name for label
  const labelNode = figma.createText();
  labelNode.name = `Semantic Name: ${semanticDisplay}`;
  labelNode.fontSize = 15;
  labelNode.characters = semanticDisplay;
  labelNode.fills = [{ type: 'SOLID', color: colors.white }];
  labelNode.fontName = { family: 'Roboto', style: 'Bold' };

  // Add label node to frame
  labelFrame.appendChild(labelNode);

  // Add label frame to semantic block
  semanticBlock.appendChild(labelFrame);

  // Add semantic block to greater semantics frame
  semanticsFrame.appendChild(semanticBlock);

  // de-selection of layer on Figma document
  figma.currentPage.selection = [];

  // add semantics frame within main Accessibility layer
  mainFrame.appendChild(semanticsFrame);

  // set selection of new semantic layer
  figma.currentPage.selection = [semanticBlock];

  // let the user know rectangle has been added
  figma.notify(`${semantic} overlay added successfully!`, {
    timeout: config.notifyTime
  });

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'semantic-confirmed',
    data: {
        semanticId: semanticBlock.id,
        semanticType: semantic,
        semanticName: semanticBlockName
    }
  });
};

export const completed = (msg) => {
  const { page, pageType } = msg;

  // main data and setup
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
  const semanticsLayerName = 'Semantics Layer';

  // does Accessibility layer exists already?
  const accessExists = utils.checkIfChildNameExists(mainPageId, mainLayerName);

  let mainFrame = null;

  // if Accessibility layer doesn't exist
  if (accessExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-semantic::accessExists)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }
  // already exists, grab by Node ID
  mainFrame = figma.getNodeById(accessExists);

  // does Semantics exists already?
  const semanticsExists = utils.checkIfChildNameExists(
    mainFrame.id,
    semanticsLayerName
  );

  // if Semantics layer doesn't exist
  if (semanticsExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-semantic::semanticsExists)', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // already exists, grab by Node ID
  const semanticsFrame = figma.getNodeById(semanticsExists);

  // grab main page a11y scan was for
  const { parent } = mainFrame;
  const [originalPage] = parent.children.filter((c) => c.name === saniName);

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Semantics',
      Semantics: {
        id: semanticsFrame.id
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
  const { id, value, semanticType } = msg;

  // get semantic
  const semanticNode = figma.getNodeById(id);

  // prevent memory leak (if not found, early return)
  if (semanticNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred: please restart plugin if this continues.', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // format some values
  const semanticTypeCap = utils.capitalize(semanticType);

  // set width of label background to account for new length
  const newValue = utils.capitalize(value.toLowerCase());
  const newLabel = `${semanticTypeCap}: ${newValue}`;
  const widthMin = 52;
  const labelWidth = Math.floor(newLabel.length * 9.5);
  const newLabelWidth = labelWidth < widthMin ? widthMin : labelWidth;

  const updateName = (node) => {
    const semanticNameNode = figma.getNodeById(node.id);
    semanticNameNode.characters = newLabel;
  };

  // loop through children and make changes as needed
  semanticNode.children.map((childNode) => {
    const { name } = childNode;
    const lowerName = name.toLowerCase();

    if (lowerName === 'label background') {
      if (childNode.children.length > 0) {
        // new version: label is child of background frame
        const labelChild = childNode.children[0];
        const labelName = labelChild.name.toLowerCase();
        if (labelName.includes('semantic name:')) {
          updateName(labelChild);
        }
      } else {
        // old version compatability: resize label based on new width
        childNode.resize(newLabelWidth, 32);
      }
    } else if (lowerName.includes('semantic name:')) {
      // old version compatiability: update new label
      updateName(childNode);
    }

    // update name of parent layer for future scanning/pick up where you left off
    semanticNode.name = `Semantic: ${semanticType}:${newValue} | ${semanticNode.id}`;

    return null;
  });
};

export default {
  noSemantics,
  add,
  completed,
  updateWithLabel
};
