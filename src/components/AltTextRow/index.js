import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@/constants';

// components
import Dropdown from '@/components/Dropdown';

// icons
import { SvgCopy } from '@/icons';

// app state
import Context from '@/context';

// data
import imageTypesArray from '@/data/dropdown-image-types.json';

// styles
import './styles.scss';

function AltTextRow(props) {
  // main app state
  const { zoomTo } = React.useContext(Context);

  // props data
  const { base64 = null, displayType, index, isDevMode = false } = props;
  const { image, imageBuffer = null, isOpened, warnClass = '' } = props;

  // image data
  const { id, altText, name, type } = image;

  // on functions
  const { onChange, onFocus, onOpen, onSelect, onRemove } = props;

  const canEdit = type === 'informative';

  // copy alt text to clipboard (dev mode)
  const copyTimerRef = React.useRef(null);
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text) => {
    try {
      if (window.navigator?.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (e) {
      // fallback for restricted iframe contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 3000);
  };

  React.useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    []
  );

  if (isDevMode === true) {
    const isInformative = type === 'informative';
    const altTextValue = isInformative ? `"${altText}"` : '" "';
    const purpose = isInformative ? 'Informative' : 'Decorative';

    return (
      <div className="alt-text-row-dev flex-row-center">
        <div className="alt-text-number">{index + 1}</div>

        <div
          aria-label="goto image"
          className="container-image-preview border-radius-xs cursor-pointer"
          onClick={() => zoomTo([id], true)}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) zoomTo([id], true);
          }}
          role="button"
          tabIndex="0"
        >
          {displayType === 'scanned' && (
            <img
              alt={name}
              className="image-preview"
              src={`data:image/png;base64,${base64}`}
            />
          )}

          {displayType === 'manual' && (
            <div
              alt={name}
              className="image-preview-blob"
              style={{
                backgroundImage: `url("${URL.createObjectURL(new Blob([imageBuffer]))}")`
              }}
            />
          )}
        </div>

        <div className="alt-text-dev-info">
          <div>
            <strong>Alt text:</strong> {altTextValue}
          </div>
          <div>
            <strong>Purpose:</strong> {purpose}
          </div>
        </div>

        {isInformative && altText && (
          <div className="alt-text-copy">
            {copied ? (
              <span className="alt-text-copied">Copied</span>
            ) : (
              <div
                aria-label="copy alt text"
                className="alt-text-copy-btn cursor-pointer svg-theme"
                onClick={() => copyToClipboard(altText)}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) copyToClipboard(altText);
                }}
                role="button"
                tabIndex="0"
              >
                <SvgCopy size={16} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="alt-text-row">
      <div
        className="container-image-preview border-radius-xs cursor-pointer"
        onClick={() => zoomTo([id], true)}
        onKeyDown={({ key }) => {
          if (utils.isEnterKey(key)) zoomTo([id], true);
        }}
        role="button"
        tabIndex="0"
      >
        {displayType === 'scanned' && (
          <img
            alt={name}
            className="image-preview"
            src={`data:image/png;base64,${base64}`}
          />
        )}

        {displayType === 'manual' && (
          <div
            alt={name}
            className="image-preview-blob"
            style={{
              backgroundImage: `url("${URL.createObjectURL(new Blob([imageBuffer]))}")`
            }}
          />
        )}

        <div className="scroll-to">scroll to</div>
      </div>

      <div className="muted">Alt text</div>

      {canEdit === false && <div className="input-na muted">n/a</div>}

      {canEdit && (
        <input
          className={`input${warnClass}`}
          type="text"
          onChange={onChange}
          onFocus={onFocus}
          placeholder="enter an Alt text here"
          value={altText}
        />
      )}

      {isDevMode === false && (
        <React.Fragment>
          <Dropdown
            data={imageTypesArray}
            index={index}
            isOpened={isOpened}
            onOpen={onOpen}
            onSelect={onSelect}
            type={type}
          />

          <div
            aria-label="remove alt text"
            className="btn-remove"
            onClick={onRemove}
            onKeyDown={(e) => {
              if (utils.isEnterKey(e.key)) onRemove();
            }}
            role="button"
            tabIndex="0"
          >
            <div className="remove-dash" />
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

AltTextRow.propTypes = {
  // required
  displayType: PropTypes.oneOf(['manual', 'scanned']).isRequired,
  image: PropTypes.shape({
    id: PropTypes.string.isRequired,
    altText: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,

  // optional
  base64: PropTypes.string,
  imageBuffer: PropTypes.instanceOf(Uint8Array),
  isDevMode: PropTypes.bool,
  warnClass: PropTypes.string
};

export default React.memo(AltTextRow);
