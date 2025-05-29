import * as React from 'react';

function SvgReorder() {
  return (
    <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#000"
        fillOpacity=".8"
        d="M0 3h2v2H0zM4 3h2v2H4zM0 7h2v2H0zM4 7h2v2H4zM0 11h2v2H0zM4 11h2v2H4z"
      />
    </svg>
  );
}

export default React.memo(SvgReorder);
