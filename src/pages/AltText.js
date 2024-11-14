import * as React from 'react';
import { utils } from '../constants';

// components
import {
  Alert,
  AltTextRow,
  AnnotationStepPage,
  HeadingStep,
  LoadingSpinner
} from '../components';

// icons
import { SvgCheck, SvgImage, SvgWarning } from '../icons';

// app state
import Context from '../context';

function AltText() {
  // main app state
  const cnxt = React.useContext(Context);
  const { imagesData, imageScan, imagesScanned, page } = cnxt;
  const { pageType, sendToFigma, updateState, zoomTo } = cnxt;

  // local state
  const [isLoading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState(null);
  const [openedDropdown, setOpenedDropdown] = React.useState(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);
  const [noImagesFound, setNoImagesFound] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  // ui state
  const routeName = 'Alt text';
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

  const createAltTextOverlay = () => {
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
          completesStep: true
        };
      }

      if (imagesScanned.length === 0) {
        return {
          completesStep: false,
          onClick: onScanForImages,
          buttonText: 'Scan for images'
        };
      }

      if (hasImages) {
        return {
          completesStep: !flaggedImages.length,
          onClick: createAltTextOverlay
        };
      }
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
    const { data, type } = event.data.pluginMessage;

    // only listen for this response type on this step
    if (type === 'alt-text-image-selected') {
      setSelectedImage(data.selected);
    }
  };

  React.useEffect(() => {
    // mount
    window.addEventListener('message', onMessageListen);

    // start listening for alt text image selected if we have images
    if (imagesScanned.length > 0) {
      sendToFigma('alt-text-listening-flag', { listen: true });
    }

    return () => {
      // unmount
      window.removeEventListener('message', onMessageListen);

      // stop listening for alt text image selected
      sendToFigma('alt-text-listening-flag', { listen: false });
    };
  }, []);

  return (
    <AnnotationStepPage
      title="Images"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {hasImages === false && (
          <HeadingStep number={1} text="Make a list of images in your design" />
        )}

        {isLoading && (
          <React.Fragment>
            <div className="spacer4" />
            <div className="w-100 flex-center">
              <LoadingSpinner size={36} />
              <div className="muted font-12 pt1">Scanning for images...</div>
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
    </AnnotationStepPage>
  );
}

export default React.memo(AltText);
