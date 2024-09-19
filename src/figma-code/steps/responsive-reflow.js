import config from '../config';

export const createResponsiveDesigns = (msg) => {
  const { currentPage } = figma;
  const { breakpoints, page } = msg;
  const { id: pageId } = page;

  // get selected page node
  const pageNode = figma.getNodeById(pageId);

  // get all those dimensions
  const { x, width } = pageNode;
  const { annotationWidth } = config;
  let startX = x + width + annotationWidth;

  // does text resizing page exist?
  let hasTextResizingPage = null;
  const checkName = (name) => {
    const check = `${pageNode.name} Text Zoom`;

    return name.startsWith(check);
  };

  // loop through all high level pages and section pages
  currentPage.children.forEach((topLevel) => {
    const { name, type } = topLevel;

    // account for sections
    if (type === 'SECTION') {
      // loop through section pages
      topLevel.children.forEach((sectionPage) => {
        if (checkName(sectionPage.name)) {
          hasTextResizingPage = sectionPage;
        }
      });
    } else if (checkName(name)) {
      hasTextResizingPage = topLevel;
    }
  });

  // if Text Zoom page exists, get dimensions
  if (hasTextResizingPage !== null) {
    startX = hasTextResizingPage.x + hasTextResizingPage.width;
  }

  // are we within a section?
  const withinSection = pageNode.parent.type === 'SECTION';

  try {
    const gutterSpace = 124;
    const createdScreens = [];
    breakpoints.forEach((screenSpec) => {
      const { label, size } = screenSpec;

      // clone selected page
      const clone = pageNode.clone();
      const cloneLayerName = `${pageNode.name} | Responsive | ${label}`;
      clone.name = cloneLayerName;
      clone.x = startX + gutterSpace;
      clone.layoutMode = 'VERTICAL';
      clone.layoutSizingHorizontal = 'HUG';

      clone.resize(size, clone.height);
      startX = clone.x + size;

      createdScreens.push(clone);

      // if within section, move clone to within
      if (withinSection) {
        pageNode.parent.appendChild(clone);
      }
    });

    // set selection and view in Figma
    figma.currentPage.selection = createdScreens;
    figma.viewport.scrollAndZoomIntoView(createdScreens);

    // now that they are on the canvas, close the layers up
    createdScreens.forEach((screen) => {
      screen.expanded = false;
    });
  } catch (err) {
    console.log('ERROR :: createResponsiveDesigns()');
    console.log(err);
  }
};

export const saveBreakpoints = async (msg) => {
  const { breakpoints } = msg;

  // session update
  const { setAsync } = figma.clientStorage;
  const breakpointsStr = JSON.stringify(breakpoints);
  await setAsync('prefBreakpoints', breakpointsStr);
};

export default { createResponsiveDesigns, saveBreakpoints };
