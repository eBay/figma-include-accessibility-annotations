import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@/constants';

// components
import Dropdown from '@/components/Dropdown';

// data
import imageTypesArray from '@/data/dropdown-image-types.json';

// app state
import Context from '@/context';

// styles
import './styles.scss';

function AltTextRow(props) {
  // main app state
  const { zoomTo } = React.useContext(Context);

  // props data
  const { base64 = null, displayType, index } = props;
  const { image, imageBuffer = null, isOpened, warnClass = '' } = props;

  // image data
  const { id, altText, name, type } = image;

  // on functions
  const { onChange, onFocus, onOpen, onSelect, onRemove } = props;

  const canEdit = type === 'informative';

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
  warnClass: PropTypes.string
};

export default React.memo(AltTextRow);
