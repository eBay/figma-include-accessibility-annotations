import * as React from 'react';

// svg gestures
import SvgGestures from '../icons/complex-gestures';

// setup gesture options
export default {
  swipe: {
    id: '1',
    label: 'swipe/slide/drag',
    icon: <SvgGestures.SvgSwipe />
  },
  'drag-and-drop': {
    id: '2',
    icon: <SvgGestures.SvgDragDrop />,
    label: 'drag & drop'
  },
  'pinch-and-zoom': {
    id: '3',
    label: 'pinch & zoom',
    icon: <SvgGestures.SvgPinchZoom />
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
