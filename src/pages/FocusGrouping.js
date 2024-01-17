import * as React from 'react';
import { utils } from '../constants';

// components
import {
  AnnotationStepPage,
  EmptyStepSelection,
  HeadingStep
} from '../components';

// icons
import { SvgFocusGroup } from '../icons';

// icons: focus grouping
import SvgFocusGrouping from '../icons/focus-grouping';

// app state
import Context from '../context';

const customFooter = (
  <React.Fragment>
    <div className="spacer2" />

    <div className="flex-row justify-center">
      <SvgFocusGrouping.SvgHelp1 />
      <div className="spacer1w" />
      <SvgFocusGrouping.SvgHelp2 />
    </div>

    <div className="flex-row justify-center">
      <div className="reading-order-text font-10">
        ex. typical group for a toggle switch
      </div>
      <div className="spacer1w" />
      <div className="reading-order-text font-10">
        ex. typical group for image link with title
      </div>
    </div>
  </React.Fragment>
);

function FocusGrouping() {
  // main app state
  const cnxt = React.useContext(Context);
  const { groups, page, pageType, stepsCompleted } = cnxt;
  const { sendToFigma, updateState } = cnxt;

  // ui state
  const groupsArray = Object.keys(groups);
  const groupsAreSet = groupsArray.length !== 0;

  // state defaults
  const routeName = 'Focus grouping';
  const isCompleted = stepsCompleted.includes(routeName);
  const defaultNoGroups = isCompleted && groupsArray.length === 0;

  // local state
  const [noGroups, setNoGroups] = React.useState(defaultNoGroups);

  const onEmptySelected = () => {
    // toggle checked state
    setNoGroups(!noGroups);
  };

  const onCompleteGroups = () => {
    if (noGroups) {
      // let figma side know that no groups are needed
      sendToFigma('no-groups', {
        page,
        bounds: page.bounds,
        name: page.name,
        pageId: page.id,
        pageType
      });
    }
  };

  const onAddGroup = () => {
    const { bounds, id, name } = page;

    // let figma side know, time to place that group
    sendToFigma('add-focus-group', {
      page,
      bounds,
      name,
      pageId: id,
      pageType
    });

    const newGroupsArray = [...groups];
    newGroupsArray.push(groupsArray.length + 1);
    updateState('groups', newGroupsArray);
  };

  const onRemoveGroup = (index) => {
    sendToFigma('remove-focus-group', {
      page,
      pageType,
      groupIndex: index
    });

    // update main state
    const newGroupsArray = new Array(...groups);
    newGroupsArray.pop();
    updateState('groups', newGroupsArray);
  };

  const onClick = () => {
    setNoGroups(false);
    onAddGroup();
  };

  const getPrimaryAction = () => {
    if (groupsAreSet || noGroups) {
      return {
        completesStep: true,
        onClick: onCompleteGroups
      };
    }
    return null;
  };

  return (
    <AnnotationStepPage
      title="Focus grouping"
      routeName={routeName}
      bannerTipProps={{ pageType, routeName, footer: customFooter }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: null
      }}
    >
      <React.Fragment>
        {groupsAreSet && (
          <React.Fragment>
            {groupsArray.map((id, idx) => (
              <div
                key={`focus-group-${id}`}
                className="flex-row-space-between flex-row-center"
              >
                <div>{`group ${idx + 1}`}</div>
                <div
                  aria-label="remove group"
                  className="btn-remove"
                  onClick={() => onRemoveGroup(idx)}
                  onKeyDown={({ key }) => {
                    if (utils.isEnterKey(key)) onRemoveGroup(idx);
                  }}
                  role="button"
                  tabIndex="0"
                >
                  <div className="remove-dash" />
                </div>
              </div>
            ))}

            <div className="spacer1" />
            <div className="divider" />
            <div className="spacer2" />
          </React.Fragment>
        )}

        <HeadingStep number={1} text="Place an overlay for a focus group" />

        {!groupsAreSet && (
          <EmptyStepSelection
            id="no-groups"
            isSelected={noGroups}
            onClick={onEmptySelected}
            text="no groups"
          />
        )}

        {!noGroups && (
          <div className="button-group">
            <div className="container-selection-button">
              <div
                aria-label="add focus group"
                className="selection-button"
                onClick={onClick}
                onKeyDown={({ key }) => {
                  if (utils.isEnterKey(key)) onClick();
                }}
                role="button"
                tabIndex={0}
              >
                <div>
                  <SvgFocusGroup />
                </div>
              </div>

              <div className="selection-button-label">focus group</div>
            </div>
          </div>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default FocusGrouping;
