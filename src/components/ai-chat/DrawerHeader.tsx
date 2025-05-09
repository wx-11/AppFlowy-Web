import { useAIChatContext } from '@/components/ai-chat/AIChatProvider';
import { useAppHandlers } from '@/components/app/app.hooks';
import MoreActions from '@/components/app/header/MoreActions';
import { IconButton, Tooltip } from '@mui/material';
import { ReactComponent as DoubleArrowRight } from '@/assets/icons/double_arrow_right.svg';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ExpandIcon } from '@/assets/icons/expand.svg';
import ShareButton from 'src/components/app/share/ShareButton';

function DrawerHeader() {
  const { t } = useTranslation();
  const {
    setDrawerOpen,
    onCloseView,
    openViewId,
  } = useAIChatContext();

  const {
    toView,
  } = useAppHandlers();

  if(!openViewId) {
    return null;
  }

  return (
    <div className={'sticky z-[100] px-4 bg-bg-body flex items-center justify-between top-0 w-full min-h-[48px] border-b border-line-divider'}>
      <div className={'flex items-center gap-4'}>
        <Tooltip title={t('sideBar.closeSidebar')}>
          <IconButton
            size={'small'}
            onClick={async() => {
              setDrawerOpen(false);
            }}
          >
            <DoubleArrowRight className={'text-text-title opacity-80'} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('tooltip.openAsPage')}>
          <IconButton
            size={'small'}
            onClick={async() => {
              if(!openViewId) return;
              await toView(openViewId);
              onCloseView();
            }}
          >
            <ExpandIcon className={'text-text-title opacity-80'} />
          </IconButton>
        </Tooltip>
      </div>
      <div className={'flex items-center gap-4'}>
        <ShareButton viewId={openViewId} />
        <MoreActions
          onDeleted={onCloseView}
          viewId={openViewId}
        />
      </div>
    </div>
  );
}

export default DrawerHeader;