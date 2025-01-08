export const getDesignFile = async (msg) => {
  const { page } = msg;

  const frameNode = await figma.getNodeByIdAsync(page.id);
  const duplicate = frameNode.clone();

  const EXPORT_SETTINGS = {
    format: 'PNG',
    contentsOnly: false,
    constraint: {
      type: 'SCALE',
      value: 1
    }
  };

  const imageWithTextLayers = await duplicate.exportAsync(EXPORT_SETTINGS);

  // clean up behind ourselves
  duplicate.remove();

  const result = {
    imageWithTextLayers
  };

  figma.ui.postMessage({
    type: 'color-blindness-design-image',
    data: {
      result
    }
  });
};

export default {
  getDesignFile
};
