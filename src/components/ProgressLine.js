import * as React from 'react';
import PropTypes from 'prop-types';

// icons
import { SvgEmojiCelebrate, SvgEmojiMonocle, SvgEmojiStarEyes } from '@/icons';

const progressDisplay = {
  'work-to-do': {
    animation: 'pulse',
    icon: <SvgEmojiMonocle />,
    msg: 'There is some <strong>a11y</strong> work to do'
  },
  'green-100s': {
    animation: 'tada',
    icon: <SvgEmojiCelebrate />,
    msg: 'All <strong>a11y</strong> checks are good!'
  },
  'dev-mode': {
    animation: 'tada',
    icon: <SvgEmojiStarEyes />,
    msg: 'There are A11y checks in this file!'
  }
};

function ProgressLine({ progressType }) {
  const { animation, icon, msg } = progressDisplay[progressType];

  return (
    <React.Fragment>
      <div className="space-sm" />

      <div className="flex-row-center">
        <div className="mr1" dangerouslySetInnerHTML={{ __html: msg }} />

        <div className="animated fade-in delay-400ms">
          <div className={`animated ${animation} delay-1s`}>{icon}</div>
        </div>
      </div>
    </React.Fragment>
  );
}

ProgressLine.propTypes = {
  // required
  progressType: PropTypes.oneOf(['work-to-do', 'green-100s', 'dev-mode'])
    .isRequired
};

export default React.memo(ProgressLine);
