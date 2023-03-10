import { figmaLayer, utils } from '../../constants';
// import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

export const add = (msg) => {
  const { create, layerName, page, pageType } = msg;

  // main data and setup
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const mainFrame = getOrCreateMainA11yFrame({ page, pageType });

  // does step layer exist already?
  const layerExists = utils.checkIfChildNameExists(mainFrame.id, layerName);
  let status = 'add';
  let layerId = null;

  // if layer exist and create is false, delete it
  if (layerExists !== null && create === false) {
    const oldAltTextFrame = figma.getNodeById(layerExists);
    // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
    oldAltTextFrame.remove();

    status = 'remove';

    // if no more children in main A11y layer, delete the layer
    // if (mainFrame.children.length === 0) {
    //   mainFrame.remove();
    // }
  } else if (layerExists === null && create === true) {
    // create the layer frame
    const layerFrame = figmaLayer.createTransparentFrame({
      name: layerName,
      height: 10,
      width: 10
    });

    // update with id (for future scanning)
    layerFrame.name = `${layerName} | ${layerFrame.id}`;
    layerFrame.expanded = false;
    layerFrame.visible = false;

    layerId = layerFrame.id;

    // add within main Accessibility layer
    mainFrame.appendChild(layerFrame);
  }

  // grab main page a11y scan was for
  const { currentPage } = figma;
  const [originalPage] = currentPage.children.filter(
    (c) => c.name === saniName
  );

  // update pagesData
  const stepKey = layerName.replace(/ Layer/g, '');

  figma.ui.postMessage({
    type: 'update-pages-data',
    data: {
      status,
      stepKey,
      [stepKey]: {
        id: layerId
      },
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: originalPage.id,
        page: {
          bounds,
          id: originalPage.id,
          mainPageId,
          name: saniName
        }
      }
    }
  });
};

export default { add };
