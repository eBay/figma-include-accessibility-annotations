import { utils } from '../constants';
import config from './config';
import designerChecks from './designer-checks';
import { getMainA11yLayerName } from './frame-helpers';

export default function initializePage({
  pageType,
  page,
  stepsCompleted,
  steps,
  stepsNative
}) {
  const mainLayerName = getMainA11yLayerName({ pageName: page.name, pageType });
  const saniName = utils.sanitizeName(page.name);

  const { x, y, height, width } = page.bounds;

  const mainFrame = utils.frameExistsOrCreate(page.mainPageId, mainLayerName, {
    x,
    y,
    height,
    width: width + config.annotationWidth
  });

  // Initialize the designer checks frame on page creation
  designerChecks.createOrUpdateDesignerChecksFrame({
    page,
    pageType,
    steps,
    stepsNative,
    stepsCompleted
  });

  // Initialize data for the page
  figma.ui.postMessage({
    type: 'initialize-pages-data',
    data: {
      main: {
        id: mainFrame.id,
        name: saniName,
        pageId: page.id,
        page
      }
    }
  });
}
