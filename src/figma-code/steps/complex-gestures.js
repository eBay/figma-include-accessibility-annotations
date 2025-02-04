import { colors, figmaLayer, utils } from '@/constants';
import { createTransparentFrame } from '@/constants/figma-layer';
import gestureTypes from '@/data/gesture-types';
import config from '@/figma-code/config';
import {
  createAnnotationInfoFrame,
  createAnnotationLabelValueRow,
  createAnnotationNumberFrame,
  createInnerAnnotationFrame,
  findAndRemovePreviousAnnotationFrame,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from '@/figma-code/frame-helpers';

const complexGesturesLayerName = 'Complex gestures Layer';
const complexGesturesAnnotationLayerName = 'Complex gesture Annotations';

export const noComplexGestures = async (msg) => {
  const { bounds, name, pageId, page, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

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
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does Complex gestures exist already?
  const complexGesturesFrame = await utils.frameExistsOrCreate(
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
  const mainAnnotationsFrame = await getOrCreateMainAnnotationsFrame({
    mainFrame,
    page: { bounds }
  });

  await findAndRemovePreviousAnnotationFrame({
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

export const add = async (msg) => {
  const { bounds, gesture, number, page, pageId, pageType } = msg;

  const mainPageNode = await figma.getNodeByIdAsync(pageId);

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
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });
  const mainAnnotationsFrame = await getOrCreateMainAnnotationsFrame({
    mainFrame,
    page
  });

  // does Complex gestures exist already?
  const gestureFrame = await utils.frameExistsOrCreate(
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

  figma.viewport.scrollAndZoomIntoView([mainPageNode, mainAnnotationsFrame]);
};

export const completed = async (msg) => {
  const { page, pageType } = msg;

  // main data and setup
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);
  const pageTypeCap = utils.capitalize(pageType);
  const mainLayerName = `${saniName} ${config.a11ySuffix} | ${pageTypeCap}`;

  // does Accessibility layer exists already?
  const accessExists = await utils.checkIfChildNameExists(
    mainPageId,
    mainLayerName
  );

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
  mainFrame = await figma.getNodeByIdAsync(accessExists);

  // does Complex gestures exist already?
  const complexGesturesExists = await utils.checkIfChildNameExists(
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
  const complexGesturesFrame = await figma.getNodeByIdAsync(
    complexGesturesExists
  );

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

export const annotateComplexGestures = async (msg) => {
  const { gestures, page, pageType } = msg;

  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // get current complex gestures frame (it should exist)
  const complexGesturesFrameId = await utils.checkIfChildNameExists(
    mainFrame.id,
    complexGesturesLayerName
  );
  const complexGesturesFrame = await figma.getNodeByIdAsync(
    complexGesturesFrameId
  );

  // get or create main annotations frame
  const mainAnnotationsFrame = await getOrCreateMainAnnotationsFrame({
    mainFrame,
    page
  });

  // get complex gesture annotation frame
  const annotationFrame = mainAnnotationsFrame.findOne(
    (n) => n.name === 'Complex gestures line'
  );

  // find and remove previous annotation complex gesture frames
  if (annotationFrame !== null) {
    annotationFrame.children.forEach((n) => {
      // remove all complex gesture blocks
      if (n.name.startsWith('Complex gesture Block')) {
        n.remove();
      }
    });
  }

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

  // let the user know layer(s) have been added/updated
  figma.notify('Complex gesture annotations have been added successfully!', {
    timeout: config.notifyTime
  });
};

export default {
  annotateComplexGestures,
  noComplexGestures,
  add,
  completed
};
