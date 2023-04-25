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

  // global accessibility data
  pages: [],
  page: null,
  pageSelected: null,
  pageType: null,
  steps: [],
  stepsNative: [],
  stepsCompleted: [],
  stepsData: {},

  // landmarks
  landmarks: {},

  // headings
  headings: {},
  headingTemp: null,

  // semantics
  semantics: {},

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

  // user data
  currentUser: null,
  sessionId: 0
});
