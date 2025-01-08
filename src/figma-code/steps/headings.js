import { colors, figmaLayer, utils } from '../../constants';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

const headingsLayerName = 'Headings Layer';

export const noHeadings = async (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (no-heading::mainPageNodeNotFound)', {
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
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does Headings exists already?
  const headingsExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  // if Headings exist, delete it
  if (headingsExists !== null) {
    const oldHeadingsFrame = await figma.getNodeByIdAsync(headingsExists);
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldHeadingsFrame.remove();
  }

  // does Headings exists already?
  const headingsFrame = await utils.frameExistsOrCreate(
    mainFrame.id,
    headingsLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  headingsFrame.name = `${headingsLayerName} | ${headingsFrame.id}`;

  // add within main Accessibility layer
  mainFrame.appendChild(headingsFrame);

  // grab main page a11y scan was for
  const [originalPage] = parent.children.filter((c) => c.name === saniName);

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Headings',
      Headings: {
        id: headingsFrame.id,
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

export const listener = async (msg) => {
  const { shouldListen = false, defaultHeadingType = 2 } = msg;

  // de-select all before start of listening
  figma.currentPage.selection = [];

  if (shouldListen) {
    // create and select a text node to make text selection easier
    const textNode = figma.createText();
    textNode.name = 'cursor-focus-node';
    figma.currentPage.appendChild(textNode);
    figma.currentPage.selectedTextRange = { node: textNode, start: 0, end: 0 };
  } else {
    // remove temporary text node if found
    const textNode = await utils.checkIfChildNameExists(
      figma.currentPage.id,
      'cursor-focus-node'
    );
    if (textNode) {
      textNode.remove();
    }
  }

  // listen flag: see figma.on('selectionchange')
  const newListenForHeadings = shouldListen;
  const newDefaultHeadingType = defaultHeadingType;

  return { newListenForHeadings, newDefaultHeadingType };
};

const getHeadingBlockName = ({ pageType, headingType, headingTitle, id }) =>
  `Heading${
    pageType === 'web' ? `: ${headingType.trim()}` : ''
  } | ${headingTitle.trim()} | ${id.trim()}`;

const createHeadingFrameInFigma = ({
  pageType,
  pageX,
  pageY,
  headingBounds,
  headingsFrame,
  headingTitle,
  headingType,
  id
}) => {
  const contextX = headingBounds.x - pageX;
  const contextY = headingBounds.y - pageY;

  const { blue, white } = colors;

  // create heading outline
  const headingOutline = figmaLayer.createRectangle({
    name: 'Heading outline',
    x: contextX - 8,
    y: contextY - 16,
    height: headingBounds.height + 32,
    width: headingBounds.width + 16,
    strokeColor: blue,
    opacity: 0,
    radiusMixed: [{ topLeftRadius: 0 }]
  });

  // start of group array
  const toGroupArray = [headingOutline];

  // create annotation label
  const label = figmaLayer.createRectangle({
    name: 'Label Background',
    height: 29,
    width: pageType === 'web' ? 40 : 29,
    x: contextX - 8,
    y: contextY - 42,
    fillColor: blue,
    stroke: 0,
    opacity: 1,
    radius: 8,
    radiusMixed: [{ bottomLeftRadius: 0 }, { bottomRightRadius: 0 }]
  });
  toGroupArray.push(label);

  // create annotation name for label
  const numberNode = figma.createText();
  numberNode.fontSize = 18;

  if (pageType === 'web') {
    const headingDisplay = utils.capitalize(headingType);
    numberNode.name = `Heading Type: ${headingType}`;
    numberNode.characters = headingDisplay;
  } else {
    // mobile headings are not numbered
    numberNode.name = 'Heading';
    numberNode.characters = 'H';
  }

  numberNode.fills = [{ type: 'SOLID', color: white }];
  numberNode.fontName = { family: 'Roboto', style: 'Bold' };
  numberNode.x = contextX;
  numberNode.y = contextY - 38;
  toGroupArray.push(numberNode);

  const headingsBlock = figma.group(toGroupArray, headingsFrame);
  const headingsBlockName = getHeadingBlockName({
    pageType,
    id,
    headingType,
    headingTitle
  });
  headingsBlock.name = headingsBlockName;
  headingsBlock.resizeWithoutConstraints(
    headingBounds.width,
    headingBounds.height
  );
  headingsBlock.expanded = false;
};

export const addHeading = async (msg) => {
  const { heading, page, pageType } = msg;
  const { bounds } = page;
  const { height: pageH, width: pageW } = bounds;

  // get main A11y frame if it exists (or create it)
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  const headingsExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  let headingsFrame;

  // does Headings frame exists already?
  if (!headingsExists) {
    // create the Headings frame if not
    headingsFrame = figmaLayer.createTransparentFrame({
      name: headingsLayerName,
      height: pageH,
      width: pageW
    });
    // update with id (for future scanning)
    headingsFrame.name = `${headingsLayerName} | ${headingsFrame.id}`;
    mainFrame.appendChild(headingsFrame);
  } else {
    // grab if it does
    headingsFrame = await figma.getNodeByIdAsync(headingsExists);
  }

  const {
    id,
    bounds: headingBounds,
    title: headingTitle,
    type: headingType
  } = heading;

  createHeadingFrameInFigma({
    pageType,
    pageX: 0,
    pageY: 0,
    headingBounds,
    headingsFrame,
    headingTitle,
    headingType,
    id
  });
};

export const removeHeading = async (msg) => {
  const { heading, page, pageType } = msg;

  const { id, title: headingTitle, type: headingType } = heading;

  // get main A11y frame
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // make sure that headings frame exists (it should)
  const headingsFrameId = await utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  if (headingsFrameId) {
    const headingsFrame = await figma.getNodeByIdAsync(headingsFrameId);
    const headingsBlockName = getHeadingBlockName({
      headingTitle,
      headingType,
      pageType,
      id
    });

    // Find the specific headings block and remove
    const headingBlock = headingsFrame.children.find(
      (child) => child.name === headingsBlockName
    );

    if (headingBlock) {
      headingBlock.remove();
    }
  }
};

export const confirm = async (msg) => {
  const { headings, page, pageType } = msg;

  const { bounds, mainPageId, name } = page;
  const { x: pageX, y: pageY, height: pageH, width: pageW } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does Headings exists already?
  const headingsExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  // if Headings exist, delete it
  if (headingsExists !== null) {
    const oldHeadingsFrame = await figma.getNodeByIdAsync(headingsExists);
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldHeadingsFrame.remove();
  }

  // create the Headings frame
  const headingsFrame = figmaLayer.createTransparentFrame({
    name: headingsLayerName,
    height: pageH,
    width: pageW
  });
  // update with id (for future scanning)
  headingsFrame.name = `${headingsLayerName} | ${headingsFrame.id}`;

  const headingsArray = Object.values(headings);
  for (let i = 0; i < headingsArray.length; i += 1) {
    const heading = headingsArray[i];
    const {
      id,
      bounds: headingBounds,
      title: headingTitle,
      type: headingType
    } = heading;

    createHeadingFrameInFigma({
      pageType,
      pageX,
      pageY,
      headingBounds,
      headingTitle,
      headingType,
      headingsFrame,
      id
    });
  }

  // add within main Accessibility layer
  mainFrame.appendChild(headingsFrame);

  // de-selection layer on Figma document
  figma.currentPage.selection = [];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Headings',
      Headings: {
        id: headingsFrame.id,
        existingData: headings
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
  const notifyMsg = headingsExists !== null ? 'updated' : 'added';
  figma.notify(`Headings layer has been ${notifyMsg} successfully!`, {
    timeout: config.notifyTime
  });
};

export default { addHeading, noHeadings, listener, confirm, removeHeading };
