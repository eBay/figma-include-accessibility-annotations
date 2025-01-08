import { figmaLayer, utils } from '../../constants';
// import config from '../config';
import { getOrCreateMainA11yFrame } from '../frame-helpers';

export const add = async (msg) => {
  const { create, layerName, page, pageType, existingData, stateKey } = msg;

  // main data and setup
  const { bounds, mainPageId, name } = page;

  // top layer namings
  const saniName = utils.sanitizeName(name);

  // get main A11y frame if it exists (or create it)
  const mainFrame = await getOrCreateMainA11yFrame({ page, pageType });

  // does step layer exist already?
  const layerExists = await utils.checkIfChildNameExists(
    mainFrame.id,
    layerName
  );
  let status = 'add';
  let layerId = null;

  try {
    // if layer exist and create is false, delete it
    if (layerExists !== null && create === false) {
      const oldAltTextFrame = await figma.getNodeByIdAsync(layerExists);
      // https://www.figma.com/plugin-docs/api/properties/nodes-remove/
      oldAltTextFrame.remove();

      status = 'remove';

      // if no more children in main A11y layer, delete the layer
      // if (mainFrame.children.length === 0) {
      //   mainFrame.remove();
      // }
    } else if (create) {
      if (layerExists === null) {
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
      } else {
        layerId = layerExists;
      }
    }

    const { currentPage } = figma;

    // grab main page a11y scan was for
    let originalPage = null;
    currentPage.children.forEach((topLevel) => {
      // account for sections
      if (topLevel.type === 'SECTION') {
        // loop through section pages
        topLevel.children.forEach((sectionPage) => {
          if (sectionPage.name === saniName) {
            originalPage = sectionPage;
          }
        });
      } else if (topLevel.name === saniName) {
        originalPage = topLevel;
      }
    });

    // update pagesData
    const stepKey = layerName.replace(/ Layer/g, '');

    const updateData = { id: layerId };
    if (existingData) {
      updateData.existingData = existingData;
    }

    figma.ui.postMessage({
      type: 'update-pages-data',
      data: {
        status,
        stepKey,
        stateKey,
        [stepKey]: updateData,
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
  } catch (err) {
    /* eslint-disable */
    console.log('ERROR :: step.checkmark.add()');
    console.log(err);
    /* eslint-enable */
  }
};

export default { add };
