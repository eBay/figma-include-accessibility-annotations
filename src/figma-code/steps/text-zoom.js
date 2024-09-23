import { utils } from '../../constants';
import config from '../config';

export const createClone = (msg) => {
  const { currentPage } = figma;
  const { page, pageType } = msg;
  const { id: pageId } = page;

  // get selected page node
  const pageNode = figma.getNodeById(pageId);
  const cloneLayerName = `${pageNode.name} Text Zoom`;

  // does previous clone exist?
  const doesExist = utils.checkIfChildNameExists(
    pageNode.parent.id,
    cloneLayerName,
    false
  );

  // if previous clone frame does exist, delete it
  if (doesExist !== null) {
    const oldCloneFrame = figma.getNodeById(doesExist);
    oldCloneFrame.remove();
  }

  // get all those dimensions
  const { x, width } = pageNode;
  const { annotationWidth } = config;
  let startX = x + width + annotationWidth;

  // do responsive pages exist?
  let largestResponsivePage = null;
  const checkName = (name) => {
    const check = `${pageNode.name} | Responsive `;

    return name.startsWith(check);
  };

  // loop through all high level pages and section pages
  currentPage.children.forEach((topLevel) => {
    const { name, type } = topLevel;
    const isResponsive = checkName(name);

    // account for sections
    if (type === 'SECTION') {
      // loop through section pages
      topLevel.children.forEach((sectionPage) => {
        const isResponsiveSec = checkName(sectionPage.name);
        if (isResponsiveSec) {
          if (largestResponsivePage === null) {
            largestResponsivePage = sectionPage;
          } else if (largestResponsivePage.x < sectionPage.x) {
            largestResponsivePage = sectionPage;
          }
        }
      });
    } else if (isResponsive) {
      if (largestResponsivePage === null) {
        largestResponsivePage = topLevel;
      } else if (largestResponsivePage.x < topLevel.x) {
        largestResponsivePage = topLevel;
      }
    }
  });

  // if Responsive page exists, get dimensions
  if (largestResponsivePage !== null) {
    startX = largestResponsivePage.x + largestResponsivePage.width;
  }

  // are we within a section?
  const withinSection = pageNode.parent.type === 'SECTION';

  const gutterSpace = 124;

  // clone selected page
  const clone = pageNode.clone();
  const newX = startX + gutterSpace;
  clone.name = cloneLayerName;
  clone.x = newX;
  clone.expanded = false;

  // find all text nodes in the selected page
  const textNodes = clone.findAll((node) => node.type === 'TEXT');
  const loadedFonts = {};

  // loop through text nodes and adjust
  textNodes.map(async (node) => {
    const styledTextSegments = node.getStyledTextSegments([
      'fontName',
      'fontWeight',
      'fontSize',
      'lineHeight'
    ]);

    // text node with mixed fonts require all fonts loaded before value can be set
    await Promise.all(
      styledTextSegments.map(({ fontName }) => {
        const { family, style } = fontName;
        const cacheKey = `${family}-${style}`;
        if (!loadedFonts[cacheKey])
          loadedFonts[cacheKey] = figma.loadFontAsync(fontName);
        return loadedFonts[cacheKey];
      })
    );

    styledTextSegments.forEach(async ({ fontSize, lineHeight, start, end }) => {
      if (typeof fontSize === 'number') {
        const { unit, value } = lineHeight;

        // Web: scale everything by 2
        let scaleFactor = 2;

        // Native: scale based on current fontSize
        if (pageType === 'native') {
          scaleFactor = 1.3;
          if (fontSize < 32) scaleFactor = 1.4;
          if (fontSize < 20) scaleFactor = 1.5;
        }

        const newFontSize = fontSize * scaleFactor;
        const newLineHeight = value * scaleFactor;

        node.setRangeFontSize(start, end, newFontSize);
        node.setRangeLineHeight(start, end, {
          unit,
          // set value if unit is Pixels or Percent
          // https://www.figma.com/plugin-docs/api/LineHeight/
          ...(unit !== 'AUTO' && { value: newLineHeight })
        });
      }
    });

    return null;
  });

  // if within section, move clone to within
  if (withinSection) {
    pageNode.parent.appendChild(clone);
  }

  // zoom figma view for new cloned page
  figma.viewport.scrollAndZoomIntoView([clone]);

  // let the user know the page has been cloned
  figma.notify('Layer cloned with Text Zoom applied!', {
    timeout: config.notifyTime
  });
};

export default { createClone };
