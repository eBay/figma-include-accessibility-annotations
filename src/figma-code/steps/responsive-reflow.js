export const createResponsiveDesigns = (msg) => {
  const { page } = msg;
  const { id: pageId } = page;

  // get selected page node
  const pageNode = figma.getNodeById(pageId);

  console.log('pageNode', pageNode);
};

export default { createResponsiveDesigns };
