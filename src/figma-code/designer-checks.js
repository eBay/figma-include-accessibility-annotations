import config from '@/figma-code/config';
import { colors } from '@/constants';
import {
  createArrow,
  createCircle,
  createFrame,
  createRectangle,
  createTransparentFrame
} from '@/constants/figma-layer';
import {
  createAnnotationFrame,
  createAnnotationFrameTitleText,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from '@/figma-code/frame-helpers';

// data
import routes from '@/data/routes.json';
import routesNative from '@/data/routes-native.json';

const DESIGNER_CHECKS_LAYER_NAME = 'Designer check Annotations';

// https://github.com/romannurik/Figma-Contrast
async function createCheckMark() {
  const checkmark = figma.createVector();
  checkmark.name = 'check';
  checkmark.x = 0;
  checkmark.y = 0;
  checkmark.strokeWeight = 2;
  checkmark.strokes = [{ type: 'SOLID', color: colors.white }];
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

function createDesignerCheckMarkTitle({ id, name, style }) {
  const checkMarkTitle = figma.createText();
  checkMarkTitle.name = id;
  checkMarkTitle.fontSize = 14;
  checkMarkTitle.characters = name;
  checkMarkTitle.fills = [{ type: 'SOLID', color: colors.black }];
  checkMarkTitle.fontName = { family: 'Roboto', style };

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
    fillColor: completed ? colors.black : colors.white
  });

  checkMarkFrame.appendChild(checkMarkRect);

  if (completed) {
    const checkMark = await createCheckMark();
    checkMarkFrame.appendChild(checkMark);
  }

  return checkMarkFrame;
}

async function createDesignerCheckMarkRow(props) {
  const { name, id, completed, style = 'Regular' } = props;

  const checkMarkFrame = createTransparentFrame({
    name: id,
    width: 1,
    height: 1
  });

  checkMarkFrame.layoutMode = 'HORIZONTAL';
  checkMarkFrame.itemSpacing = 8;
  checkMarkFrame.counterAxisSizingMode = 'AUTO';
  checkMarkFrame.counterAxisAlignItems = 'CENTER';

  const checkMark = await createDesignerCheckMarkIndicator({ completed });
  checkMarkFrame.appendChild(checkMark);

  const titleNode = createDesignerCheckMarkTitle({ id, name, style });
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

async function createDesignerChecksFrame({
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
  await Promise.all(
    stepsForPage.map(async (step) => {
      const checkMarkFrame = await createDesignerCheckMarkRow({
        id: step.id,
        name: step.designerCheck,
        completed: stepsCompleted.includes(step.id)
      });

      // have layer collapsed on creation
      checkMarkFrame.expanded = false;

      designerChecksAnnotation.appendChild(checkMarkFrame);
    })
  );

  return designerChecksAnnotation;
}

async function updateDataAnnotationKeyV2({
  pageType,
  page,
  steps,
  stepsNative,
  stepsCompleted
}) {
  const mainA11yLayer = await getOrCreateMainA11yFrame({ page, pageType });
  const annoLayerV2 = await getOrCreateMainAnnotationsFrame({
    mainFrame: mainA11yLayer,
    page
  });

  const stepsForPage = getStepDataForPage({ pageType, steps, stepsNative });

  await Promise.all(
    stepsCompleted.map(async (stepId) => {
      const stepData = stepsForPage.find((step) => step.id === stepId);
      const stepLayer = annoLayerV2.findOne(
        (n) => n.name === `${stepData.label} line`
      );
      const stepFrame = stepLayer.findOne((n) => n.name === stepId);
      const cmFrame = stepFrame.findOne((n) => n.name === 'checkmarkFrame');
      const checkMarkCircle = cmFrame.findOne((n) => n.name === 'checkmark');
      const foundCheckMark = cmFrame.findOne((n) => n.name === 'check');

      // if checkmark is not found, create it
      if (foundCheckMark === null) {
        const checkMark = await createCheckMark();
        cmFrame.appendChild(checkMark);

        if (checkMarkCircle !== null) {
          checkMarkCircle.fills = [{ type: 'SOLID', color: colors.black }];
        }
      }

      let descNode = stepLayer.findOne((n) => n.name === 'description');
      if (descNode === null) {
        descNode = figma.createText();
        descNode.name = 'description';
        descNode.fontSize = 14;
        descNode.characters = stepData.designerEmpty;
        descNode.fills = [
          { type: 'SOLID', color: colors.mediumGrey, opacity: 1 }
        ];
        descNode.fontName = { family: 'Roboto', style: 'Regular' };
        descNode.layoutAlign = 'STRETCH';

        stepLayer.appendChild(descNode);
      }

      // account for descriptions
      if (stepId === 'Landmarks' || stepId === 'Headings') {
        const annotationDataLayer = mainA11yLayer.findOne((n) =>
          n.name.startsWith(`${stepId} Layer`)
        );

        if (annotationDataLayer.children.length > 0) {
          descNode.remove();
        } else {
          descNode.characters = `No ${stepData.label.toLowerCase()}`;
        }
      } else {
        descNode.remove();
      }
    })
  );

  // update annotation example layer placements
  const overlay = mainA11yLayer.findOne((n) => n.name === 'Annotation overlay');
  if (overlay !== null) {
    const paddingMain = 20;
    const overlayWidth = 60;

    overlay.children.forEach((child) => {
      const { name } = child;

      const lineName = name.replace(' overlay', '');
      const annoLayer = annoLayerV2.findOne((n) => n.name === lineName);

      if (annoLayer !== null) {
        let yDiff = 0;
        if (lineName === 'Headings line') {
          yDiff = -7;
        } else if (lineName === 'Reading & focus order line') {
          yDiff = 10;
        } else if (lineName === 'Alternative text line') {
          yDiff = -2;
        }
        const newX = annoLayerV2.width - paddingMain - overlayWidth;
        const newY = annoLayer.y + yDiff;

        child.x = newX;
        child.y = newY;
      }
    });
  }
}

async function createOrUpdateDesignerChecksFrame({
  pageType,
  page,
  steps,
  stepsNative,
  stepsCompleted
}) {
  if (page) {
    const mainA11yLayer = await getOrCreateMainA11yFrame({ page, pageType });

    await getOrCreateMainAnnotationsFrame({
      mainFrame: mainA11yLayer,
      page
    });

    updateDataAnnotationKeyV2({
      page,
      pageType,
      steps,
      stepsNative,
      stepsCompleted
    });
  }
}

async function updateToAnnotationKeyV2({ layers, pages }) {
  const { a11yAnnotationLayerKey, a11yAnnotationLayerKeyV2 } = config;

  // all steps
  const allSteps = [];
  config.a11yMainLayers.map((stepName) =>
    allSteps.push(stepName.replace(/ Layer/g, ''))
  );

  // reverse children array
  allSteps.reverse();

  const ignoreNative = ['Landmarks', 'Responsive reflow'];
  const ignoreWeb = ['Focus grouping'];
  const overlaySteps = [
    'Landmarks',
    'Headings',
    'Focus grouping',
    'Reading order',
    'Alt text'
  ];
  const paddingMain = 20;
  const FONT_REGULAR = { family: 'Roboto', style: 'Regular' };
  const FONT_BOLD = { family: 'Roboto', style: 'Bold' };

  await Promise.all(
    layers.map(async ({ id, parentId }) => {
      const node = await figma.getNodeByIdAsync(id);
      const parentNode = node.parent;
      const layersForOverlay = [];

      // if node is an annotation layer, update the layer design
      if (node !== null && node.name.startsWith(a11yAnnotationLayerKey)) {
        // get page data
        const pageData = pages.find((p) => p.pageId === parentId);

        if (pageData !== undefined) {
          const { stepsCompleted, stepsData, type } = pageData;
          const ignoreArray = type === 'web' ? ignoreWeb : ignoreNative;
          const routesData = getRoutesForPageType({ pageType: type });

          // update annotation layer coloring
          node.name = a11yAnnotationLayerKeyV2;
          node.cornerRadius = 16;
          node.fills = [{ type: 'SOLID', color: colors.white, opacity: 1 }];
          node.strokes = [{ type: 'SOLID', color: colors.coolGrey }];
          node.strokeWeight = 1;
          node.layoutMode = 'VERTICAL';
          node.counterAxisSizingMode = 'FIXED';
          node.primaryAxisSizingMode = 'AUTO';
          node.itemSpacing = 16;
          node.paddingLeft = paddingMain;
          node.paddingRight = paddingMain;
          node.paddingBottom = paddingMain;
          node.paddingTop = paddingMain;

          const annotationFooter = createTransparentFrame({
            name: 'Annotation footer',
            height: 1,
            width: config.annotationWidth - 40
          });

          // give it vertical auto-layout formatting
          annotationFooter.expanded = false;
          annotationFooter.layoutMode = 'VERTICAL';
          annotationFooter.layoutAlign = 'STRETCH';
          annotationFooter.itemSpacing = 12;
          annotationFooter.paddingTop = paddingMain;

          // add new footer heading
          const titleFooterText = 'Checks done, now what?';
          const footer = figma.createText();
          footer.name = titleFooterText;
          footer.fontSize = 24;
          footer.characters = titleFooterText;
          footer.fontName = FONT_BOLD;
          annotationFooter.insertChild(0, footer);

          // add new heading paragraph
          const footerPara = figma.createText();
          footerPara.name = 'Heading paragraph';
          footerPara.fontSize = 14;
          footerPara.characters =
            'Walk your engineer and PM partners through the annotations (could be a part of the standard hand-off process). Answer questions and discuss the experience as a team.';
          footerPara.fontName = FONT_REGULAR;
          footerPara.layoutAlign = 'STRETCH';
          annotationFooter.insertChild(1, footerPara);

          node.insertChild(0, annotationFooter);

          // loop through all steps
          await Promise.all(
            allSteps.map(async (step) => {
              // ignore certain steps
              if (ignoreArray.includes(step)) {
                return;
              }

              const stepData = routesData[step];
              const { label, designerEmpty } = stepData;
              const isCompleted = stepsCompleted.includes(step);

              // add layer to overlay
              if (overlaySteps.includes(step)) {
                layersForOverlay.push(`${label} line`);
              }

              const annotationFrame = createTransparentFrame({
                name: `${label} line`,
                height: 1,
                width: config.annotationWidth - 40
              });

              // give it vertical auto-layout formatting
              annotationFrame.expanded = false;
              annotationFrame.layoutMode = 'VERTICAL';
              annotationFrame.layoutAlign = 'STRETCH';
              annotationFrame.itemSpacing = 12;

              const checkMarkFrame = await createDesignerCheckMarkRow({
                id: stepData.id,
                name: label,
                completed: isCompleted,
                style: 'Bold'
              });

              // have layer collapsed on creation
              checkMarkFrame.expanded = false;
              annotationFrame.insertChild(0, checkMarkFrame);

              // check for different completion states
              let setToNone = false;
              const canSetToNone = ['Landmarks', 'Headings', 'Focus grouping'];
              const stillShowLabel = canSetToNone.includes(step);

              // if step data exists
              // and a step that can still show label for no data being set
              if (stepsData[step] !== undefined && stillShowLabel) {
                const { existingData } = stepsData[step];

                // check if empty object or array
                const count = Array.isArray(existingData)
                  ? existingData.length
                  : Object.keys(existingData).length;

                setToNone = count === 0;
              }

              // if not completed
              if (isCompleted === false) {
                // add designer empty paragraph or none set
                const emptyPara = figma.createText();
                emptyPara.name = 'description';
                emptyPara.fontSize = 14;
                emptyPara.characters = designerEmpty;
                emptyPara.fills = [
                  { type: 'SOLID', color: colors.mediumGrey, opacity: 1 }
                ];
                emptyPara.fontName = FONT_REGULAR;
                emptyPara.layoutAlign = 'STRETCH';

                annotationFrame.insertChild(1, emptyPara);
              } else if (stillShowLabel === true && setToNone === true) {
                // add designer empty paragraph or none set
                const emptyPara = figma.createText();
                emptyPara.name = 'description';
                emptyPara.fontSize = 14;
                emptyPara.characters = `No ${label.toLowerCase()}`;
                emptyPara.fills = [
                  { type: 'SOLID', color: colors.mediumGrey, opacity: 1 }
                ];
                emptyPara.fontName = FONT_REGULAR;
                emptyPara.layoutAlign = 'STRETCH';

                annotationFrame.insertChild(1, emptyPara);
              }

              node.insertChild(0, annotationFrame);
            })
          );

          const annotationHeader = createTransparentFrame({
            name: 'Annotation header',
            height: 1,
            width: config.annotationWidth - 40
          });

          // give it vertical auto-layout formatting
          annotationHeader.expanded = false;
          annotationHeader.layoutMode = 'VERTICAL';
          annotationHeader.layoutAlign = 'STRETCH';
          annotationHeader.itemSpacing = 12;
          annotationHeader.paddingBottom = paddingMain;

          // add new heading
          const titleText = 'Accessibility checks';
          const heading = figma.createText();
          heading.name = titleText;
          heading.fontSize = 24;
          heading.characters = titleText;
          heading.fontName = FONT_BOLD;
          annotationHeader.insertChild(0, heading);

          // add new heading paragraph
          const headingPara = figma.createText();
          headingPara.name = 'Heading paragraph';
          headingPara.fontSize = 14;
          headingPara.characters =
            'Not sure about any of the steps below? Learn more on the Playbook page.';
          headingPara.fontName = FONT_REGULAR;
          headingPara.layoutAlign = 'STRETCH';
          // start index of "Learn more"
          const start = 39;
          // end index of "Learn more"
          const end = 49;
          // https://www.figma.com/plugin-docs/api/TextSublayer/#setrangehyperlink
          const url =
            'https://playbook.ebay.com/foundations/accessibility?utm_source=figma&utm_medium=annotations_internal';
          headingPara.setRangeHyperlink(start, end, {
            type: 'URL',
            value: url
          });
          headingPara.setRangeTextDecoration(start, end, 'UNDERLINE');
          annotationHeader.insertChild(1, headingPara);

          node.insertChild(0, annotationHeader);
        }

        // clean up existing annotations
        const { children } = node;
        const stepTitleV1 = 'Annotation title';

        children.forEach((child) => {
          const { name } = child;

          // remove old annotation title from steps
          child.children.forEach((c) => {
            if (c.name === stepTitleV1) {
              c.remove();
            }
          });

          // move annotation data, and remove old annotations data
          if (name === DESIGNER_CHECKS_LAYER_NAME) {
            // remove v1 annotations checklist
            child.remove();
          } else if (name === 'Alt text Annotations') {
            // find new alt text annotations line item
            const blockName = 'Alt text Block';
            const lineName = 'Alternative text line';
            const lineNode = node.findOne((n) => n.name.includes(lineName));

            // find and move alt text annotations
            child.children.forEach((c) => {
              if (c.name.startsWith(blockName) && lineNode !== null) {
                lineNode.appendChild(c);
              }
            });

            child.remove();
          } else if (name === 'Complex gesture Annotations') {
            // find new Complex gesture annotations line item
            const blockName = 'Complex gesture Block';
            const lineName = 'Complex gestures line';
            const lineNode = node.findOne((n) => n.name.includes(lineName));

            // find and move all Complex gesture annotations
            child.children.forEach((c) => {
              if (c.name.startsWith(blockName) && lineNode !== null) {
                lineNode.appendChild(c);
              }
            });

            child.remove();
          }
        });

        // ordering of all annotations
        const orderingArray = [
          'Annotation header',
          'Landmarks line',
          'Headings line',
          'Focus grouping line',
          'Reading & focus order line',
          'Alternative text line',
          'Contrast line',
          'Color line',
          'Text resizing line',
          'Responsive reflow line',
          'Touch target line',
          'Complex gestures line',
          'Annotation footer'
        ];

        const nodeMap = Object.fromEntries(
          node.children.map((child) => [child.name, child])
        );

        const reorderedChildren = orderingArray
          .map((n) => nodeMap[n])
          .filter((nodeItem) => nodeItem);

        reorderedChildren.forEach((child) => {
          node.appendChild(child);
        });

        const annotationFrameOverlay = createTransparentFrame({
          name: 'Annotation overlay',
          height: 1,
          width: config.annotationWidth - 32
        });
        annotationFrameOverlay.x = node.x;
        annotationFrameOverlay.y = node.y;

        annotationFrameOverlay.resizeWithoutConstraints(
          node.width,
          node.height
        );

        // add overlay examples
        const overlayWidth = 60;
        await Promise.all(
          node.children.map(async ({ name, y }) => {
            if (layersForOverlay.includes(name)) {
              if (name === 'Landmarks line') {
                const landmarkHeight = 26;
                const landmarkX = node.width - paddingMain - overlayWidth;
                const landmarkY = y;

                const landmarkFrame = createTransparentFrame({
                  name: `${name} overlay`,
                  height: landmarkHeight,
                  width: overlayWidth,
                  x: landmarkX,
                  y: landmarkY
                });

                // create rectangle / background
                const rectNode = createRectangle({
                  name: `Landmark Area: example`,
                  height: landmarkHeight,
                  radius: 2,
                  stroke: 1,
                  width: overlayWidth
                });

                rectNode.constraints = {
                  horizontal: 'SCALE',
                  vertical: 'SCALE'
                };
                rectNode.x = 0;
                rectNode.y = 0;

                // add rectangle within Landmark layer
                landmarkFrame.appendChild(rectNode);

                // create label background with auto-layout
                const labelFrame = createFrame({
                  name: 'Label Background',
                  height: 1,
                  width: 1,
                  x: 0,
                  y: 0,
                  opacity: 1
                });
                labelFrame.layoutMode = 'HORIZONTAL';
                labelFrame.horizontalPadding = 2;
                labelFrame.verticalPadding = 2;
                labelFrame.counterAxisSizingMode = 'AUTO';
                labelFrame.cornerRadius = 2;

                // do NOT have it scale with the surrounding frame
                labelFrame.constraints = {
                  horizontal: 'MIN',
                  vertical: 'MIN'
                };

                // create annotation name for label
                const labelNode = figma.createText();
                labelNode.name = `Landmark Name: example`;
                labelNode.fontSize = 4;
                labelNode.characters = '<landmark>';
                labelNode.fills = [{ type: 'SOLID', color: colors.white }];
                labelNode.fontName = FONT_BOLD;

                // add label node to frame
                labelFrame.appendChild(labelNode);

                // add label frame to landmark block
                landmarkFrame.appendChild(labelFrame);

                annotationFrameOverlay.appendChild(landmarkFrame);
              } else if (name === 'Headings line') {
                const headingX = node.width - paddingMain - overlayWidth;
                const headingY = y - 7;

                const headingsFrame = createTransparentFrame({
                  name: `${name} overlay`,
                  height: 28,
                  width: overlayWidth,
                  x: headingX,
                  y: headingY
                });

                const headingOutline = createRectangle({
                  name: 'Heading outline',
                  x: 0,
                  y: 10,
                  height: 18,
                  width: overlayWidth,
                  stroke: 1,
                  strokeColor: colors.blue,
                  opacity: 0,
                  radius: 2,
                  radiusMixed: [{ topLeftRadius: 0 }]
                });
                headingsFrame.appendChild(headingOutline);

                // create annotation label
                const label = createRectangle({
                  name: 'Label Background',
                  height: 10,
                  width: 10,
                  x: 0,
                  y: 0,
                  fillColor: colors.blue,
                  stroke: 0,
                  opacity: 1,
                  radius: 2,
                  radiusMixed: [
                    { bottomLeftRadius: 0 },
                    { bottomRightRadius: 0 }
                  ]
                });
                headingsFrame.appendChild(label);

                // create annotation name for label
                const numberNode = figma.createText();
                numberNode.fontSize = 6;
                numberNode.name = 'Heading';
                numberNode.characters = 'H';
                numberNode.fills = [{ type: 'SOLID', color: colors.white }];
                numberNode.fontName = FONT_BOLD;
                numberNode.x = 3;
                numberNode.y = 2;
                headingsFrame.appendChild(numberNode);

                annotationFrameOverlay.appendChild(headingsFrame);
              } else if (name === 'Focus grouping line') {
                const focusGX = node.width - paddingMain - overlayWidth;
                const focusGY = y;

                const focusGFrame = createRectangle({
                  name: 'Focus grouping example',
                  x: focusGX,
                  y: focusGY,
                  height: 30,
                  width: overlayWidth,
                  radius: 2,
                  stroke: 1,
                  opacity: 0
                });

                annotationFrameOverlay.appendChild(focusGFrame);
              } else if (name === 'Reading & focus order line') {
                const readingOrderX = node.width - paddingMain - 40;
                const readingOrderY = y + 10;

                const readingOrderFrame = createTransparentFrame({
                  name: `${name} overlay`,
                  height: 10,
                  width: overlayWidth,
                  x: readingOrderX,
                  y: readingOrderY
                });

                const arrow = await createArrow({
                  arrowType: 'example',
                  name: 'Arrow example',
                  stroke: 1,
                  x: 0,
                  y: 0
                });

                readingOrderFrame.appendChild(arrow);
                annotationFrameOverlay.appendChild(readingOrderFrame);
              } else if (name === 'Alternative text line') {
                const altTextX = node.width - paddingMain - overlayWidth;
                const altTextY = y - 2;

                const altTextFrame = createTransparentFrame({
                  name: `${name} overlay`,
                  height: 28,
                  width: overlayWidth,
                  x: altTextX,
                  y: altTextY
                });

                // create image dimensions layer
                const rectNode = createRectangle({
                  name: 'Image Dimensions',
                  x: 0,
                  y: 0,
                  height: 28,
                  width: overlayWidth,
                  fillColor: colors.blue,
                  radius: 2,
                  stroke: 1,
                  strokeColor: colors.blue,
                  opacity: 0.2
                });

                // create annotation circle
                const circleNode = createCircle({
                  name: 'Circle',
                  x: -3,
                  y: -3,
                  fillColor: colors.blue,
                  size: 10,
                  stroke: 1,
                  strokeColor: colors.white
                });

                // create annotation number
                const numberNode = figma.createText();
                numberNode.name = `Number 1`;
                numberNode.fontSize = 6;
                numberNode.characters = '1';
                numberNode.fills = [{ type: 'SOLID', color: colors.white }];
                numberNode.fontName = FONT_BOLD;
                numberNode.y = -2;

                altTextFrame.appendChild(rectNode);
                altTextFrame.appendChild(circleNode);
                altTextFrame.appendChild(numberNode);

                annotationFrameOverlay.appendChild(altTextFrame);
              }
            }
          })
        );

        parentNode.appendChild(annotationFrameOverlay);
      }
    })
  );
}

export default {
  createDesignerChecksFrame,
  createOrUpdateDesignerChecksFrame,
  createDesignerCheckMarkRow,
  updateToAnnotationKeyV2
};
