import { createTransparentFrame } from './figma-layer';

/**
 * Utility functions for working with Figma frames and strings
 *
 * @module utilities
 */

/**
 * Check if enter or space key
 *
 * @param {string} key - key pressed
 *
 * @return {boolean} true/false
 */
const isEnterKey = (key) => key === 'Enter' || key === ' ';

/**
 * Capitalize first letter of string passed
 *
 * input: banner
 * output: Banner
 *
 * @param {string} name - string to capitalize
 *
 * @return {string} capitalized string
 */
const capitalize = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();

/**
 * Checks if layerName exists wihin the children of NodeID passed
 *
 * @param {string} nodeId - Node ID to grab
 * @param {string} layerName - layer name to check against
 *
 * @return {(null|string)} if found returns id of layer OR returns null
 */
const checkIfChildNameExists = (nodeId, layerName, withPipe = true) => {
  // get parent node, then grab children
  const parentNode = figma.getNodeById(nodeId);
  const { children } = parentNode;

  // search on names with pipe or not
  const addPipe = withPipe ? ' |' : '';

  const layerNamePiped = layerName.includes('|')
    ? layerName
    : `${layerName}${addPipe}`;

  // check if layer name exists
  // using startsWith() because IDs are appended to end: Layer Name | [id] 120:19
  const hasLayer = children.filter((node) => {
    const { name } = node;
    // backward compatibility (old scans that don't have web/native labeling)
    const legacyName = layerNamePiped.replace(' | Web', '');

    return name.startsWith(layerNamePiped) || name.startsWith(legacyName);
  });

  // old exact string checking
  // const hasLayer = children.filter((node) => node.name === layerName);

  return hasLayer.length === 0 ? null : hasLayer[0].id;
};

/**
 * Check if native or web later
 *
 * input: Accessibility Layer Name
 * output: 'web' or 'native'
 *
 * @param {string} string - full a11y layer name
 *
 * @return {string} string - 'web' or 'native'
 */
const checkTypeOfA11yLayer = (layerName) => {
  const layerNameArray = layerName.split('|');
  let A11yType = 'web';

  // do we at least have 3 values (backwards compatibility handling)
  if (layerNameArray.length >= 3) {
    const layerType = layerNameArray[2].trim();

    // is it a native stepper flow?
    if (layerType === 'Native') {
      A11yType = 'native';
    }
  }

  return A11yType;
};

/**
 * Check is frame exists by name, if not, create it
 *
 * @param {string} parentFrameId - parent node ID
 * @param {string} layerName - layer name
 * @param {string} page - page creation data (optional: x, y, height, width)
 *
 * @return {object} Figma frame
 */
const frameExistsOrCreate = (parentFrameId, layerName, page) => {
  // does frame already exist?
  const accessExists = checkIfChildNameExists(parentFrameId, layerName);

  let frame = null;

  // if frame doesn't exist
  if (accessExists === null) {
    const parentNode = figma.getNodeById(parentFrameId);

    // create the frame
    frame = createTransparentFrame({
      name: layerName,
      ...page // optional: x, y, height, width
    });

    // add to top level Frame or Section
    parentNode.appendChild(frame);
  } else {
    // already exists, grab by Node ID
    frame = figma.getNodeById(accessExists);
  }

  return frame;
};

/**
 * Check if Node has no usable image fills or is visible
 *
 * @param {object} node - Figma node object
 *
 * @return {boolean} Has no fills OR is hidden
 */
const hasNoImageFills = (node) => {
  const { fills } = node;

  // make sure this node is visible (and parent is visible)
  const isHidden = node.visible === false || node.parent.visible === false;

  // make sure it's an array we can filter
  const noFills = fills === undefined || Array.isArray(fills) === false;

  return noFills || isHidden;
};

/**
 * Grab the string before the pipe (|)
 *
 * input: Contrast Layer | 165:578
 * output: Contrast Layer
 *
 * @param {string} string - string with pipe format
 *
 * @return {string} string content before pipe delimeter
 */
const nameBeforePipe = (string) => {
  const newString = string.split('|').splice(0, 1).join('').trim();

  return newString;
};

/**
 * Remove pipe (|) from Page names
 * this will be the delimeter used for layer/data layer naming conventions
 * along with removing double, triple spacing
 *
 * @param {string} name - Name of page scanned
 *
 * @return {string} new sanitized name for layer
 */
const sanitizeName = (name) => {
  const newName = name
    .replace(/[|]/g, ' ')
    .replace(/[  ]/g, ' ')
    .replace(/[   ]/g, ' ');

  return newName;
};

/**
 * Find all A11y layers and make the child layers visible
 *
 * this is used when:
 * - Plugin Closes
 * - User goes back to Dashboard
 *
 * @param {string} a11ySuffix - layer suffix to search on
 *
 * @return null
 */
const showAllLayers = (a11ySuffix) => {
  // get current page user is on
  const { currentPage } = figma;
  const { children } = currentPage;

  // check if this page has children layers
  if (children.length > 0) {
    // loop through frames, find accessibility layers
    children.map((node) => {
      // is accessibility layer?
      if (node.name.includes(a11ySuffix)) {
        const { children: a11ySteps } = node;
        // show main a11y layer
        const mainA11yLayer = figma.getNodeById(node.id);
        mainA11yLayer.visible = true;

        // do we have a11y step layers?
        if (a11ySteps.length > 0) {
          // loop through step layers
          a11ySteps.map((childNode) => {
            const innerLayer = figma.getNodeById(childNode.id);
            innerLayer.visible = true;

            return null;
          });
        }
      }

      return null;
    });
  }
};

/**
 * Sleep/Wait for X milliseconds
 *
 * @param {number} ms - milliseconds to wait
 *
 * @return null
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const scrollToBottomOfAnnotationStep = () => {
  // scroll to bottom of main
  setTimeout(() => {
    const mainTag = document.getElementById('main');
    mainTag.scrollTo({
      top: mainTag.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }, 400);
};

/**
 * Load images from hash
 *
 * @param {array} imagesScanned - array of images for current design
 *
 * @return {array} newImagesScanned - array of images with base64 data
 */
const getBase64FromHash = async (imagesScanned) => {
  const newImagesScanned = [];

  await Promise.all(
    imagesScanned.map(async (image) => {
      const { id, bounds, hash, name } = image;
      // get image data by hash
      const imageData = figma.getImageByHash(hash);
      const bytes = await imageData.getBytesAsync();

      // remap and remove `data` key
      newImagesScanned.push({
        id,
        base64: figma.base64Encode(bytes),
        bounds,
        name
      });
    })
  );

  return newImagesScanned;
};

export default {
  isEnterKey,
  capitalize,
  checkIfChildNameExists,
  checkTypeOfA11yLayer,
  frameExistsOrCreate,
  getBase64FromHash,
  hasNoImageFills,
  nameBeforePipe,
  sanitizeName,
  showAllLayers,
  sleep,
  scrollToBottomOfAnnotationStep
};
