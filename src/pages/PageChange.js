import * as React from 'react';

// app state
import Context from '@/context';

function PageChange() {
  const { isDevMode } = React.useContext(Context);
  const desc = isDevMode
    ? 'To see the accessibility annotations on this page, you need to restart the plugin.'
    : 'Please make sure you are finished on the previous page, or restart the plugin on this new page. #takemeback';

  return (
    <div className="page-change">
      <h2>Noticed a page change.</h2>

      <div className="space-sm" />

      <p className="max-width-400">{desc}</p>
    </div>
  );
}

export default PageChange;
