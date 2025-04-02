import { YjsDatabaseKey } from '@/application/types';
import { FieldType } from '@/application/database-yjs/database.type';
import { Column, useFieldSelector } from '@/application/database-yjs/selector';
import { FieldTypeIcon } from '@/components/database/components/field';
import { ThemeModeContext } from '@/components/main/useAppThemeMode';
import { getIconBase64 } from '@/utils/emoji';
import { Tooltip } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ReactComponent as AIIndicatorSvg } from '@/assets/icons/ai_indicator.svg';

export function GridColumn({ column, index }: { column: Column; index: number }) {
  const { field } = useFieldSelector(column.fieldId);
  const [iconEncodeContent, setIconEncodeContent] = useState<string | null>(null);

  const isDark = useContext(ThemeModeContext)?.isDark;
  const name = field?.get(YjsDatabaseKey.name);
  const type = useMemo(() => {
    const type = field?.get(YjsDatabaseKey.type);

    if (!type) return FieldType.RichText;

    return parseInt(type) as FieldType;
  }, [field]);
  const icon = field?.get(YjsDatabaseKey.icon);

  useEffect(() => {
    if (icon) {
      void getIconBase64(icon, isDark ? 'white' : 'black').then((res) => {
        if (res) setIconEncodeContent(res);
      });
    }
  }, [icon, isDark]);

  const isAIField = [FieldType.AISummaries, FieldType.AITranslations].includes(type);

  return (
    <Tooltip title={name} enterNextDelay={1000} placement={'right'}>
      <div
        style={{
          borderLeftWidth: index === 1 ? 0 : 1,
        }}
        className={
          'flex h-full w-full select-none items-center gap-1 overflow-hidden whitespace-nowrap border-t border-b border-l border-line-divider px-2 text-sm font-medium hover:bg-fill-list-active'
        }
      >
        <div>
          {iconEncodeContent ? (
            <img src={iconEncodeContent} className={'h-full w-full p-1 opacity-40'} alt={icon} />
          ) : (
            <FieldTypeIcon type={type} className={'icon mr-1 h-4 w-4'} />
          )}
        </div>
        <div className={'flex-1'}>{name}</div>
        {isAIField && <AIIndicatorSvg className={'h-5 w-5 text-xl'} />}
      </div>
    </Tooltip>
  );
}

export default GridColumn;
