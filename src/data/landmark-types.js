import * as React from 'react';

// svg landmarks
import SvgLandmarks from '../icons/landmarks';

// setup landmark options
export default {
  header: {
    icon: <SvgLandmarks.SvgBanner />,
    label: '<header>'
  },
  search: {
    icon: <SvgLandmarks.SvgSearch />,
    label: 'search'
  },
  nav: {
    icon: <SvgLandmarks.SvgNavigation />,
    label: '<nav>'
  },
  main: {
    icon: <SvgLandmarks.SvgMain />,
    label: '<main>'
  },
  footer: {
    icon: <SvgLandmarks.SvgContentInfo />,
    label: '<footer>'
  },
  aside: {
    icon: <SvgLandmarks.SvgComplimentary />,
    label: '<aside>'
  },
  form: {
    icon: <SvgLandmarks.SvgForm />,
    label: '<form>'
  },
  section: {
    icon: <SvgLandmarks.SvgRegion />,
    label: '<section>'
  }
};
