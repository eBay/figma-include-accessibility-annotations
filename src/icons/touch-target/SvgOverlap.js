import * as React from 'react';

function SvgOverlap() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
      <circle cx="6" cy="8" r="3.5" stroke="#8F8F8F" />
      <circle cx="10" cy="8" r="3.5" stroke="#8F8F8F" />
    </svg>
  );
}

export default React.memo(SvgOverlap);
