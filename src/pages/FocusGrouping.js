import * as React from 'react';
import { utils } from '@/constants';

// components
import {
  AnnotationStepPage,
  DevStepIncomplete,
  EmptyStepSelection,
  HeadingStep
} from '@/components';

// icons
import { SvgFocusGroup } from '@/icons';

// icons: focus grouping
// import SvgFocusGrouping from '@/icons/focus-grouping';

// app state
import Context from '@/context';

function FocusGrouping() {
  // main app state
  const cnxt = React.useContext(Context);
  const { isDevMode, groups, page, pageType, stepsCompleted } = cnxt;
  const { sendToFigma, updateState, zoomTo } = cnxt;

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
    if (isDevMode) return;

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
    const newGroupsArray = [...groups];
    newGroupsArray.pop();
    updateState('groups', newGroupsArray);
  };

  const onClick = () => {
    setNoGroups(false);
    onAddGroup();
  };

  const getPrimaryAction = () => {
    if (groupsAreSet || noGroups || isDevMode) {
      return {
        ...(isDevMode && { buttonText: 'Next' }),
        completesStep: true,
        onClick: onCompleteGroups
      };
    }
    return null;
  };

  const getSecondaryAction = () => {
    if (isDevMode) {
      return {
        buttonText: 'Prev',
        onClick: () => null,
        isPrev: true
      };
    }

    return null;
  };

  return (
    <AnnotationStepPage
      title="Focus grouping"
      completed={isCompleted}
      routeName={routeName}
      bannerTipProps={{ pageType, routeName }}
      footerProps={{
        primaryAction: getPrimaryAction(),
        secondaryAction: getSecondaryAction()
      }}
    >
      <React.Fragment>
        {isDevMode === false && (
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
        )}

        {isDevMode === true && isCompleted === false && (
          <DevStepIncomplete label="focus grouping" />
        )}

        {isDevMode === true && isCompleted && (
          <React.Fragment>
            <HeadingStep text="Implement" />

            {groupsAreSet && (
              <React.Fragment>
                <p>Group elements as indicated by the annotations.</p>

                <div className="space-md" />

                {groupsArray.map((key, idx) => {
                  const groupId = groups[key];

                  return (
                    <div
                      key={`focus-group-${key}`}
                      aria-label="goto focus group"
                      className="cursor-pointer border-radius-2 row-focus-group-dev flex-row-center"
                      onClick={() => zoomTo([groupId], true)}
                      onKeyDown={(e) => {
                        if (utils.isEnterKey(e.key)) zoomTo([groupId], true);
                      }}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="landmark-block" />
                      <div className="space-xsw" />
                      <div className="focus-group-name">{`Group ${idx + 1}`}</div>
                    </div>
                  );
                })}
              </React.Fragment>
            )}

            {groupsAreSet === false && (
              <p>
                The design was marked as not needing Focus grouping. Check with
                the designer if you think that any should be added.
              </p>
            )}

            <div className="space-md" />
            <div className="divider" />
            <div className="space-md" />

            <HeadingStep text="Test" />
            <p>
              Verify expected behavior with a screenreader. Each group should be
              one swipe. Ensure actions work as expected.
            </p>
          </React.Fragment>
        )}
      </React.Fragment>
    </AnnotationStepPage>
  );
}

export default FocusGrouping;
