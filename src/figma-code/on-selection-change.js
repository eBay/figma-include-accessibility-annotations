import config from '@/figma-code/config';
import headingTypes from '@/data/heading-types';

export default (
  pageSelected,
  listenForHeadings,
  defaultHeadingType,
  listenForAltText
) => {
  const { selection } = figma.currentPage;
  const selectionLength = selection.length;

  // default message type and data returned
  let msgResponseType = 'selection-change';
  let data = {};

  // alt text image processing
  async function processImageAsync() {
    if (selection.length === 1) {
      const selectedNode = selection[0];
      const { absoluteRenderBounds, id, name } = selectedNode;
      const EXPORT_SETTINGS = {
        format: 'PNG',
        contentsOnly: false,
        constraint: {
          type: 'SCALE',
          value: 1
        }
      };

      const imageBuffer = await selectedNode.exportAsync(EXPORT_SETTINGS);

      return {
        altText: name,
        id,
        name,
        bounds: absoluteRenderBounds,
        imageBuffer,
        displayType: 'manual',
        type: 'decorative'
      };
    }

    return null;
  }

  // is the user starting the accessibility flow with select a frame?
  if (!pageSelected && selectionLength === 0) {
    msgResponseType = 'start-frame';
  } else if (!pageSelected && selectionLength === 1) {
    const selectedNode = selection[0];
    const { id, name, parent, type } = selectedNode;

    // make sure the selected node is a FrameNode and on the Top-Level
    if (
      type === 'FRAME' &&
      (parent.type === 'PAGE' || parent.type === 'SECTION')
    ) {
      msgResponseType = 'start-frame';

      // check if Accessibility Layer was selected
      const isA11yLayer = name.includes(config.a11ySuffix);
      if (isA11yLayer) {
        data = {
          msg: "Please select a top-level frame (you've selected an Accessibility frame)"
        };
      } else {
        // on selection of top-level frame
        data = {
          id,
          name,
          mainPageId: parent.id,
          bounds: selectedNode.absoluteRenderBounds
        };

        // on selection, bring frame into view
        // (this works for selection from left nav and within the board)
        figma.viewport.scrollAndZoomIntoView([selectedNode]);
      }
    } else {
      // alert user of requirements
      msgResponseType = 'start-frame';
      data = { msg: 'Please select a top-level frame' };
    }
  } else if (!pageSelected && selectionLength > 1) {
    // alert user of requirements
    msgResponseType = 'start-frame';
    data = { msg: 'Please only select 1 frame at a time for scanning.' };
  } else if (listenForHeadings === true) {
    // filter out non-text types
    const onlyTextNodes = selection.filter((node) => node.type === 'TEXT');

    // were there layers selected that were not TEXT types?
    if (selection.length !== onlyTextNodes.length) {
      // notify user that only TEXT layers should be selected
      const notification = figma.notify('Please only select TEXT layers', {
        error: true
      });

      setTimeout(() => {
        notification.cancel();
      }, config.notifyTime);
    }

    // do we have valid data to send back to UI?
    if (onlyTextNodes.length > 0) {
      // format response returned
      const response = [];
      for (let i = 0; i < onlyTextNodes.length; i += 1) {
        const { id, characters, absoluteRenderBounds, name } = onlyTextNodes[i];

        // don't send the cursor focus text node
        if (name !== 'cursor-focus-node') {
          // sanitize: remove double returns, and returns
          const title = characters
            .replace(/[\n\n]/g, ' ')
            .replace(/[\n]/g, ' ');

          // add to response
          response.push({
            id,
            type: headingTypes[defaultHeadingType].value,
            title,
            bounds: absoluteRenderBounds,
            value: defaultHeadingType
          });
        }
      }

      // send message response back to plugin frontend (ui.js)
      if (response.length > 0) {
        msgResponseType = 'headings-selected';
        data = { selected: response };
      }
    }
  } else if (listenForAltText === true) {
    // process image for alt text
    processImageAsync(selection).then((selected) => {
      figma.ui.postMessage({
        data: { selected },
        type: 'alt-text-image-selected'
      });
    });

    return null;
  } else {
    // not a case for yet
    // console.log('Selection change detected');
  }

  // send message response back to plugin frontend (ui.js)
  figma.ui.postMessage({
    type: msgResponseType,
    data
  });

  return true;
};
