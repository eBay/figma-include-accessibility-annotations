import * as React from 'react';

// components
import { BannerTip } from '@/components';

function InteractiveElements() {
  return (
    <React.Fragment>
      <BannerTip pageType="web" routeName="Interactive elements" />

      <div className="spacer2" />

      <div className="coming-soon">Coming Soon</div>
    </React.Fragment>
  );
}

export default InteractiveElements;
