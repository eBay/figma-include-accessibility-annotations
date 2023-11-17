export const createResponsiveDesigns = (msg) => {
  const { page } = msg;
  const { id: pageId } = page;

  // get selected page node
  const pageNode = figma.getNodeById(pageId);

  console.log('pageNode', pageNode);
};

export const saveBreakpoints = async (msg) => {
  const { breakpoints } = msg;

  // session update
  const { setAsync } = figma.clientStorage;
  const breakpointsStr = JSON.stringify(breakpoints);
  await setAsync('prefBreakpoints', breakpointsStr);
};

export default { createResponsiveDesigns, saveBreakpoints };
