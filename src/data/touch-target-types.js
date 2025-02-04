import * as React from 'react';

// svg touch targets
import SvgTouchTargets from '@/icons/touch-target';

// setup touch target options
export default {
  min24: {
    icon: <SvgTouchTargets.SvgMin48 size={24} />,
    id: '1',
    value: 'min24',
    label: '24px<br />(WCAG min)'
  },
  min44: {
    icon: <SvgTouchTargets.SvgMin48 size={54} />,
    id: '2',
    value: 'min44',
    label: '44px<br />(iOS min)'
  },
  min48: {
    icon: <SvgTouchTargets.SvgMin48 size={60} />,
    id: '3',
    value: 'min48',
    label: '48px<br />(Android min)'
  },
  custom: {
    icon: <SvgTouchTargets.SvgCustom />,
    id: '4',
    value: 'custom',
    label: 'custom'
  }
};
