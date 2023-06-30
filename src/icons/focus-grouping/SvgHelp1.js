import * as React from 'react';

function SvgHelp1() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="194" height="48" fill="none">
      <rect width="194" height="48" fill="#fff" rx="4" />
      <rect width="66" height="4" x="17" y="18" fill="#C7C7C7" rx="2" />
      <rect width="76" height="4" x="17" y="25" fill="#C7C7C7" rx="2" />
      <path
        fill="#C7C7C7"
        fillRule="evenodd"
        d="M153.017 14.739c.989-.057 1.977-.052 2.967-.052h5.013c1.009 0 1.997-.005 2.986.052.899.051 1.775.16 2.647.404a8.679 8.679 0 0 1 4.595 3.103 8.66 8.66 0 0 1 0 10.509 8.682 8.682 0 0 1-4.595 3.103c-.872.243-1.748.352-2.647.404-.989.057-1.977.051-2.966.051l-5.015.001c-1.008 0-1.996.005-2.985-.052-.899-.052-1.774-.16-2.646-.404a8.665 8.665 0 0 1 0-16.714c.872-.245 1.747-.354 2.646-.405Z"
        clipRule="evenodd"
      />
      <g filter="url(#a)">
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M152.814 31.177a7.676 7.676 0 1 0-.001-15.353 7.676 7.676 0 0 0 .001 15.353Z"
          clipRule="evenodd"
        />
      </g>
      <rect
        width="172"
        height="29"
        x="9"
        y="9"
        stroke="#707070"
        strokeDasharray="3 4"
        strokeLinecap="round"
        rx="4"
      />
      <defs>
        <filter
          id="a"
          width="24.451"
          height="24.451"
          x="140.588"
          y="12.981"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="1.706" />
          <feGaussianBlur stdDeviation=".284" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_4334_330"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="1.706" />
          <feGaussianBlur stdDeviation="2.275" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
          <feBlend
            in2="effect1_dropShadow_4334_330"
            result="effect2_dropShadow_4334_330"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect2_dropShadow_4334_330"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default React.memo(SvgHelp1);
