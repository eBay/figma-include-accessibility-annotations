import * as React from 'react';

// svg touch targets
import SvgTouchTargets from '../icons/touch-target';

// setup touch target options
export default {
  min24: {
    icon: <SvgTouchTargets.SvgMin48 />,
    id: '1',
    value: 'min24',
    label: 'min 24px'
  },
  custom: {
    icon: <SvgTouchTargets.SvgCustom />,
    id: '2',
    value: 'custom',
    label: 'custom'
  }
};
