import * as React from 'react';

function SvgTabStops() {
  return (
    <svg width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m24 10 4.6 4.6-4.6 4.6"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 6V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-4M29 10v9M27.5 14.5h-13"
        stroke="#000"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default React.memo(SvgTabStops);
