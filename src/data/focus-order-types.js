import * as React from 'react';

// focus order icons
import FocusOrderIcons from '@/icons/focus-order';

// setup focus order button options
export default {
  tabs: {
    icon: <FocusOrderIcons.SvgTabStops />,
    id: 'tabs',
    label: 'tab stops'
  },
  arrows: {
    icon: <FocusOrderIcons.SvgArrowKeys />,
    id: 'arrows',
    label: 'arrow keys'
  }
};
