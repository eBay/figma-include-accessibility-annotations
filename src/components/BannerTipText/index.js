import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@/constants';

// icons
import { SvgChevronDown } from '@/icons';

// app state
import Context from '@/context';

// styles
import './styles.scss';

function BannerTipText(props) {
  // main app state
  const { sendToFigma, tipExpanded, updateState } = React.useContext(Context);

  // props
  const { footer = null } = props;
  const { helpText = 'Learn more', helpUrl = null, text } = props;

  // local state
  const [animateClass, setAnimateClass] = React.useState('');

  // ui state
  const tabIndex = tipExpanded ? '0' : '-1';
  const isLink =
    helpUrl !== null
      ? ` <a className="tip-link" href="${helpUrl}" target="_blank" rel="noreferrer" tabIndex="${tabIndex}">${helpText}</a>`
      : '';
  const displayText = `${text}${isLink}`;
  const ariaLabel = tipExpanded ? 'collapse' : 'expand';
  const rotateClass = tipExpanded ? ' rotate-right-rev' : ' rotate-left-rev';
  const tipTextClass = tipExpanded ? '' : 'tip-text-collapsed';

  const onToggle = () => {
    updateState('tipExpanded', !tipExpanded);

    sendToFigma('set-tip-preference', {
      expanded: !tipExpanded
    });
  };

  // animate on mount
  React.useEffect(() => {
    const animateTimer = setTimeout(() => {
      setAnimateClass(' animated');
    }, 800);

    return () => {
      clearTimeout(animateTimer);
    };
  }, []);

  return (
    <div className="banner-tip">
      <div className="flex-row align-start">
        <div
          aria-label={`${ariaLabel} tip`}
          className="tip-toggle"
          onClick={onToggle}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) onToggle();
          }}
          role="button"
          tabIndex="0"
        >
          <div className={`svg-theme${animateClass}${rotateClass}`}>
            <SvgChevronDown size={12} />
          </div>
        </div>

        <div className="tip-label">tip</div>

        <p
          className={tipTextClass}
          dangerouslySetInnerHTML={{ __html: displayText }}
        />
      </div>

      {footer && tipExpanded && footer}
    </div>
  );
}

BannerTipText.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  footer: PropTypes.element,
  helpText: PropTypes.string,
  helpUrl: PropTypes.string
};

export default React.memo(BannerTipText);
