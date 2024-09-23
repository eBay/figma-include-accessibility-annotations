import * as React from 'react';
import PropTypes from 'prop-types';

function SvgImage({ fill = '#111820', size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill={fill} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.455 2.5A3.455 3.455 0 0 0 2 5.954V19.045a3.454 3.454 0 0 0 3.455 3.454h13.09A3.454 3.454 0 0 0 22 19.046V5.955A3.455 3.455 0 0 0 18.546 2.5H5.455ZM4 18.87v.175c0 .803.651 1.454 1.455 1.454h13.09c.804 0 1.455-.65 1.455-1.454v-.131l-4-4-2.293 2.293a1 1 0 0 1-1.488-.083l-3.246-4.057L4 18.87Zm16-2.785V5.955c0-.804-.651-1.455-1.454-1.455H5.455C4.65 4.5 4 5.15 4 5.954v9.842l4.24-4.947a1 1 0 0 1 1.54.026l3.303 4.127 2.21-2.21a1 1 0 0 1 1.414 0L20 16.085Z"
        fill={fill}
      />
    </svg>
  );
}

SvgImage.propTypes = {
  // optional
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number
};

export default React.memo(SvgImage);
