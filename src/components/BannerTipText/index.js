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
  const { showArrow = true } = props;

  // local state
  const [animateClass, setAnimateClass] = React.useState('');

  // ui state
  const tabIndex = tipExpanded ? '0' : '-1';
  const isLink =
    helpUrl !== null
      ? ` <a class="tip-link" href="${helpUrl}" target="_blank" rel="noreferrer" tabIndex="${tabIndex}">${helpText}</a>`
      : '';
  const displayText = `${text}${isLink}`;
  const isOpened = showArrow === false || tipExpanded;
  const isOpenedClass = isOpened ? ' tip-opened' : '';
  const ariaLabel = isOpened ? 'collapse' : 'expand';
  const rotateClass = isOpened ? ' rotate-right-rev' : ' rotate-left-rev';
  const tipTextClass = isOpened ? '' : 'tip-text-collapsed';

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
    <div className={`banner-tip${isOpenedClass}`}>
      <div className="flex-row align-start">
        {showArrow && (
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
        )}

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
  helpUrl: PropTypes.string,
  showArrow: PropTypes.bool
};

export default React.memo(BannerTipText);
