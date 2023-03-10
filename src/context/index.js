import React from 'react';

export default React.createContext({
  alertMsg: null,
  condensedUI: false,
  isLoading: true,
  leftNavVisible: true,
  hasDashboard: false,
  showDashboard: false,
  showPageChange: false,
  pages: [],
  page: null,
  pageSelected: null,
  pageType: null,
  steps: [],
  stepsCompleted: [],
  stepsData: {},

  // landmarks
  landmarks: {},

  // headings
  headings: {},

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
