import * as React from 'react';

function SvgCustom() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="61" height="60" fill="none">
      <rect width="33" height="12" x="14.25" y="24" fill="#000" rx="2" />
    </svg>
  );
}

export default React.memo(SvgCustom);
