import * as React from 'react';

function SvgHelp2() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="194" height="48" fill="none">
      <rect width="194" height="48" fill="#fff" rx="4" />
      <rect
        width="172"
        height="34"
        x="11"
        y="7"
        stroke="#707070"
        strokeDasharray="3 4"
        strokeLinecap="round"
        rx="4"
      />
      <rect width="22" height="22" x="23" y="13" fill="#C7C7C7" rx="1.319" />
      <rect width="90" height="4" x="54" y="19" fill="#C7C7C7" rx="2" />
      <rect width="60" height="4" x="54" y="26" fill="#C7C7C7" rx="2" />
    </svg>
  );
}

export default React.memo(SvgHelp2);
