export const PLUGIN_HEIGHT = 518;
export const PLUGIN_WIDTH_FULL = 700;
export const PLUGIN_WIDTH_CONDENSED = 516;

export const LOADING_SLOW_HINT_MS = 15000;
export const LOADING_TIMEOUT_MS = 60000;

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_AAA_NORMAL = 7;
export const WCAG_AAA_LARGE = 4.5;

export const WEB_TOUCH_TARGET_SIZE = 24;
export const NATIVE_TOUCH_TARGET_SIZE = 48;

export const PRELOAD_FONTS = [
  { family: 'Inter', style: 'Regular' },
  { family: 'Roboto', style: 'Bold' },
  { family: 'Roboto', style: 'Regular' }
];

export const getPluginWidth = (condensed) =>
  condensed ? PLUGIN_WIDTH_CONDENSED : PLUGIN_WIDTH_FULL;

export const getPluginResizeMessage = (condensed) => ({
  condensed,
  height: PLUGIN_HEIGHT,
  width: getPluginWidth(condensed)
});

export const getTouchTargetSize = (pageType) =>
  pageType === 'web' ? WEB_TOUCH_TARGET_SIZE : NATIVE_TOUCH_TARGET_SIZE;
