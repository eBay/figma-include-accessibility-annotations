import * as React from 'react';
import { getPluginMessage, utils } from '@/constants';

// components
import {
  Alert,
  AltTextRow,
  AnnotationStepPage,
  DevStepIncomplete,
  HeadingStep,
  LoadingSpinner
} from '@/components';

// icons
import { SvgCheck, SvgImage, SvgWarning } from '@/icons';

// app state
import Context from '@/context';

function AltText() {
  // main app state
  const cnxt = React.useContext(Context);
  const { imagesData, imageScan, imagesScanned, isDevMode, page } = cnxt;
  const { pageType, sendToFigma, stepsCompleted, updateState, zoomTo } = cnxt;

  // local state
  const [isLoading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState(null);
  const [openedDropdown, setOpenedDropdown] = React.useState(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
  const [noImagesFound, setNoImagesFound] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  // ui state
  const routeName = 'Alt text';
  const isCompleted = stepsCompleted.includes(routeName);
  const hasImages = imagesData.length > 0;
  const hasSelectedImage = selectedImage !== null;
  const alreadySelected =
    hasSelectedImage &&
    imagesScanned.some((img) => img.id === selectedImage.id);
  const selectedText = alreadySelected
    ? 'This is already in the image list'
    : `"${selectedImage?.name}" selected`;
  const manualText = hasSelectedImage
    ? selectedText
    : 'Hold Ctrl/Cmd to select more images for annotations (e.g., icons).';

  const flaggedImages = imagesData
    .filter(
      ({ altText, type, name }) =>
        type === 'informative' && (altText === name || altText.length < 3)
    )
    .map((imageData) => imageData.id);
  const showWarning = hasAttemptedSubmit && flaggedImages.length > 0;
  const addS = flaggedImages.length > 1 ? 's' : '';

  const onChange = (e, index) => {
    const newImagesData = [...imagesData];

    // don't allow | or :
    newImagesData[index].altText = e.target.value.replace(/[|:]/g, '');
    updateState('imagesData', newImagesData);
  };

  const onTypeSelect = (type, index) => {
    const newImagesData = [...imagesData];
    newImagesData[index].type = type;

    updateState('imagesData', newImagesData);
  };

  const onRemove = (index) => {
    const newImagesData = [...imagesData];
    const newImagesScanned = [...imagesScanned];

    newImagesData.splice(index, 1);
    newImagesScanned.splice(index, 1);

    updateState('imagesData', newImagesData);
    updateState('imagesScanned', newImagesScanned);
  };

  const createAltTextOverlay = () => {
    if (isDevMode) return;

    // issues with alt text?
    if (flaggedImages.length > 0) {
      setHasAttemptedSubmit(true);
    } else {
      // send to Figma, create alt text annotation layer
      sendToFigma('add-alt-text', { page, pageType, images: imagesData });
    }
  };

  React.useEffect(() => {
    if (isLoading && imagesScanned.length > 0) {
      // once we have images back from the scanning, create new data array

      // loading completed
      setLoading(false);

      // map new images scanned to array of objects for alt text, etc.
      const newImagesData = imagesScanned.map((image) => {
        const { id, name, bounds } = image;

        return {
          id,
          name,
          altText: name,
          type: 'decorative',
          bounds
        };
      });

      updateState('imagesData', newImagesData);

      // start listening for alt text image selected
      sendToFigma('alt-text-listening-flag', { listen: true });
    } else if (isLoading) {
      // if loading, and no images returned, let user know
      setLoading(false);
      setNoImagesFound(true);
      setMsg('No images were found!');

      // start listening for alt text image selected
      sendToFigma('alt-text-listening-flag', { listen: true });
    } else {
      // map new images scanned to array of objects for alt text, etc.
      const newImagesData = imagesScanned.map((image) => {
        const { altText, id, name, bounds, type } = image;
        const existingData = imagesData.find((img) => img.id === id);

        return {
          id,
          name,
          altText: existingData ? existingData.altText : altText,
          type: existingData ? existingData.type : type,
          bounds
        };
      });

      updateState('imagesData', newImagesData);
    }
  }, [imagesScanned]);

  const onScanForImages = () => {
    // set loading state
    setLoading(true);
    setMsg(null);

    // image scan was killing the thread, causing loading state to not show, so delaying
    // https://www.figma.com/plugin-docs/frozen-plugins/
    setTimeout(() => {
      // search document for images
      imageScan();
    }, 100);
  };

  const getPrimaryAction = () => {
    if (!isLoading) {
      if (noImagesFound) {
        return {
          ...(isDevMode && { buttonText: 'Next' }),
          completesStep: true
        };
      }

      if (imagesScanned.length === 0) {
        return {
          buttonText: isDevMode ? 'Next' : 'Scan for images',
          completesStep: isDevMode,
          ...(isDevMode === false && { onClick: onScanForImages })
        };
      }

      if (hasImages) {
        return {
          ...(isDevMode && { buttonText: 'Next' }),
          completesStep: isDevMode ? true : !flaggedImages.length,
          onClick: createAltTextOverlay
        };
      }
    }

    return null;
  };

  const getSecondaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: 'Prev',
        onClick: () => null,
        isPrev: true
      };
    }

    return null;
  };

  const addImageManually = () => {
    const newImagesScanned = [...imagesScanned];
    // make sure id is unique in object
    const exists = newImagesScanned.some((img) => img.id === selectedImage.id);

    // if image already exists, don't add it again
    if (exists === false) {
      newImagesScanned.push(selectedImage);

      updateState('imagesScanned', newImagesScanned);

      // add image manually to scanned list
      sendToFigma('add-image-manually', { selected: selectedImage });
    }

    // reset message (if no images were found during initial scan)
    setNoImagesFound(false);
    setMsg(null);
  };

  const onMessageListen = async (event) => {
    const pluginMessage = getPluginMessage(event, { isDevMode });
    if (!pluginMessage) return;

    const { data, type } = pluginMessage;

    // only listen for this response type on this step
    if (type === 'alt-text-image-selected') {
      setSelectedImage(data.selected);
    }
  };

  React.useEffect(() => {
    // mount
    if (isDevMode === false) {
      window.addEventListener('message', onMessageListen);

      // start listening for alt text image selected if we have images
      if (imagesScanned.length > 0) {
        sendToFigma('alt-text-listening-flag', { listen: true });
      }
    }

    return () => {
      // unmount
      if (isDevMode === false) {
        window.removeEventListener('message', onMessageListen);

        // stop listening for alt text image selected
        sendToFigma('alt-text-listening-flag', { listen: false });
      }
    };
  }, []);

  return (
    <AnnotationStepPage
      title={isDevMode ? 'Alternative text' : 'Images'}
      completed={isCompleted}
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        {isDevMode === false && (
          <React.Fragment>
            {hasImages === false && (
              <HeadingStep
                number={1}
                text="Make a list of images in your design"
              />
            )}

            {isLoading && (
              <React.Fragment>
                <div className="spacer4" />
                <div className="w-100 flex-center">
                  <LoadingSpinner size={36} />
                  <div className="muted font-12 pt1">
                    Scanning for images...
                  </div>
                </div>
              </React.Fragment>
            )}

            {msg && (
              <React.Fragment>
                <div className="spacer2" />

                <div className="flex-row-center">
                  <div className="circle-success svg-theme-success mr1">
                    <SvgCheck size={14} />
                  </div>

                  <p>{msg}</p>
                </div>
              </React.Fragment>
            )}

            {hasImages && (
              <React.Fragment>
                <HeadingStep
                  number={2}
                  text="Mark images as decorative or informative where appropriate.<br>Add alt text for all informative images."
                />

                <React.Fragment>
                  {showWarning && (
                    <React.Fragment>
                      <Alert
                        icon={<SvgWarning />}
                        style={{ padding: 0 }}
                        text={`Add Alt text to the Informative image${addS}`}
                        type="warning"
                      />
                      <div className="spacer2" />
                    </React.Fragment>
                  )}

                  {imagesData.map((image, index) => {
                    const { base64, displayType, imageBuffer } =
                      imagesScanned[index];
                    const { id, type } = image;

                    // case for placeholder (legacy)
                    if (type !== 'informative' && type !== 'decorative') {
                      return null;
                    }

                    const isOpened = openedDropdown === index;

                    // is flagged for not having alt text on Informative image
                    const warnClass =
                      showWarning && flaggedImages.includes(id)
                        ? ' warning'
                        : '';

                    return (
                      <AltTextRow
                        key={id}
                        base64={base64}
                        displayType={displayType}
                        image={image}
                        imageBuffer={imageBuffer}
                        index={index}
                        isOpened={isOpened}
                        onChange={(e) => onChange(e, index)}
                        onFocus={(e) => {
                          // select all text for easy removal
                          e.target.select();

                          // zoom to image in figma
                          zoomTo([id], true);
                        }}
                        onOpen={setOpenedDropdown}
                        onSelect={onTypeSelect}
                        onRemove={() => onRemove(index)}
                        warnClass={warnClass}
                      />
                    );
                  })}
                </React.Fragment>
              </React.Fragment>
            )}

            {(hasImages || noImagesFound) && (
              <React.Fragment>
                <div className="spacer1" />
                <div className="divider" />
                <div className="spacer3" />

                <HeadingStep number={hasImages ? 3 : 2} text={manualText} />

                <div className="container-selection-button">
                  <div
                    aria-label="add image"
                    className="selection-button"
                    onClick={() => {
                      if (hasSelectedImage) addImageManually();
                    }}
                    onKeyDown={(e) => {
                      if (utils.isEnterKey(e.key) && hasSelectedImage) {
                        addImageManually();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <SvgImage />
                    </div>
                  </div>

                  <div className="selection-button-label">add selected</div>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {isDevMode === true && isCompleted === false && (
          <DevStepIncomplete
            label="alternative text"
            text="The Alternative text annotation step was not completed. Check with the designer about completing it."
          />
        )}

        {isDevMode === true && isCompleted && (
          <React.Fragment>
            <HeadingStep text="Implement" />
            <ul className="disc">
              <li>
                Add alternative text for the informative images using provided
                text. Skip if the visible label is next to an image.
              </li>
              <li>Implement all remaining images as decorative.</li>
            </ul>

            <div className="space-md" />
            <div className="divider" />
            <div className="space-md" />

            {hasImages && (
              <React.Fragment>
                {imagesData.map((image, index) => {
                  const { id, type } = image;

                  // match image data by id (dev mode order may differ)
                  const scanned =
                    imagesScanned.find((img) => img.id === id) ||
                    imagesScanned[index] ||
                    {};
                  const { base64, displayType, imageBuffer } = scanned;

                  // case for placeholder (legacy)
                  if (type !== 'informative' && type !== 'decorative') {
                    return null;
                  }

                  const isOpened = openedDropdown === index;

                  // is flagged for not having alt text on Informative image
                  const warnClass =
                    showWarning && flaggedImages.includes(id) ? ' warning' : '';

                  return (
                    <AltTextRow
                      key={id}
                      base64={base64}
                      displayType={displayType}
                      image={image}
                      imageBuffer={imageBuffer}
                      index={index}
                      isOpened={isOpened}
                      onChange={(e) => onChange(e, index)}
                      onFocus={(e) => {
                        // select all text for easy removal
                        e.target.select();

                        // zoom to image in figma
                        zoomTo([id], true);
                      }}
                      onOpen={setOpenedDropdown}
                      onSelect={onTypeSelect}
                      onRemove={() => onRemove(index)}
                      warnClass={warnClass}
                      isDevMode={isDevMode}
                    />
                  );
                })}
                <div className="space-md" />
              </React.Fragment>
            )}

            {hasImages === false && (
              <React.Fragment>
                <div className="space-sm" />
                <p className="muted">No images set</p>
                <div className="space-md" />
              </React.Fragment>
            )}

            <HeadingStep text="Test" />
            <ul className="disc">
              <li>Run an automated accessibility test.</li>
              <li>
                Verify images with alternative text announce as expected in a
                screenreader &amp; decorative images do not announce.
              </li>
            </ul>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default React.memo(AltText);
