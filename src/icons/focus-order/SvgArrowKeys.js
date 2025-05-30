import * as React from 'react';

function SvgArrowKeys() {
  return (
    <svg width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m18 10 4.6 4.6-4.6 4.6M12.6 19.2 8 14.6l4.6-4.6"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 1H3a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Z"
        stroke="#000"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

export default React.memo(SvgArrowKeys);
