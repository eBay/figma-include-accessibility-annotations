import * as React from 'react';
import PropTypes from 'prop-types';

// components
import Dropdown from './Dropdown';

// data
import imageTypesArray from '../data/dropdown-image-types.json';

// app state
import Context from '../context';

function AltTextRow(props) {
  // main app state
  const { zoomTo } = React.useContext(Context);

  // image data and flags
  const { base64, image, index, isOpened, warnClass } = props;
  const { id, altText, name, type } = image;

  // on functions
  const { onChange, onFocus, onOpen, onSelect } = props;

  const canEdit = type === 'informative';

  return (
    <div className="alt-text-row">
      <div
        className="container-image-preview border-radius-xs cursor-pointer"
        onClick={() => zoomTo([id], true)}
        onKeyPress={() => zoomTo([id], true)}
        role="button"
        tabIndex="-1"
      >
        <img
          alt={name}
          className="image-preview"
          src={`data:image/png;base64,${base64}`}
        />

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
    </div>
  );
}

AltTextRow.defaultProps = {
  warnClass: ''
};

AltTextRow.propTypes = {
  // required
  base64: PropTypes.string.isRequired,
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

  // optional
  warnClass: PropTypes.string
};

export default React.memo(AltTextRow);
