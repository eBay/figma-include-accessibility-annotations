import * as React from 'react';

// svg reading order
import SvgReadingOrder from '../icons/reading-order';

// setup reading order button options
export default {
  down: {
    icon: <SvgReadingOrder.SvgDown />,
    id: 'down',
    label: 'down'
  },
  right: {
    icon: <SvgReadingOrder.SvgRight />,
    id: 'right',
    label: 'right'
  },
  left: {
    icon: <SvgReadingOrder.SvgLeft />,
    id: 'left',
    label: 'left'
  },
  up: {
    icon: <SvgReadingOrder.SvgUp />,
    id: 'up',
    label: 'up'
  },
  downLeft: {
    icon: <SvgReadingOrder.SvgDownLeft />,
    id: 'downLeft',
    label: 'down & left'
  },
  downRight: {
    icon: <SvgReadingOrder.SvgDownRight />,
    id: 'downRight',
    label: 'down & right'
  },
  upRight: {
    icon: <SvgReadingOrder.SvgUpRight />,
    id: 'upRight',
    label: 'up & right'
  },
  upLeft: {
    icon: <SvgReadingOrder.SvgUpLeft />,
    id: 'upLeft',
    label: 'up & left'
  }
};
