import { colors, utils } from '@/constants';
import config from '@/figma-code/config';
import designerChecks from '@/figma-code/designer-checks';
import {
  createArrow,
  createCircle,
  createFrame,
  createRectangle,
  createTransparentFrame
} from '@/constants/figma-layer';
import { getMainA11yLayerName } from '@/figma-code/frame-helpers';

// data
import routes from '@/data/routes.json';
import routesNative from '@/data/routes-native.json';

async function createAnnotationDefaultKeyV2({ data, page, type }) {
  const { a11ySuffix, a11yAnnotationLayerKeyV2, annotationWidth } = config;
  const { name } = page;
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
  const annotationLayerName = `${name} ${a11ySuffix} | ${typeCapitalized}`;
  const { currentPage } = figma;

  const annotationLayer = currentPage.children.find(
    (child) => child.name === annotationLayerName
  );

  // make sure annotation layer is found
  if (annotationLayer !== undefined) {
    // find the annotation layer key v2
    const annotationLayerKeyV2 = annotationLayer.children.find(
      (child) => child.name === a11yAnnotationLayerKeyV2
    );

    // make sure annotation layer key v2 is found
    if (annotationLayerKeyV2 !== undefined) {
      // all steps
      const allSteps = [];
      config.a11yMainLayers.map((stepName) =>
        allSteps.push(stepName.replace(/ Layer/g, ''))
      );

      // reverse children array
      allSteps.reverse();

      const layersForOverlay = [];
      const ignoreNative = ['Focus order', 'Landmarks', 'Responsive reflow'];
      const ignoreWeb = ['Focus order', 'Focus grouping'];
      const overlaySteps = [
        'Landmarks',
        'Headings',
        'Focus grouping',
        'Reading order',
        'Alt text'
      ];
      const ignoreArray = type === 'web' ? ignoreWeb : ignoreNative;
      const paddingMain = 20;
      const FONT_REGULAR = { family: 'Roboto', style: 'Regular' };
      const FONT_BOLD = { family: 'Roboto', style: 'Bold' };

      // create footer
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

      annotationLayerKeyV2.insertChild(0, annotationFooter);

      // create steps data (empty state)
      await Promise.all(
        allSteps.map(async (step) => {
          // ignore certain steps
          if (ignoreArray.includes(step)) {
            return;
          }

          const stepData = data[step];
          const { label, designerEmpty } = stepData;

          // add layer to overlay
          if (overlaySteps.includes(step)) {
            layersForOverlay.push(`${label} line`);
          }

          const annotationFrame = createTransparentFrame({
            name: `${label} line`,
            height: 1,
            width: annotationWidth - 40
          });

          // give it vertical auto-layout formatting
          annotationFrame.expanded = false;
          annotationFrame.layoutMode = 'VERTICAL';
          annotationFrame.layoutAlign = 'STRETCH';
          annotationFrame.itemSpacing = 12;

          const checkMarkFrame =
            await designerChecks.createDesignerCheckMarkRow({
              id: stepData.id,
              name: label,
              completed: false,
              style: 'Bold'
            });

          // have layer collapsed on creation
          checkMarkFrame.expanded = false;
          annotationFrame.insertChild(0, checkMarkFrame);

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

          annotationLayerKeyV2.insertChild(0, annotationFrame);
        })
      );

      // create header
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

      annotationLayerKeyV2.insertChild(0, annotationHeader);

      // add overlay
      const annotationFrameOverlay = createTransparentFrame({
        name: 'Annotation overlay',
        height: 1,
        width: config.annotationWidth - 32
      });
      annotationFrameOverlay.x = annotationLayerKeyV2.x;
      annotationFrameOverlay.y = annotationLayerKeyV2.y;

      annotationFrameOverlay.resizeWithoutConstraints(
        annotationLayerKeyV2.width,
        annotationLayerKeyV2.height
      );

      // add overlay examples
      const overlayWidth = 60;
      const startX = annotationLayerKeyV2.width - paddingMain - overlayWidth;

      await Promise.all(
        annotationLayerKeyV2.children.map(async ({ name: layerName, y }) => {
          if (layersForOverlay.includes(layerName)) {
            if (layerName === 'Landmarks line') {
              const landmarkHeight = 26;
              const landmarkFrame = createTransparentFrame({
                name: `${layerName} overlay`,
                height: landmarkHeight,
                width: overlayWidth,
                x: startX,
                y
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
            } else if (layerName === 'Headings line') {
              const headingsFrame = createTransparentFrame({
                name: `${layerName} overlay`,
                height: 28,
                width: overlayWidth,
                x: startX,
                y: y - 7
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
                radiusMixed: [{ bottomLeftRadius: 0 }, { bottomRightRadius: 0 }]
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
            } else if (layerName === 'Focus grouping line') {
              const focusGFrame = createRectangle({
                name: 'Focus grouping example',
                x: startX,
                y,
                height: 30,
                width: overlayWidth,
                radius: 2,
                stroke: 1,
                opacity: 0
              });

              annotationFrameOverlay.appendChild(focusGFrame);
            } else if (layerName === 'Reading & focus order line') {
              const readingOrderX =
                annotationLayerKeyV2.width - paddingMain - 40;

              const readingOrderFrame = createTransparentFrame({
                name: `${layerName} overlay`,
                height: 10,
                width: overlayWidth,
                x: readingOrderX,
                y: y + 10
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
            } else if (layerName === 'Alternative text line') {
              const altTextFrame = createTransparentFrame({
                name: `${layerName} overlay`,
                height: 28,
                width: overlayWidth,
                x: startX,
                y: y - 2
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

      annotationLayer.appendChild(annotationFrameOverlay);
    }
  }
}

export default async function initializePage({
  pageType,
  page,
  stepsCompleted,
  steps,
  stepsNative
}) {
  const mainLayerName = getMainA11yLayerName({ pageName: page.name, pageType });
  const saniName = utils.sanitizeName(page.name);

  const { x, y, height, width } = page.bounds;

  const mainFrame = await utils.frameExistsOrCreate(
    page.mainPageId,
    mainLayerName,
    {
      x,
      y,
      height,
      width: width + config.annotationWidth
    }
  );

  // initialize the designer checks frame on page creation
  designerChecks.createOrUpdateDesignerChecksFrame({
    page,
    pageType,
    steps,
    stepsNative,
    stepsCompleted
  });

  // let figma creation catch up
  await utils.sleep(800);

  // add default layers
  const data = pageType === 'web' ? routes : routesNative;
  await createAnnotationDefaultKeyV2({ data, page, type: pageType });

  // initialize data for the page
  figma.ui.postMessage({
    type: 'initialize-pages-data',
    data: {
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: page.id,
        page
      }
    }
  });
}
