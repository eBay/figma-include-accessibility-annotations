import { colors, figmaLayer, utils } from '@/constants';
import config from '@/figma-code/config';

function getMainA11yLayerName({ pageName, pageType }) {
  const saniName = utils.sanitizeName(pageName);
  const pageTypeCap = utils.capitalize(pageType);

  return `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
}

async function getOrCreateMainA11yFrame({ page, pageType }) {
  // main data and setup
  const { bounds, mainPageId, name: pageName } = page;
  const { x: pageX, y: pageY, height: pageH, width: pageW } = bounds;

  // top layer namings
  const mainLayerName = getMainA11yLayerName({ pageName, pageType });

  const mainFrame = await utils.frameExistsOrCreate(mainPageId, mainLayerName, {
    x: pageX,
    y: pageY,
    height: pageH,
    width: pageW + config.annotationWidth
  });

  return mainFrame;
}

async function getOrCreateMainAnnotationsFrame({ mainFrame, page }) {
  const { bounds } = page;
  const { height: pageH, width: pageW } = bounds;
  const paddingMain = 20;

  const mainAnnoFrame = await utils.frameExistsOrCreate(
    mainFrame.id,
    config.a11yAnnotationLayerKeyV2,
    {
      height: pageH,
      x: pageW + 32,
      width: config.annotationWidth - 32
    },
    false
  );

  // set up vertical auto-layout so that it looks okay
  // with any number of annotations added
  mainAnnoFrame.cornerRadius = 16;
  mainAnnoFrame.fills = [{ type: 'SOLID', color: colors.white, opacity: 1 }];
  mainAnnoFrame.strokes = [{ type: 'SOLID', color: colors.coolGrey }];
  mainAnnoFrame.strokeWeight = 1;
  mainAnnoFrame.layoutMode = 'VERTICAL';
  mainAnnoFrame.counterAxisSizingMode = 'FIXED';
  mainAnnoFrame.primaryAxisSizingMode = 'AUTO';
  mainAnnoFrame.itemSpacing = 16;
  mainAnnoFrame.paddingLeft = paddingMain;
  mainAnnoFrame.paddingRight = paddingMain;
  mainAnnoFrame.paddingBottom = paddingMain;
  mainAnnoFrame.paddingTop = paddingMain;

  return mainAnnoFrame;
}

/**
 * finds and removes existing annotation layer for the step using the layer name.
 *
 * @param {object} mainAnnotationsFrame - the parent annotations frame
 * @param {string} layerName - the name of the annotations layer for the step
 * @returns - frame id of the annotation layer removed, if found
 */
async function findAndRemovePreviousAnnotationFrame({
  mainAnnotationsFrame,
  layerName
}) {
  const prevAnnotationFrameId = await utils.checkIfChildNameExists(
    mainAnnotationsFrame.id,
    layerName,
    false
  );

  if (prevAnnotationFrameId !== null) {
    const oldAnnotationFrame = await figma.getNodeByIdAsync(
      prevAnnotationFrameId
    );
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldAnnotationFrame.remove();
  }

  return prevAnnotationFrameId;
}

function createAnnotationFrame({ name }) {
  const annotationFrame = figmaLayer.createTransparentFrame({
    name,
    height: 1,
    width: config.annotationWidth - 32
  });

  // give it vertical auto-layout formatting
  annotationFrame.expanded = false;
  annotationFrame.layoutMode = 'VERTICAL';
  annotationFrame.counterAxisSizingMode = 'FIXED';
  annotationFrame.primaryAxisSizingMode = 'AUTO';
  annotationFrame.itemSpacing = 12;
  annotationFrame.paddingLeft = 20;
  annotationFrame.paddingRight = 20;
  annotationFrame.paddingBottom = 20;
  annotationFrame.paddingTop = 20;

  return annotationFrame;
}

function createAnnotationFrameTitleText({ title }) {
  const annotationTitle = figma.createText();
  annotationTitle.name = 'Annotation title';
  annotationTitle.fontSize = 16;
  annotationTitle.characters = title;
  annotationTitle.fills = [{ type: 'SOLID', color: colors.black }];
  annotationTitle.fontName = { family: 'Roboto', style: 'Bold' };

  return annotationTitle;
}

/**
 * creates and returns an annotation number label for use within an annotation
 * frame. Label is circular, with color background and white text.
 *
 * @param {number} number - The number to use for the annotation number label
 * @param {string} fillColor - The background color of the number label
 * @returns - Annotation number label
 */
function createAnnotationNumberFrame({ number, fillColor }) {
  // create annotation number frame
  const annotationNumberFrame = figmaLayer.createTransparentFrame({
    width: 20,
    height: 20,
    name: 'Annotation number'
  });

  // create annotation circle
  const circleNode = figmaLayer.createCircle({
    name: 'Circle',
    size: 20,
    fillColor,
    stroke: 0
  });
  annotationNumberFrame.appendChild(circleNode);

  // create annotation number
  const numberNode = figma.createText();
  const numberString = number.toString();
  numberNode.name = `Number ${number}`;
  numberNode.fontSize = 10;
  numberNode.characters = numberString;
  numberNode.fills = [{ type: 'SOLID', color: colors.white }];
  numberNode.fontName = { family: 'Roboto', style: 'Bold' };
  const xTextAdjustment = numberString.length === 1 ? 7 : 4;
  const yTextAdjustment = 4;
  numberNode.x = xTextAdjustment;
  numberNode.y = yTextAdjustment;
  annotationNumberFrame.appendChild(numberNode);

  return annotationNumberFrame;
}

/**
 * create annotation info frame with vertical auto-layout
 *
 * @param {string} name - desired name of the info frame
 * @returns Annotation info frame formatted with vertical auto-layout
 */
function createAnnotationInfoFrame({ name }) {
  const annotationInfoFrame = figmaLayer.createTransparentFrame({
    name,
    height: 1,
    width: 1
  });
  annotationInfoFrame.layoutMode = 'VERTICAL';
  annotationInfoFrame.itemSpacing = 4;
  annotationInfoFrame.counterAxisSizingMode = 'AUTO';

  return annotationInfoFrame;
}

/**
 * creates a Figma frame with horizontal autolayout that contains two
 * text nodes. The first text node is the bolded label, and the second
 * text nod is the value.
 *
 * @param {string} rowName - Name of returned Figma frame
 * @param {string} label - Characters for the label text node in Figma
 * @param {string} value - Characters for the value text node in Figma
 * @returns Figma frame containing label and value text nodes side by side.
 */
function createAnnotationLabelValueRow({ rowName, label, value }) {
  const labelValueFrame = figmaLayer.createTransparentFrame({
    name: rowName,
    height: 1,
    width: 1
  });
  labelValueFrame.layoutMode = 'HORIZONTAL';
  labelValueFrame.itemSpacing = 4;
  labelValueFrame.counterAxisSizingMode = 'AUTO';
  labelValueFrame.counterAxisAlignItems = 'MIN';
  labelValueFrame.primaryAxisSizingMode = 'AUTO';

  const gestureTypeLabel = figma.createText();
  gestureTypeLabel.name = `${rowName} label`;
  gestureTypeLabel.fontSize = 14;
  gestureTypeLabel.characters = label;
  gestureTypeLabel.fills = [{ type: 'SOLID', color: colors.black }];
  gestureTypeLabel.fontName = { family: 'Roboto', style: 'Bold' };
  labelValueFrame.appendChild(gestureTypeLabel);

  // create value
  const gestureTypeValue = figma.createText();
  gestureTypeValue.name = `${rowName} value`;
  gestureTypeValue.fontSize = 14;
  gestureTypeValue.characters = value;
  gestureTypeValue.fills = [{ type: 'SOLID', color: colors.black }];
  gestureTypeValue.fontName = { family: 'Roboto', style: 'Regular' };

  // set width and enable text wrapping
  gestureTypeValue.resizeWithoutConstraints(326, gestureTypeValue.height);
  gestureTypeValue.textAutoResize = 'HEIGHT';

  labelValueFrame.appendChild(gestureTypeValue);

  return labelValueFrame;
}

/**
 * create inner annotation frame with horizontal auto-layout
 *
 * @param {string} annotationBlockName
 * @param {number} number - index of the frame
 * @param {string} id - id of the alt text object
 * @returns Annotation frame formatted with horizontal auto-layout
 */
function createInnerAnnotationFrame({ annotationBlockName, number, id }) {
  const innerAnnotationFrame = figmaLayer.createTransparentFrame({
    name: `${annotationBlockName} Block ${number} | ${id}`,
    height: 1,
    width: 1
  });
  innerAnnotationFrame.layoutMode = 'HORIZONTAL';
  innerAnnotationFrame.counterAxisSizingMode = 'AUTO';
  innerAnnotationFrame.itemSpacing = 8;
  innerAnnotationFrame.paddingTop = 6;
  innerAnnotationFrame.paddingBottom = 6;

  return innerAnnotationFrame;
}

const findDescendentOfFrame = ({ frame, descendantNames = [] }) => {
  if (!frame) return null;

  if (descendantNames.length === 0) {
    return frame;
  }

  return findDescendentOfFrame({
    frame: frame.children?.find((child) => child.name === descendantNames[0]),
    descendantNames: descendantNames.slice(1, descendantNames.length)
  });
};

export {
  createAnnotationFrame,
  createAnnotationLabelValueRow,
  createAnnotationInfoFrame,
  createAnnotationNumberFrame,
  createAnnotationFrameTitleText,
  createInnerAnnotationFrame,
  findAndRemovePreviousAnnotationFrame,
  findDescendentOfFrame,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame,
  getMainA11yLayerName
};
