import * as React from 'react';
import PropTypes from 'prop-types';
import { utils } from '../../constants';

// icons
import { SvgChevronDown } from '../../icons';

// styles
import './styles.scss';

function BannerTipText(props) {
  const { expandedDefault = true, footer = null } = props;
  const { helpText = 'Learn more', helpUrl = null, text } = props;

  // local state
  const [expanded, setExpanded] = React.useState(expandedDefault);

  // ui state
  const ariaLabel = expanded ? 'collapse' : 'expand';
  const rotateClass = expanded ? 'rotate-right-rev' : 'rotate-left-rev';
  const tipTextClass = expanded ? '' : 'tip-text-collapsed';

  return (
    <div className="banner-tip">
      <div className="flex-row align-start">
        <div className="tip-label">tip</div>

        <p
          className={tipTextClass}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div
          aria-label={`${ariaLabel} tip`}
          className="tip-toggle"
          onClick={() => setExpanded(!expanded)}
          onKeyDown={({ key }) => {
            if (utils.isEnterKey(key)) setExpanded(!expanded);
          }}
          role="button"
          tabIndex="0"
        >
          <div className={`svg-theme animated ${rotateClass}`}>
            <SvgChevronDown size={12} />
          </div>
        </div>
      </div>

      {footer && expanded && footer}

      {helpUrl !== null && (
        <a className="tip-link" href={helpUrl} target="_blank" rel="noreferrer">
          {helpText}
        </a>
      )}
    </div>
  );
}

BannerTipText.propTypes = {
  // required
  text: PropTypes.string.isRequired,

  // optional
  expandedDefault: PropTypes.bool,
  footer: PropTypes.element,
  helpText: PropTypes.string,
  helpUrl: PropTypes.string
};

export default React.memo(BannerTipText);
