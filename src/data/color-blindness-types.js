import * as React from 'react';

// color blindness svgs
import ColorBlindness from '@/icons/color-blindness';

// setup color blindness options
export default {
  deuteranomaly: {
    id: '2',
    desc: 'Deuteranomaly—reduced sensitivity to green trouble distinguishing reds & greens',
    icon: <ColorBlindness.SvgDeuteranomaly />,
    population: '5.3%',
    value: 'Deuteranomaly'
  },
  deuteranopia: {
    id: '3',
    desc: "Deuteranopia—can't see greens at all",
    icon: <ColorBlindness.SvgDeuteranopia />,
    population: '1.2%',
    value: 'Deuteranopia'
  },
  protanomaly: {
    id: '4',
    desc: 'Protonomaly—reduced sensitivity to red trouble distinguishing reds & greens',
    icon: <ColorBlindness.SvgProtonomaly />,
    population: '1.3%',
    value: 'Protanomaly'
  },
  protanopia: {
    id: '5',
    desc: "Protanopia—can't see reds at all",
    icon: <ColorBlindness.SvgProtanopia />,
    population: '1.5%',
    value: 'Protanopia'
  },
  tritanopia: {
    id: '6',
    desc: "Tritanopia—can't distinguish blues and greens, purples and reds, and yellows and pinks",
    icon: <ColorBlindness.SvgTritanopia />,
    population: '0.03%',
    value: 'Tritanopia'
  },
  achromatomaly: {
    id: '7',
    desc: 'Achromatomaly—sees the absence of most colors',
    icon: <ColorBlindness.SvgAchromatomaly />,
    population: '0.09%',
    value: 'Achromatomaly'
  },
  achromatopsia: {
    id: '8',
    desc: 'Achromatopsia—full color blindness, can only see shades',
    icon: <ColorBlindness.SvgAchromatopsia />,
    population: '0.05%',
    value: 'Achromatopsia'
  },
  normal: {
    id: '1',
    desc: 'Trichromatic—can distinguish all the primary colours',
    icon: <ColorBlindness.SvgOriginal />,
    population: '68%',
    value: 'Tritanomaly'
  }
};
