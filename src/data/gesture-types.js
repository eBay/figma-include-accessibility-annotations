import * as React from 'react';

// svg gestures
import SvgGestures from '../icons/complex-gestures';

// setup gesture options
export default {
  swipe: {
    id: '1',
    label: 'swipe',
    icon: <SvgGestures.SvgSwipe />
  },
  'pinch-and-zoom': {
    id: '2',
    label: 'pinch & zoom',
    icon: <SvgGestures.SvgPinchZoom />
  },
  'drag-and-drop': {
    id: '3',
    icon: <SvgGestures.SvgDragDrop />,
    label: 'drag & drop'
  },
  rotate: {
    id: '4',
    label: 'rotate',
    icon: <SvgGestures.SvgRotate />
  },
  'multi-finger': {
    id: '5',
    label: 'multi-finger tap',
    icon: <SvgGestures.SvgMultiFingerTap />
  }
};
