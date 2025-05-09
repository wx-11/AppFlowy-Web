import { CoverType, ViewIconType, ViewLayout, ViewMetaCover, ViewMetaIcon, ViewMetaProps } from '@/application/types';
import { notify } from '@/components/_shared/notify';
import TitleEditable from '@/components/view-meta/TitleEditable';
import ViewCover from '@/components/view-meta/ViewCover';
import React, { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageIcon from '@/components/_shared/view-icon/PageIcon';

const AddIconCover = lazy(() => import('@/components/view-meta/AddIconCover'));

export function ViewMetaPreview({
  icon: iconProp,
  cover: coverProp,
  name,
  extra,
  readOnly = true,
  viewId,
  updatePage,
  onEnter,
  maxWidth,
  uploadFile,
}: ViewMetaProps) {
  const [iconAnchorEl, setIconAnchorEl] = React.useState<null | HTMLElement>(null);
  const [cover, setCover] = React.useState<ViewMetaCover | null>(coverProp || null);
  const [icon, setIcon] = React.useState<ViewMetaIcon | null>(iconProp || null);

  useEffect(() => {
    setCover(coverProp || null);
  }, [coverProp]);

  useEffect(() => {
    setIcon(iconProp || null);
  }, [iconProp]);

  const coverType = useMemo(() => {
    if(cover && [CoverType.NormalColor, CoverType.GradientColor].includes(cover.type)) {
      return 'color';
    }

    if(CoverType.BuildInImage === cover?.type) {
      return 'built_in';
    }

    if(cover && [CoverType.CustomImage, CoverType.UpsplashImage].includes(cover.type)) {
      return 'custom';
    }
  }, [cover]);

  const coverValue = useMemo(() => {
    if(coverType === CoverType.BuildInImage) {
      return {
        1: '/covers/m_cover_image_1.png',
        2: '/covers/m_cover_image_2.png',
        3: '/covers/m_cover_image_3.png',
        4: '/covers/m_cover_image_4.png',
        5: '/covers/m_cover_image_5.png',
        6: '/covers/m_cover_image_6.png',
      }[cover?.value as string];
    }

    return cover?.value;
  }, [coverType, cover?.value]);
  const { t } = useTranslation();

  const [isHover, setIsHover] = React.useState(false);

  const handleUpdateIcon = React.useCallback(async(icon: { ty: ViewIconType, value: string }) => {
    if(!updatePage || !viewId) return;
    setIcon(icon);
    try {
      await updatePage(viewId, {
        icon,
        name: name || '',
        extra: extra || {},
      });
      // eslint-disable-next-line
    } catch(e: any) {
      notify.error(e.message);
    }
  }, [updatePage, viewId, name, extra]);

  const handleUpdateName = React.useCallback(async(newName: string) => {
    if(!updatePage || !viewId) return;
    try {
      if(name === newName) return;
      await updatePage(viewId, {
        icon: icon || {
          ty: ViewIconType.Emoji,
          value: '',
        },
        name: newName,
        extra: extra || {},
      });
      // eslint-disable-next-line
    } catch(e: any) {
      notify.error(e.message);
    }
  }, [name, updatePage, viewId, icon, extra]);

  const handleUpdateCover = React.useCallback(async(cover?: {
    type: CoverType;
    value: string;
  }) => {
    if(!updatePage || !viewId) return;
    setCover(cover ? cover : null);

    try {
      await updatePage(viewId, {
        icon: icon || {
          ty: ViewIconType.Emoji,
          value: '',
        },
        name: name || '',
        extra: {
          ...extra,
          cover: cover,
        },
      });
      // eslint-disable-next-line
    } catch(e: any) {
      notify.error(e.message);
    }
  }, [extra, icon, name, updatePage, viewId]);

  const onUploadFile = useCallback(async(file: File) => {
    if(!uploadFile) return Promise.reject();
    return uploadFile(file);
  }, [uploadFile]);

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const handleMouseEnter = () => {
      setIsHover(true);
    };

    const handleMouseLeave = () => {
      setIsHover(false);
    };

    if(el) {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if(el) {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className={'flex w-full flex-col items-center'}>
      {cover && <ViewCover
        onUpdateCover={handleUpdateCover}
        coverType={coverType}
        coverValue={coverValue}
        onRemoveCover={handleUpdateCover}
        readOnly={readOnly}
      />}
      <div
        ref={ref}
        className={'flex mt-2 flex-col relative w-full overflow-hidden'}
      >
        <div className={'relative flex justify-center max-sm:h-[38px] h-[52px] w-full'}>
          {!readOnly && <Suspense><AddIconCover
            visible={isHover}
            hasIcon={!!icon?.value}
            hasCover={!!cover?.value}
            onUpdateIcon={handleUpdateIcon}
            onAddCover={() => {
              void handleUpdateCover({
                type: CoverType.BuildInImage,
                value: '1',
              });
            }}
            maxWidth={maxWidth}
            iconAnchorEl={iconAnchorEl}
            setIconAnchorEl={setIconAnchorEl}
            onUploadFile={onUploadFile}
          /></Suspense>}


        </div>
        <div
          className={`relative mb-6 flex items-center overflow-visible w-full justify-center`}
        >
          <h1
            style={{
              width: maxWidth || '100%',
            }}
            className={
              'flex gap-4 max-sm:px-6 px-24 min-w-0 max-w-full overflow-hidden whitespace-pre-wrap break-words break-all text-[2.5rem] font-bold max-md:text-[26px]'
            }
          >

            {icon?.value ?
              <div
                onClick={e => {
                  if(readOnly) return;
                  setIconAnchorEl(e.currentTarget);
                }}
                className={`view-icon flex h-[1.25em] w-[1.25em] px-1.5 items-center justify-center ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-fill-list-hover '}`}
              >
                <PageIcon
                  view={{
                    icon,
                    layout: ViewLayout.Document,
                  }}
                  className={'h-[90%] w-[90%] flex items-center justify-center'}
                />
              </div>
              : null
            }
            {!readOnly && viewId ? <TitleEditable
                viewId={viewId}
                name={name || ''}
                onUpdateName={handleUpdateName}
                onEnter={onEnter}
              /> :
              <div
                style={{
                  wordBreak: 'break-word',
                }}
                className={'relative flex-1 break-words whitespace-pre-wrap cursor-text focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-placeholder'}
                data-placeholder={t('menuAppHeader.defaultNewPageName')}
                contentEditable={false}
              >
                {name}
              </div>
            }
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ViewMetaPreview;
