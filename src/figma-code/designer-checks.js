import './config';

import { createCircle, createTransparentFrame } from '../constants/figma-layer';
import { colors } from '../constants';
import {
  createAnnotationFrame,
  createAnnotationFrameTitleText,
  findAndRemovePreviousAnnotationFrame,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from './frame-helpers';

import routesNative from '../data/routes-native.json';
import routes from '../data/routes.json';

const DESIGNER_CHECKS_LAYER_NAME = 'Designer check Annotations';

// https://github.com/romannurik/Figma-Contrast
async function createCheckMark() {
  const checkmark = figma.createVector();
  checkmark.name = 'check';
  checkmark.x = 0;
  checkmark.y = 0;
  checkmark.strokeWeight = 2;
  checkmark.strokes = [{ type: 'SOLID', color: colors.grey }];
  checkmark.resize(18, 18); // w, h

  // https://www.figma.com/plugin-docs/api/VectorNetwork
  const vectorNetwork = {
    vertices: [
      {
        x: 5.6,
        y: 9.5,
        strokeJoin: 'MITER',
        cornerRadius: 0,
        handleMirroring: 'NONE'
      },
      {
        x: 9.3,
        y: 13.1,
        strokeJoin: 'MITER',
        cornerRadius: 0,
        handleMirroring: 'NONE'
      },
      {
        x: 14.3,
        y: 7.5,
        strokeJoin: 'MITER',
        cornerRadius: 0,
        handleMirroring: 'NONE'
      }
    ],

    segments: [
      {
        start: 0,
        end: 1,
        tangentStart: {
          x: 0,
          y: 0
        },
        tangentEnd: {
          x: 0,
          y: 0
        }
      },
      {
        start: 1,
        end: 2
      }
    ]
  };

  // https://www.figma.com/plugin-docs/api/VectorNode/#setvectornetworkasync
  await checkmark.setVectorNetworkAsync(vectorNetwork, 'source');

  return checkmark;
}

function createDesignerCheckMarkTitle({ id, name }) {
  const checkMarkTitle = figma.createText();
  checkMarkTitle.name = id;
  checkMarkTitle.fontSize = 14;
  checkMarkTitle.characters = name;
  checkMarkTitle.fills = [{ type: 'SOLID', color: colors.black }];
  checkMarkTitle.fontName = { family: 'Roboto', style: 'Regular' };

  return checkMarkTitle;
}

async function createDesignerCheckMarkIndicator({ completed }) {
  const checkMarkFrame = createTransparentFrame({
    name: 'checkmarkFrame',
    height: 20,
    width: 20
  });

  const checkMarkRect = createCircle({
    size: 20,
    name: 'checkmark',
    stroke: 1.5,
    strokeColor: colors.black,
    opacity: 1,
    fillColor: completed ? colors.black : colors.grey
  });

  checkMarkFrame.appendChild(checkMarkRect);

  if (completed) {
    const checkMark = await createCheckMark();
    checkMarkFrame.appendChild(checkMark);
  }

  return checkMarkFrame;
}

function createDesignerCheckMarkRow({ name, id, completed }) {
  const checkMarkFrame = createTransparentFrame({
    name: id,
    width: 1,
    height: 1
  });

  checkMarkFrame.layoutMode = 'HORIZONTAL';
  checkMarkFrame.itemSpacing = 8;
  checkMarkFrame.counterAxisSizingMode = 'AUTO';
  checkMarkFrame.counterAxisAlignItems = 'CENTER';

  const checkMark = createDesignerCheckMarkIndicator({ completed });
  checkMarkFrame.appendChild(checkMark);

  const titleNode = createDesignerCheckMarkTitle({ id, name });
  checkMarkFrame.appendChild(titleNode);

  return checkMarkFrame;
}

function getRoutesForPageType({ pageType }) {
  return pageType === 'native' ? routesNative : routes;
}

function getStepsForPageType({ pageType, steps, stepsNative }) {
  return pageType === 'native' ? stepsNative : steps;
}

function getStepDataForPage({ pageType, steps, stepsNative }) {
  const routeData = getRoutesForPageType({ pageType });
  const stepsData = getStepsForPageType({ pageType, steps, stepsNative });

  return stepsData.map((step) => routeData[step]);
}

function createDesignerChecksFrame({
  pageType,
  steps,
  stepsNative,
  stepsCompleted
}) {
  // create designer checks frame
  const designerChecksAnnotation = createAnnotationFrame({
    name: DESIGNER_CHECKS_LAYER_NAME
  });
  const annotationTitle = createAnnotationFrameTitleText({
    title: 'Designer checks'
  });
  designerChecksAnnotation.appendChild(annotationTitle);

  // have layer collapsed on creation
  designerChecksAnnotation.expanded = false;

  // for each step, add a check box to indicate completion
  const stepsForPage = getStepDataForPage({ pageType, steps, stepsNative });
  stepsForPage.forEach((step) => {
    const checkMarkFrame = createDesignerCheckMarkRow({
      id: step.id,
      name: step.designerCheck,
      completed: stepsCompleted.includes(step.id)
    });

    // have layer collapsed on creation
    checkMarkFrame.expanded = false;

    designerChecksAnnotation.appendChild(checkMarkFrame);
  });

  return designerChecksAnnotation;
}

function createOrUpdateDesignerChecksFrame({
  pageType,
  page,
  steps,
  stepsNative,
  stepsCompleted
}) {
  if (page) {
    const mainA11yLayer = getOrCreateMainA11yFrame({ page, pageType });
    const mainAnnotationsFrame = getOrCreateMainAnnotationsFrame({
      mainFrame: mainA11yLayer,
      page
    });

    findAndRemovePreviousAnnotationFrame({
      mainAnnotationsFrame,
      layerName: DESIGNER_CHECKS_LAYER_NAME
    });

    const designerChecks = createDesignerChecksFrame({
      page,
      pageType,
      steps,
      stepsNative,
      stepsCompleted
    });

    mainAnnotationsFrame.appendChild(designerChecks);
  }
}

export default { createDesignerChecksFrame, createOrUpdateDesignerChecksFrame };
