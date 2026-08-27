const getPluginMessage = (event, { isDevMode = false } = {}) => {
  if (!event.data?.pluginMessage) {
    if (!process.env.ISPROD || isDevMode) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Include] Ignored window message without pluginMessage.',
        'This is usually devtools, iframe noise, or a misconfigured postMessage.',
        event.data
      );
    }
    return null;
  }

  return event.data.pluginMessage;
};

export default getPluginMessage;
