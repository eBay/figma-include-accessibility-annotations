import * as React from 'react';

function PageChange() {
  return (
    <div className="page-change">
      <h2>Whoa whoa whoa, we noticed you just changed pages.</h2>

      <div className="spacer2" />

      <p className="max-width-400">
        Please make sure you are finished on the previous page, or restart the
        plugin on this new page. #takemeback
      </p>
    </div>
  );
}

export default PageChange;
