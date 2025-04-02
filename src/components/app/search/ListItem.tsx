import { View } from '@/application/types';
import { findAncestors } from '@/components/_shared/outline/utils';
import { RichTooltip } from '@/components/_shared/popover';
import PageIcon from '@/components/_shared/view-icon/PageIcon';
import { useAppHandlers, useAppOutline } from '@/components/app/app.hooks';
import { IconButton, Paper, Tooltip } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { ReactComponent as PrivateIcon } from '@/assets/icons/lock.svg';

function ListItem ({
  selectedView,
  view,
  onClick,
  onClose,
}: {
  selectedView: string;
  view: View;
  onClick: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const outline = useAppOutline();
  const [open, setOpen] = React.useState<boolean>(false);
  const toView = useAppHandlers().toView;

  const ancestors = useMemo(() => {
    if (!outline) return [];
    return findAncestors(outline, view.view_id)?.slice(0, -1) || [];
  }, [outline, view.view_id]);

  const renderBreadcrumb = useCallback((view: View) => {
    const isPrivate = view.is_private && view.extra?.is_space;

    return <Tooltip
      enterDelay={700}
      disableInteractive={true}
      title={view.name}
    >
      <div
        style={{
          cursor: view.extra?.is_space ? 'default' : 'pointer',
        }}
        onClick={e => {
          e.stopPropagation();
          if (view.extra?.is_space) return;
          void toView(view.view_id);
          onClose();
        }}
        className={`text-text-caption max-w-[250px] overflow-hidden ${view.extra?.is_space ? '' : 'hover:underline'} flex items-center gap-1`}
      >
        <span className={'truncate'}>{view.name || t('menuAppHeader.defaultNewPageName')}</span>
        {isPrivate &&
          <div className={'text-base min-w-5 min-h-5 text-text-title opacity-80'}>
            <PrivateIcon className='h-5 w-5'/>
          </div>
        }
      </div>
    </Tooltip>;
  }, [onClose, t, toView]);

  const breadcrumbs = useMemo(() => {
    if (!ancestors) return null;
    if (ancestors.length <= 3) {
      return ancestors.map((ancestor, index) => {
        return <div
          key={ancestor.view_id}
          className={'flex items-center gap-2'}
        >
          {renderBreadcrumb(ancestor)}
          {index !== ancestors.length - 1 && <span>{'/'}</span>}
        </div>;
      });
    }

    const first = renderBreadcrumb(ancestors[0]);
    const last = renderBreadcrumb(ancestors[ancestors.length - 1]);

    return <>
      {first}
      <div className={'flex items-center gap-2'}>
        <span>{'/'}</span>
        <RichTooltip
          open={open}
          placement="bottom"
          onClose={() => setOpen(false)}
          content={
            <Paper className={'p-1'}>
              {ancestors.slice(1, -1).map((ancestor) => {
                return <div
                  key={ancestor.view_id}
                  className={'flex items-center w-full gap-2 p-1.5'}
                >
                  {renderBreadcrumb(ancestor)}
                </div>;
              })}
            </Paper>
          }
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            size={'small'}
          >
            <MoreIcon />
          </IconButton>
        </RichTooltip>
        <span>{'/'}</span>
        {last}
      </div>
    </>;

  }, [ancestors, open, renderBreadcrumb]);

  return (
    <div
      data-item-id={view.view_id}
      style={{
        backgroundColor: selectedView === view.view_id ? 'var(--fill-list-active)' : undefined,
      }}
      onClick={onClick}
      className={'flex flex-col w-full px-4 py-2 cursor-pointer hover:bg-fill-list-active gap-1'}
    >
      <div className={'flex items-center gap-3'}>
        <div className={'w-7 h-7 border flex items-center justify-center rounded border-line-border'}>
          <PageIcon
            view={view}
            className={'w-5 h-5 flex items-center justify-center'}
          />

        </div>
        <div className={'text-base font-medium flex-1 truncate'}>
          {view.name.trim() || t('menuAppHeader.defaultNewPageName')}
        </div>
      </div>

      <div className={'ml-10'}>
        <div className={'text-sm text-text-caption overflow-hidden w-full gap-2 flex items-center'}>
          {breadcrumbs}
        </div>
      </div>

    </div>
  );
}

export default ListItem;