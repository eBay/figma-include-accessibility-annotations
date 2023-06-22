const baseURL = process.env.ANALYTICS_URL;

export const logEvent = async (data) => {
  const { isProd = false } = data;
  const { name = 'page_view', pageTitle = 'Stepper' } = data;
  const { currentUser = 'ANON', sessionId = 1 } = data;

  if (baseURL?.length > 0 && isProd) {
    try {
      // specify network access
      // https://www.figma.com/plugin-docs/making-network-requests/#specify-network-access
      const fullURL = `${baseURL}/${sessionId}/${currentUser}/${name}/${pageTitle}`;
      const response = await fetch(fullURL, { mode: 'no-cors' });

      if (!response.ok) {
        throw new Error(
          `This is an HTTP error: The status is ${response.status}`
        );
      }
    } catch (err) {
      // fail silently
    }
  } else {
    // Uncomment to debug analytics logging
    // console.log(
    //   'analytics event log call',
    //   `${baseURL}/${sessionId}/${currentUser}/${name}/${pageTitle}`
    // );
  }
};

export default { logEvent };
