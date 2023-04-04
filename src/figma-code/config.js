export default {
  // extra width for annotation layer section
  annotationWidth: 480,

  // time in miliseconds to display Figma message (figma.notify())
  notifyTime: 3000,

  // a11y layer data
  a11ySuffix: '| Accessibility Layer',
  a11yMainLayers: [
    'Landmarks Layer',
    'Headings Layer',
    'Reading order Layer',
    'Alt text Layer',
    'Contrast Layer',
    'Touch target Layer',
    'Text zoom Layer',
    'Responsive reflow Layer',
    'Focus grouping Layer',
    'Complex gestures Layer',
    'Color blindness Layer'
  ],
  a11yCheckboxLayers: [
    'Contrast Layer',
    'Touch target Layer',
    'Text zoom Layer',
    'Responsive reflow Layer',
    'Color blindness Layer'
  ]
};
