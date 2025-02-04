import * as React from 'react';
import PropTypes from 'prop-types';
import { contrast, utils } from '@/constants';

// icons
import { SvgWarning } from '@/icons';

// app state
import Context from '@/context';

// styles
import './styles.scss';

function ContrastScreenshot({ benchmark = 'aa', report }) {
  // main app state
  const { condensedUI, zoomTo } = React.useContext(Context);

  const { width, hotspots, pageBgColor } = report;

  const onClick = (nodeId) => zoomTo([nodeId], true);

  // condensed: 434
  // full width: 441
  const cWidth = condensedUI ? 434 : 441;

  const scaleResize = parseFloat(cWidth / width, 10);

  return (
    <div
      className="contrast-preview"
      style={{
        backgroundColor: pageBgColor
          ? contrast.rgbToCssColor(pageBgColor)
          : 'transparent'
      }}
    >
      {report && (
        <div className="contrast-preview-content">
          <img src={report.imageUri} alt="contrast result" />

          {hotspots.map(({ x, y, w, h, nodeId, aa, aaa }) => {
            const { note, contrastRatio, status } =
              benchmark === 'aa' ? aa : aaa;
            const statusClass = `status-${status}`;
            const statusUpper = utils.capitalize(status);

            return (
              <div
                key={nodeId}
                className={`text-node-hotspot ${statusClass}`}
                onClick={() => onClick(nodeId)}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) onClick(nodeId);
                }}
                role="link"
                tabIndex="0"
                style={{
                  left: Math.floor(x * scaleResize),
                  top: Math.floor(y * scaleResize),
                  width: Math.ceil(w * scaleResize),
                  height: Math.ceil(h * scaleResize)
                }}
              >
                <span>
                  {status === 'fail' && <SvgWarning fill="#fff" size={12} />}
                  <strong>{`${statusUpper}: `}</strong>
                  {note || contrast.formatContrastRatio(contrastRatio)}
                </span>
                <div className="text-node-hotspot-bg" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

ContrastScreenshot.propTypes = {
  // required
  report: PropTypes.object.isRequired,

  // optional
  benchmark: PropTypes.string
};

export default React.memo(ContrastScreenshot);
