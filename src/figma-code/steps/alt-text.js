import { colors, figmaLayer, utils } from '@/constants';
import config from '@/figma-code/config';
import {
  createAnnotationInfoFrame,
  createAnnotationLabelValueRow,
  createAnnotationNumberFrame,
  createInnerAnnotationFrame,
  getOrCreateMainA11yFrame,
  getOrCreateMainAnnotationsFrame
} from '@/figma-code/frame-helpers';

export const imageScan = async (msg) => {
  const { id: selectedNodeId, page, pageType } = msg;

  // https://www.figma.com/plugin-docs/accessing-document/#traversing-all-nodes-in-the-page
  const nodeWrapper = await figma.getNodeByIdAsync(selectedNodeId);

  // find images in selected node/page
  const imageNodes = nodeWrapper.findAll((node) => {
    const { absoluteRenderBounds: bounds } = node;
    // first: check if node has no image fills or is hidden
    const hasNoFills = utils.hasNoImageFills(node);

    // second:
    // if it does have fills, check to make sure it's in the design viewport
    // and not out of bounds
    let outOfBounds = false;
    if (
      hasNoFills === false &&
      (bounds === null || typeof bounds !== 'object')
    ) {
      outOfBounds = true;
    }

    // only filter on, if visible and has fills
    const imageFills =
      hasNoFills || outOfBounds
        ? []
        : node.fills.filter((fill) => fill.type === 'IMAGE');

    return imageFills.length > 0;
  });

  // find all svgs in the file
  // const svgNodes = nodeWrapper.findAll((node) => {
  //   const nodeName = node.name.toLowerCase();

  //   return nodeName.includes('vector-shape');
  // });
  // console.log('svgNodes', svgNodes);
  // console.log('----------');

  // now because of how figma does bottom to top, and we are using the optimized findAll above ^
  // this step is to reverse that order and target any elements that have
  // multiple fill layers taking up the same x,y

  // this cases for designers having layers on top of each other
  // and never setting the visibility to hidden or never cleaning up their file
  const boundsArray = [];
  const imagesOverlayFilter = imageNodes.reverse().filter((node) => {
    const { absoluteRenderBounds } = node;
    const { height, width, x, y } = absoluteRenderBounds;

    const boundsKey = `${height}:${width}:${x}:${y}`;

    let keepInArray = true;
    if (boundsArray.includes(boundsKey) === false) {
      boundsArray.push(boundsKey);
    } else {
      keepInArray = false;
    }

    return keepInArray;
  });

  // loop through nodes that have images and grab bytes of image
  const imagesData = await Promise.all(
    imagesOverlayFilter.map(async (image) => {
      const { absoluteRenderBounds, fills, id, name } = image;

      // get the first fill that is an image type
      const [imageFill] = fills.filter((fill) => fill.type === 'IMAGE');
      const { imageHash } = imageFill;

      // get image data by hash
      // https://www.figma.com/plugin-docs/working-with-images/
      const imageData = figma.getImageByHash(imageHash);
      const bytes = await imageData.getBytesAsync();

      return {
        // https://www.figma.com/plugin-docs/api/figma/#base64encode
        altText: name,
        base64: figma.base64Encode(bytes),
        bounds: absoluteRenderBounds,
        id,
        name,
        displayType: 'scanned',
        type: 'decorative'
      };
    })
  );

  // if no images found, set layer `no images`
  if (imagesData.length === 0) {
    // main data and setup
    const { bounds } = page;
    const { height: pageH, width: pageW } = bounds;

    const altTextLayerName = 'Alt text Layer';

    // get main A11y frame if it exists (or create it)
    const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

    // does Alt text exists already?
    const altTextExists = await utils.checkIfChildNameExists(
      mainFrame.id,
      altTextLayerName
    );

    // if Alt text exist, delete it
    if (altTextExists !== null) {
      const oldAltTextFrame = await figma.getNodeByIdAsync(altTextExists);
      // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
      oldAltTextFrame.remove();
    }

    // create the Alt text frame
    const altTextFrame = figmaLayer.createTransparentFrame({
      name: altTextLayerName,
      height: pageH,
      width: pageW
    });

    // update with id (for future scanning)
    altTextFrame.name = `${altTextLayerName} | ${altTextFrame.id}`;
    altTextFrame.expanded = false;
    altTextFrame.visible = false;
    altTextFrame.locked = true;

    // create the "no images" layer
    const layerName = 'No Images';
    const layerFrame = figmaLayer.createTransparentFrame({
      name: layerName,
      height: 10,
      width: 10
    });
    layerFrame.expanded = false;
    layerFrame.visible = false;

    // add within Alt text layer
    altTextFrame.appendChild(layerFrame);

    // add within main Accessibility layer
    mainFrame.appendChild(altTextFrame);
  }

  figma.ui.postMessage({
    type: 'images-found',
    data: { images: imagesData }
  });

  // let the user know images were found or not
  const addS = imagesData.length === 1 ? ' was' : 's were';
  figma.notify(`${imagesData.length} image${addS} found!`, {
    timeout: config.notifyTime
  });
};

export const addImageManually = async () => {
  // reset selection on add
  figma.currentPage.selection = [];
};

const createAltTextAnnotationInfoFrame = ({ roleType, altText }) => {
  // only show alt text for informative role
  const hasAltText = roleType === 'informative';

  const roleTypes = {
    informative: 'Informative',
    decorative: 'Decorative',
    placeholder: 'Placeholder'
  };

  // create gesture info frame with vertical auto layout
  const altTextInfoFrame = createAnnotationInfoFrame({
    name: 'Alt text info'
  });

  // append the first row of alt text info
  altTextInfoFrame.appendChild(
    createAnnotationLabelValueRow({
      rowName: 'Alt text',
      label: 'Alt text:',
      value: hasAltText ? `"${altText}"` : '" "'
    })
  );

  // append the second row of alt text info
  altTextInfoFrame.appendChild(
    createAnnotationLabelValueRow({
      rowName: 'Role',
      label: 'Purpose:',
      value: roleTypes[roleType]
    })
  );

  return altTextInfoFrame;
};

const createAltTextAnnotation = ({ number, id, roleType, altText }) => {
  // create alt text annotation with horizontal autolayout
  const altTextAnnotationBlock = createInnerAnnotationFrame({
    annotationBlockName: 'Alt text',
    number,
    id
  });

  // add the annotation number
  altTextAnnotationBlock.appendChild(
    createAnnotationNumberFrame({
      number,
      fillColor: colors.blue
    })
  );

  // add the annotation info
  altTextAnnotationBlock.appendChild(
    createAltTextAnnotationInfoFrame({
      roleType,
      altText
    })
  );

  return altTextAnnotationBlock;
};

export const add = async (msg) => {
  const { images, page, pageType } = msg;

  // colors
  const { blue, white } = colors;

  // main data and setup
  const { bounds, name } = page;
  const { x: pageX, y: pageY, height: pageH, width: pageW } = bounds;

  const altTextLayerName = 'Alt text Layer';
  const mainPageNode = await figma.getNodeByIdAsync(page.id);

  // get main A11y frame if it exists (or create it)
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });
  const mainAnnotationsFrame = await getOrCreateMainAnnotationsFrame({
    mainFrame,
    page
  });

  const saniName = utils.sanitizeName(name);
  const nodes = [];

  // does Alt text exist already?
  const altTextExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    altTextLayerName
  );

  // if Alt text exist, delete it
  if (altTextExists !== null) {
    const oldAltTextFrame = await figma.getNodeByIdAsync(altTextExists);
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldAltTextFrame.remove();
  }

  // create the Alt text frame
  const altTextFrame = figmaLayer.createTransparentFrame({
    name: altTextLayerName,
    height: pageH,
    width: pageW
  });

  // update with id (for future scanning)
  altTextFrame.name = `${altTextLayerName} | ${altTextFrame.id}`;
  altTextFrame.expanded = false;
  altTextFrame.locked = true;

  // loop through images with alt text and add image overlays to Figma Document
  for (let i = 0; i < images.length; i += 1) {
    const altTextObj = images[i];
    const { altText, bounds: imgBounds, id } = altTextObj;
    const { x, y, height, width } = imgBounds;
    const number = i + 1;

    // set image dimensions
    const rectX = x - pageX;
    const rectY = y - pageY;

    // create image container frame
    const altTextImageLayer = `Alt text: ${altTextObj.type} | ${altText} | ${altTextObj.name}`;
    const imageLayer = figmaLayer.createTransparentFrame({
      name: altTextImageLayer,
      height: pageH,
      width: pageW
    });
    imageLayer.expanded = false;

    // update with id (for future scanning)
    const newAltTextLayerName = `${altTextImageLayer} | ${id}`;
    imageLayer.name = newAltTextLayerName;

    // create image dimensions layer
    const rectNode = figmaLayer.createRectangle({
      name: 'Image Dimensions',
      x: rectX,
      y: rectY,
      height,
      width,
      fillColor: blue,
      strokeColor: blue,
      opacity: 0.2
    });

    // create annotation circle
    const circleNode = figmaLayer.createCircle({
      name: 'Circle',
      x: rectX - 16,
      y: rectY - 16,
      fillColor: blue,
      strokeColor: white
    });

    // create annotation number
    const numberNode = figma.createText();
    const numberString = number.toString();
    numberNode.name = `Number ${number}`;
    numberNode.fontSize = 16;
    numberNode.characters = numberString;
    numberNode.fills = [{ type: 'SOLID', color: white }];

    // https://www.figma.com/plugin-docs/api/TextNode/#fontname
    numberNode.fontName = { family: 'Roboto', style: 'Bold' };
    const xAdjustment = numberString.length === 1 ? 5 : 9;
    const yAdjustment = 9;
    numberNode.x = rectX - xAdjustment;
    numberNode.y = rectY - yAdjustment;

    const toGroupArray = [circleNode, numberNode];
    const annotationNumber = figma.group(toGroupArray, imageLayer);
    annotationNumber.name = 'Annotation Number';
    annotationNumber.expanded = false;

    imageLayer.appendChild(rectNode);
    imageLayer.appendChild(annotationNumber);

    altTextFrame.appendChild(imageLayer);

    // add imageLayer to nodes (for Zoom Into View)
    nodes.push(imageLayer);
  }

  // get alt text annotation frame
  const annotationFrame = mainAnnotationsFrame.findOne(
    (n) => n.name === 'Alternative text line'
  );

  // find and remove previous annotation alt text frames
  if (annotationFrame !== null) {
    annotationFrame.children.forEach((n) => {
      // remove all alt text blocks
      if (n.name.startsWith('Alt text Block')) {
        n.remove();
      }
    });
  }

  // loop through images with alt text and add annotation section to Figma Document
  for (let i = 0; i < images.length; i += 1) {
    const { altText, type: roleType, id } = images[i];
    const number = i + 1;

    // create an alt text annotation child
    annotationFrame.appendChild(
      createAltTextAnnotation({
        number,
        id,
        altText,
        roleType
      })
    );
  }

  // add alt text frame to main Accessibility layer
  mainFrame.appendChild(altTextFrame);

  // focus user's viewport to contain all nodes created
  figma.viewport.scrollAndZoomIntoView(nodes);

  // let the user know layer(s) have been added/updated
  const notifyMsg = altTextExists !== null ? 'updated' : 'added';
  figma.notify(`Alt text layer has been ${notifyMsg} successfully!`, {
    timeout: config.notifyTime
  });

  const { parent } = mainPageNode;
  const ifExists = parent.children.filter((c) => c.name === saniName);
  const originalPage = ifExists[0];

  // update pagesData
  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status: 'add',
      stepKey: 'Alt text',
      'Alt text': {
        id: altTextFrame.id
      },
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: page.id,
        page: {
          bounds,
          id: originalPage.id,
          mainPageId: page.id,
          name: saniName
        }
      }
    }
  });
};

export default { imageScan, addImageManually, add };
