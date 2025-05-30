export default {
  // extra width for annotation layer section
  annotationWidth: 480,

  // time in miliseconds to display Figma message (figma.notify())
  notifyTime: 3000,

  // a11y layer data
  a11ySuffix: '| Accessibility Layer',
  a11yAnnotationLayerKey: 'Accessibility annotations Layer',
  a11yAnnotationLayerKeyV2: 'Accessibility annotations Checklist Layer',
  a11yMainLayers: [
    'Landmarks Layer',
    'Headings Layer',
    'Focus order Layer',
    'Reading order Layer',
    'Alt text Layer',
    'Contrast Layer',
    'Color blindness Layer',
    'Text zoom Layer',
    'Responsive reflow Layer',
    'Touch target Layer',
    'Complex gestures Layer',
    'Focus grouping Layer'
  ],
  a11yCheckboxLayers: [
    'Contrast Layer',
    'Text zoom Layer',
    'Responsive reflow Layer',
    'Color blindness Layer'
  ]
};
