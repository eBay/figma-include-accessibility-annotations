import * as React from 'react';

const SvgFocusGroup = () => (
  <svg
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 1H1V14"
      stroke="#191919"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 32L32 32L32 19"
      stroke="#191919"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 14L32 1L19 0.999999"
      stroke="#191919"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 19L1 32L14 32"
      stroke="#191919"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default React.memo(SvgFocusGroup);
