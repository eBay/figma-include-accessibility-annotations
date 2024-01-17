import * as React from 'react';

function SvgResize() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
      <path
        fill="#B3B3B3"
        fillRule="evenodd"
        d="m8 6.207.354-.353 2-2-.708-.708L8.5 4.293V0h-1v4.293L6.354 3.146l-.708.708 2 2L8 6.207Zm0 3.586.354.353 2 2-.708.708L8.5 11.707V16h-1v-4.293l-1.146 1.147-.708-.708 2-2L8 9.793ZM1 8.5h14v-1H1v1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default React.memo(SvgResize);
