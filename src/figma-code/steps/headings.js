import { colors, figmaLayer, utils } from '../../constants';
import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

const headingsLayerName = 'Headings Layer';

export const noHeadings = (msg) => {
  const { bounds, name, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

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
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Headings exists already?
  const headingsExists = utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  // if Headings exist, delete it
  if (headingsExists !== null) {
    const oldHeadingsFrame = figma.getNodeById(headingsExists);
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldHeadingsFrame.remove();
  }

  // does Headings exists already?
  const headingsFrame = utils.frameExistsOrCreate(
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
        id: headingsFrame.id
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

export const listener = (msg) => {
  const { page, pageType, shouldListen = false, defaultHeadingType = 2 } = msg;

  // de-select all before start of listening
  figma.currentPage.selection = [];

  if (shouldListen) {
    // Create and select a text node to make text selection easier
    const textNode = figma.createText();
    textNode.name = 'cursor-focus-node';
    figma.currentPage.appendChild(textNode);
    figma.currentPage.selectedTextRange = { node: textNode, start: 0, end: 0 };
  } else {
    // Remove temporary text node if found
    const textNode = utils.checkIfChildNameExists(
      figma.currentPage.id,
      'cursor-focus-node'
    );
    if (textNode) {
      textNode.remove();
    }
  }

  const { mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;

  // get main A11y frame if it exists
  const mainFrameId = utils.checkIfChildNameExists(mainPageId, mainLayerName);

  // if found, toggle visible
  if (mainFrameId !== null) {
    // if start of listening, hide main A11y frame so user can select headings
    const mainFrame = figma.getNodeById(mainFrameId);
    mainFrame.visible = !shouldListen;
  }

  // listen flag: see figma.on('selectionchange')
  const newListenForHeadings = shouldListen;
  const newDefaultHeadingType = defaultHeadingType;

  return { newListenForHeadings, newDefaultHeadingType };
};

export const confirm = (msg) => {
  const { headings, page, pageType } = msg;

  // colors
  const { blue, white } = colors;

  const { bounds, mainPageId, name } = page;
  const { x: pageX, y: pageY, height: pageH, width: pageW } = bounds;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Headings exists already?
  const headingsExists = utils.checkIfChildNameExists(
    mainFrame.id,
    headingsLayerName
  );

  // if Headings exist, delete it
  if (headingsExists !== null) {
    const oldHeadingsFrame = figma.getNodeById(headingsExists);
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

    const contextX = headingBounds.x - pageX;
    const contextY = headingBounds.y - pageY;

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
      // Mobile headings are not numbered
      numberNode.name = 'Heading';
      numberNode.characters = 'H';
    }

    numberNode.fills = [{ type: 'SOLID', color: white }];
    numberNode.fontName = { family: 'Roboto', style: 'Bold' };
    numberNode.x = contextX;
    numberNode.y = contextY - 38;
    toGroupArray.push(numberNode);

    const headingsBlock = figma.group(toGroupArray, headingsFrame);
    const headingsBlockName = `Heading${
      pageType === 'web' ? `: ${headingType}` : ''
    } | ${headingTitle} | ${id}`;
    headingsBlock.name = headingsBlockName;
    headingsBlock.resizeWithoutConstraints(
      headingBounds.width,
      headingBounds.height
    );
    headingsBlock.expanded = false;
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
        id: headingsFrame.id
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

export default { noHeadings, listener, confirm };
