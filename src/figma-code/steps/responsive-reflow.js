import config from '../config';

export const createResponsiveDesigns = (msg) => {
  const { breakpoints, page } = msg;
  const { id: pageId } = page;

  // get selected page node
  const pageNode = figma.getNodeById(pageId);

  const gutterSpace = 124;
  let startX = pageNode.x + pageNode.width + config.annotationWidth;

  const createdScreens = [];
  breakpoints.forEach((screenSpec) => {
    const { name, width } = screenSpec;

    // clone selected page
    const clone = pageNode.clone();
    const cloneLayerName = `${pageNode.name} | Responsive | ${name}`;

    clone.name = cloneLayerName;
    clone.x = startX + gutterSpace;
    clone.layoutMode = 'VERTICAL';
    clone.layoutSizingHorizontal = 'HUG';

    clone.resize(width, clone.height);
    startX = clone.x + width;

    createdScreens.push(clone);
  });

  // set selection and view in Figma
  figma.currentPage.selection = createdScreens;
  figma.viewport.scrollAndZoomIntoView(createdScreens);

  // now that they are on the canvas, close the layers up
  createdScreens.forEach((screen) => {
    screen.expanded = false;
  });
};

export const saveBreakpoints = async (msg) => {
  const { breakpoints } = msg;

  // session update
  const { setAsync } = figma.clientStorage;
  const breakpointsStr = JSON.stringify(breakpoints);
  await setAsync('prefBreakpoints', breakpointsStr);
};

export default { createResponsiveDesigns, saveBreakpoints };
