import { colors, figmaLayer, utils } from '../constants';
import config from './config';

function getMainA11yLayerName({ pageName, pageType }) {
  const saniName = utils.sanitizeName(pageName);
  const pageTypeCap = utils.capitalize(pageType);

  return `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;
}

function getOrCreateMainA11yFrame({ page, pageType }) {
  // main data and setup
  const { bounds, mainPageId, name: pageName } = page;
  const { x: pageX, y: pageY, height: pageH, width: pageW } = bounds;

  // top layer namings
  const mainLayerName = getMainA11yLayerName({ pageName, pageType });

  const mainFrame = utils.frameExistsOrCreate(mainPageId, mainLayerName, {
    x: pageX,
    y: pageY,
    height: pageH,
    width: pageW + config.annotationWidth
  });

  return mainFrame;
}

function getOrCreateMainAnnotationsFrame({ mainFrame, page }) {
  const { bounds } = page;
  const { height: pageH, width: pageW } = bounds;
  const annotationLayerName = 'Accessibility annotations Layer';

  const mainAnnotationsFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    annotationLayerName,
    {
      height: pageH,
      x: pageW + 32,
      width: config.annotationWidth - 32
    }
  );
  // update with id (for future scanning)
  mainAnnotationsFrame.name = `${annotationLayerName} | ${mainAnnotationsFrame.id}`;

  // Set up vertical auto-layout so that it looks okay
  //   with any number of annotations added
  mainAnnotationsFrame.fills = [
    { type: 'SOLID', color: colors.grey, opacity: 1 }
  ];
  mainAnnotationsFrame.layoutMode = 'VERTICAL';
  mainAnnotationsFrame.itemSpacing = 4;

  return mainAnnotationsFrame;
}

function findAndRemovePreviousAnnotationFrame({
  mainAnnotationsFrame,
  layerName
}) {
  const prevAnnotationFrameId = utils.checkIfChildNameExists(
    mainAnnotationsFrame.id,
    layerName,
    false
  );
  if (prevAnnotationFrameId !== null) {
    const oldAnnotationFrame = figma.getNodeById(prevAnnotationFrameId);
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

  // Give it vertical auto-layout formatting
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

function createAnnotationLabelValueRow({ rowName, label, value }) {
  const labelValueFrame = figmaLayer.createTransparentFrame({
    name: rowName,
    height: 1,
    width: 1
  });
  labelValueFrame.layoutMode = 'HORIZONTAL';
  labelValueFrame.itemSpacing = 4;
  labelValueFrame.counterAxisSizingMode = 'AUTO';
  labelValueFrame.counterAxisAlignItems = 'MAX';

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
  labelValueFrame.appendChild(gestureTypeValue);

  return labelValueFrame;
}

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
