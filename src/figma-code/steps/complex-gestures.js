import { colors, figmaLayer, utils } from '../../constants';
import { createTransparentFrame } from '../../constants/figma-layer';
import gestureTypes from '../../data/gesture-types';
import config from '../config';
import {
  createAnnotationFrame,
  createAnnotationFrameTitleText,
  createAnnotationInfoFrame,
  createAnnotationLabelValueRow,
  createAnnotationNumberFrame,
  createInnerAnnotationFrame,
  findAndRemovePreviousAnnotationFrame,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from '../frame-helpers';

const complexGesturesLayerName = 'Complex gestures Layer';
const complexGesturesAnnotationLayerName = 'Complex gesture Annotations';

export const noComplexGestures = (msg) => {
  const { bounds, name, pageId, page, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (no-complex-gestures::mainPageNodeNotFound)', {
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

  // does Complex gestures exist already?
  const complexGesturesFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    complexGesturesLayerName,
    {
      height: pageH,
      width: pageW
    }
  );
  // update with id (for future scanning)
  complexGesturesFrame.name = `${complexGesturesLayerName} | ${complexGesturesFrame.id}`;

  // add within main Accessibility layer
  mainFrame.appendChild(complexGesturesFrame);

  // in case gestures were annotated then removed, remove the complex gesture
  // annotations layer if it exists
  const mainAnnotationsFrame = getOrCreateMainAnnotationsFrame({
    mainFrame,
    page: { bounds }
  });

  findAndRemovePreviousAnnotationFrame({
    mainAnnotationsFrame,
    layerName: complexGesturesAnnotationLayerName
  });

  if (mainAnnotationsFrame.children.length === 0) {
    mainAnnotationsFrame.remove();
  }

  // grab main page a11y scan was for
  const ifExists = parent.children.filter((c) => c.name === saniName);
  const originalPage = ifExists[0];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Complex gestures',
      'Complex gestures': {
        id: complexGesturesFrame.id
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
  const { bounds, gesture, number, page, pageId, pageType } = msg;

  const mainPageNode = figma.getNodeById(pageId);

  // node not found
  if (mainPageNode === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (add-gesture::mainPageNodeNotFound)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }

  // main data and setup
  const { height: pageH, width: pageW } = bounds;

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does Complex gestures exist already?
  const gestureFrame = utils.frameExistsOrCreate(
    mainFrame.id,
    complexGesturesLayerName,
    {
      height: pageH,
      width: pageW
    }
  );

  // update with id (for future scanning)
  gestureFrame.name = `${complexGesturesLayerName} | ${gestureFrame.id}`;

  // create gesture overlay layer
  const gestureBlock = createTransparentFrame({
    name: `Gesture Area: ${gesture}`,
    x: 0,
    y: 0,
    height: 100,
    width: 200
  });

  const gestureBlockName = `Gesture: ${gesture} | ${gestureBlock.id}`;
  gestureBlock.name = gestureBlockName;

  const rectNode = figmaLayer.createRectangle({
    name: `Gesture Area: ${gesture}`,
    height: 100,
    width: 200,
    x: 0,
    y: 0,
    strokeColor: colors.purple
  });
  rectNode.constraints = {
    horizontal: 'SCALE',
    vertical: 'SCALE'
  };
  gestureBlock.appendChild(rectNode);

  // create annotation label background
  const labelBackground = figmaLayer.createCircle({
    name: 'Label Background',
    x: -13,
    y: -13,
    size: 26,
    fillColor: colors.purple
  });

  labelBackground.constraints = {
    horizontal: 'MIN',
    vertical: 'MIN'
  };
  gestureBlock.appendChild(labelBackground);

  // create annotation label text
  const numberNode = figma.createText();
  numberNode.name = `Gesture Name: ${gesture}`;
  numberNode.fontSize = 15;
  numberNode.characters = number;
  numberNode.fills = [{ type: 'SOLID', color: colors.white }];
  numberNode.fontName = { family: 'Roboto', style: 'Bold' };
  numberNode.x = -4;
  numberNode.y = -9;
  gestureBlock.appendChild(numberNode);

  // add within Gesture layer
  gestureFrame.appendChild(gestureBlock);

  // add within main Accessibility layer
  mainFrame.appendChild(gestureFrame);

  // set selection of new Rectangle layer
  figma.currentPage.selection = [gestureBlock];

  // let the user know rectangle has been added
  figma.notify(`${gesture} overlay added successfully!`, {
    timeout: config.notifyTime
  });

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: 'gesture-confirmed',
    data: {
      id: gestureBlock.id,
      gestureType: gesture,
      name: gestureBlockName
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

  // does Accessibility layer exists already?
  const accessExists = utils.checkIfChildNameExists(mainPageId, mainLayerName);

  let mainFrame = null;

  // if Accessibility layer doesn't exist
  if (accessExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-gesture::accessExists)', {
      error: true,
      timeout: config.notifyTime
    });
    return;
  }
  // already exists, grab by Node ID
  mainFrame = figma.getNodeById(accessExists);

  // does Complex gestures exist already?
  const complexGesturesExists = utils.checkIfChildNameExists(
    mainFrame.id,
    complexGesturesLayerName
  );

  // if Complex gestures layer doesn't exist
  if (complexGesturesExists === null) {
    // let the user know an error occurred
    figma.notify('Error occurred (completed-gesture::gesturesExists)', {
      error: true,
      timeout: config.notifyTime
    });

    return;
  }

  // already exists, grab by Node ID
  const complexGesturesFrame = figma.getNodeById(complexGesturesExists);

  // grab main page a11y scan was for
  const [originalPage] = parent.children.filter((c) => c.name === saniName);

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Complex gestures',
      'Complex gestures': {
        id: complexGesturesFrame.id
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

const createGestureAnnotationInfoFrame = ({ type, label }) => {
  // create gesture info frame with vertical auto layout
  const gestureInfoFrame = createAnnotationInfoFrame({ name: 'Gesture info' });

  // add the type annotation
  gestureInfoFrame.appendChild(
    createAnnotationLabelValueRow({
      rowName: 'Gesture type',
      label: 'Type:',
      value: `Alternative to ${gestureTypes[type].label}`
    })
  );

  // add the action annotation
  gestureInfoFrame.appendChild(
    createAnnotationLabelValueRow({
      rowName: 'Gesture action',
      label: 'Action label:',
      value: label
    })
  );

  return gestureInfoFrame;
};

const createGestureAnnotation = ({ number, id, label, type }) => {
  // create gesture annotation frame with horizontal auto-layout
  const gestureAnnotationFrame = createInnerAnnotationFrame({
    annotationBlockName: 'Complex gesture',
    number,
    id
  });

  // create number label frame
  const gestureNumberFrame = createAnnotationNumberFrame({
    number,
    fillColor: colors.purple
  });
  gestureAnnotationFrame.appendChild(gestureNumberFrame);

  // create info frame
  const gestureInfoFrame = createGestureAnnotationInfoFrame({ type, label });
  gestureAnnotationFrame.appendChild(gestureInfoFrame);

  return gestureAnnotationFrame;
};

const createComplexGesturesAnnotationFrame = () => {
  const annotationFrame = createAnnotationFrame({
    name: complexGesturesAnnotationLayerName
  });
  const annotationTitle = createAnnotationFrameTitleText({
    title: 'Complex gestures'
  });
  annotationFrame.appendChild(annotationTitle);

  return annotationFrame;
};

export const annotateComplexGestures = (msg) => {
  const { gestures, page, pageType } = msg;

  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // get current complex gestures frame (it should exist)
  const complexGesturesFrameId = utils.checkIfChildNameExists(
    mainFrame.id,
    complexGesturesLayerName
  );
  const complexGesturesFrame = figma.getNodeById(complexGesturesFrameId);

  // get or create main annotations frame
  const mainAnnotationsFrame = getOrCreateMainAnnotationsFrame({
    mainFrame,
    page
  });

  // check for existing annotation frame and remove if found
  const oldAnnotationFrameId = findAndRemovePreviousAnnotationFrame({
    mainAnnotationsFrame,
    layerName: complexGesturesAnnotationLayerName
  });

  const annotationFrame = createComplexGesturesAnnotationFrame();

  // for each gesture...
  for (let i = 0; i < gestures.length; i += 1) {
    const { label, type, id } = gestures[i];
    const number = i + 1;

    // update the label on the gesture block to match the number
    // that will be added to the annotation block. This is in
    // case gestures were removed since creation
    const gestureBlock = complexGesturesFrame.children.find(
      (complexGesturesChild) => complexGesturesChild.id === id
    );
    const labelNode = gestureBlock?.children.find(
      (node) => node.type === 'TEXT' && node.name.startsWith('Gesture Name:')
    );
    if (labelNode) {
      labelNode.characters = `${number}`;
    }

    // create and add gesture annotation to annotation frame
    annotationFrame.appendChild(
      createGestureAnnotation({
        number,
        id,
        label,
        type
      })
    );
  }

  // add Annotation frame to main Accessibility annotations frame
  mainAnnotationsFrame.insertChild(0, annotationFrame);

  // let the user know layer(s) have been added/updated
  const notifyMsg = oldAnnotationFrameId !== null ? 'updated' : 'added';
  figma.notify(
    `Complex gesture annotations have been ${notifyMsg} successfully!`,
    {
      timeout: config.notifyTime
    }
  );
};

export default {
  annotateComplexGestures,
  noComplexGestures,
  add,
  completed
};
