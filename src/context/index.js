import React from 'react';

export default React.createContext({
  // global ui
  alertMsg: null,
  condensedUI: false,
  isLoading: true,
  leftNavVisible: true,

  // page changes
  hasDashboard: false,
  showDashboard: false,
  showPageChange: false,
  showSettings: false,

  // global accessibility data
  pages: [],
  page: null,
  pageSelected: null,
  pageType: null,
  steps: [],
  stepsNative: [],
  stepsCompleted: [],
  stepsData: {},
  tipExpanded: true,

  // landmarks
  landmarks: {},

  // headings
  headings: {},
  headingTemp: null,

  // alt text
  noImages: false,
  imagesData: [],
  imagesScanned: [],

  // contrast
  contrastResults: null,

  // focus grouping
  groups: [],

  // complex gestures
  gestures: {},

  // touch targets
  touchTargets: {},

  // color blindness
  colorBlindnessView: false,

  // user data
  currentUser: null,
  newFeaturesIntro: [],
  sessionId: 0
});
