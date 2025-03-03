import React, { useEffect, useMemo } from 'react';
import { ViewIcon, ViewIconType, ViewLayout } from '@/application/types';
import { ReactComponent as BoardSvg } from '@/assets/board.svg';
import { ReactComponent as CalendarSvg } from '@/assets/calendar.svg';
import { ReactComponent as DocumentSvg } from '@/assets/document.svg';
import { ReactComponent as GridSvg } from '@/assets/grid.svg';
import { ReactComponent as ChatSvg } from '@/assets/chat_ai.svg';
import { getIcon, isFlagEmoji } from '@/utils/emoji';
import DOMPurify from 'dompurify';
import { renderColor } from '@/utils/color';

function PageIcon({
  view,
  className,
  iconSize,
}: {
  view: {
    icon?: ViewIcon | null;
    layout: ViewLayout;
  };
  className?: string;
  iconSize?: number;
}) {
  const [iconContent, setIconContent] = React.useState<string | undefined>(undefined);

  const emoji = useMemo(() => {
    if(view.icon && view.icon.ty === ViewIconType.Emoji && view.icon.value) {
      return view.icon.value;
    }

    return null;
  }, [view]);

  const img = useMemo(() => {
    if(view.icon && view.icon.ty === ViewIconType.URL && view.icon.value) {
      return <img
        className={className}
        src={view.icon.value}
        alt="icon"
      />;
    }

    return null;
  }, [className, view.icon]);

  const isFlag = useMemo(() => {
    return emoji ? isFlagEmoji(emoji) : false;
  }, [emoji]);

  useEffect(() => {
    if(view.icon && view.icon.ty === ViewIconType.Icon && view.icon.value) {
      try {
        const json = JSON.parse(view.icon.value);
        const id = `${json.groupName}/${json.iconName}`;

        void getIcon(id).then((item) => {
          setIconContent(item?.content.replaceAll('black', renderColor(json.color)).replace('<svg', '<svg width="100%" height="100%"'));
        });
      } catch(e) {
        console.error(e, view.icon);
      }
    } else {
      setIconContent(undefined);
    }
  }, [view.icon]);

  const icon = useMemo(() => {
    if(iconContent) {
      const cleanSvg = DOMPurify.sanitize(iconContent, {
        USE_PROFILES: { svg: true, svgFilters: true },
      });

      return <span
        style={{
          width: iconSize,
          height: iconSize,
        }}
        className={`${className ? className : 'w-full h-full'} `}
        dangerouslySetInnerHTML={{
          __html: cleanSvg,
        }}
      />;
    }
  }, [iconContent, iconSize, className]);

  if(emoji) {
    return <>
      <span className={`${isFlag ? 'icon' : ''} ${className || ''}`}>{emoji}</span>
    </>;
  }

  if(img) {
    return img;
  }

  if(icon) {
    return icon;
  }

  switch(view.layout) {
    case ViewLayout.AIChat:
      return <ChatSvg className={className} />;
    case ViewLayout.Grid:
      return <GridSvg className={className} />;
    case ViewLayout.Board:
      return <BoardSvg className={className} />;
    case ViewLayout.Calendar:
      return <CalendarSvg className={className} />;
    case ViewLayout.Document:
      return <DocumentSvg className={className} />;
    default:
      return null;
  }

}

export default PageIcon;