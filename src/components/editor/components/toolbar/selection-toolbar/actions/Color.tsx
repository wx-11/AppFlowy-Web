import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { EditorMarkFormat } from '@/application/slate-yjs/types';
import { Popover } from '@/components/_shared/popover';
import { useSelectionToolbarContext } from '@/components/editor/components/toolbar/selection-toolbar/SelectionToolbar.hooks';
import { ColorEnum, renderColor } from '@/utils/color';
import { Tooltip } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';
import ActionButton from './ActionButton';
import { useTranslation } from 'react-i18next';
import { useSlateStatic } from 'slate-react';
import { ReactComponent as ColorSvg } from '@/assets/icons/text_color.svg';
import { ReactComponent as TextSvg } from '@/assets/icons/format_text.svg';

function Color() {
  const { t } = useTranslation();
  const { visible: toolbarVisible } = useSelectionToolbarContext();
  const editor = useSlateStatic() as YjsEditor;
  const isActivated =
    CustomEditor.isMarkActive(editor, EditorMarkFormat.BgColor) ||
    CustomEditor.isMarkActive(editor, EditorMarkFormat.FontColor);
  const marks = CustomEditor.getAllMarks(editor);
  const activeBgColor = marks.find((mark) => mark[EditorMarkFormat.BgColor])?.[EditorMarkFormat.BgColor];
  const activeFontColor = marks.find((mark) => mark[EditorMarkFormat.FontColor])?.[EditorMarkFormat.FontColor];

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!toolbarVisible) {
      setAnchorEl(null);
    }
  }, [toolbarVisible]);

  const onClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handlePickedColor = useCallback(
    (format: EditorMarkFormat, color: string) => {
      if (color) {
        CustomEditor.addMark(editor, {
          key: format,
          value: color,
        });
      } else {
        CustomEditor.removeMark(editor, format);
      }
    },
    [editor]
  );

  const editorTextColors = useMemo(() => {
    return [
      {
        label: t('editor.fontColorDefault'),
        color: '',
      },
      {
        label: t('editor.fontColorGray'),
        color: 'rgb(120, 119, 116)',
      },
      {
        label: t('editor.fontColorBrown'),
        color: 'rgb(159, 107, 83)',
      },
      {
        label: t('editor.fontColorOrange'),
        color: 'rgb(217, 115, 13)',
      },
      {
        label: t('editor.fontColorYellow'),
        color: 'rgb(203, 145, 47)',
      },
      {
        label: t('editor.fontColorGreen'),
        color: 'rgb(68, 131, 97)',
      },
      {
        label: t('editor.fontColorBlue'),
        color: 'rgb(51, 126, 169)',
      },
      {
        label: t('editor.fontColorPurple'),
        color: 'rgb(144, 101, 176)',
      },
      {
        label: t('editor.fontColorPink'),
        color: 'rgb(193, 76, 138)',
      },
      {
        label: t('editor.fontColorRed'),
        color: 'rgb(212, 76, 71)',
      },
    ];
  }, [t]);

  const editorBgColors = useMemo(() => {
    return [
      {
        label: t('editor.backgroundColorDefault'),
        color: '',
      },
      {
        label: t('editor.backgroundColorLime'),
        color: ColorEnum.Lime,
      },
      {
        label: t('editor.backgroundColorAqua'),
        color: ColorEnum.Aqua,
      },
      {
        label: t('editor.backgroundColorOrange'),
        color: ColorEnum.Orange,
      },
      {
        label: t('editor.backgroundColorYellow'),
        color: ColorEnum.Yellow,
      },
      {
        label: t('editor.backgroundColorGreen'),
        color: ColorEnum.Green,
      },
      {
        label: t('editor.backgroundColorBlue'),
        color: ColorEnum.Blue,
      },
      {
        label: t('editor.backgroundColorPurple'),
        color: ColorEnum.Purple,
      },
      {
        label: t('editor.backgroundColorPink'),
        color: ColorEnum.Pink,
      },
      {
        label: t('editor.backgroundColorRed'),
        color: ColorEnum.LightPink,
      },
    ];
  }, [t]);

  const popoverContent = useMemo(() => {
    return (
      <div className={'flex w-[200px] flex-col gap-3 p-3'}>
        <div className={'flex flex-col gap-2'}>
          <div className={'text-xs text-text-caption'}>{t('editor.textColor')}</div>
          <div className={'flex flex-wrap gap-1.5'}>
            {editorTextColors.map((color, index) => {
              return (
                <Tooltip disableInteractive={true} key={index} title={color.label} placement={'top'}>
                  <div
                    className={'relative flex h-6 w-6 items-center justify-center'}
                    onClick={() => handlePickedColor(EditorMarkFormat.FontColor, color.color)}
                    style={{
                      color: color.color || 'var(--text-title)',
                    }}
                  >
                    <div
                      className={`absolute top-0 left-0 h-full w-full cursor-pointer rounded-[6px] border-2 opacity-50 hover:opacity-100`}
                      style={{
                        borderColor: activeFontColor === color.color ? 'var(--fill-default)' : undefined,
                        color: renderColor(color.color) || 'var(--text-title)',
                        opacity: color.color ? undefined : 1,
                      }}
                    />
                    <TextSvg />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
        <div className={'flex flex-col gap-2'}>
          <div className={'text-xs text-text-caption'}>{t('editor.backgroundColor')}</div>
          <div className={'flex flex-wrap gap-1.5'}>
            {editorBgColors.map((color, index) => {
              return (
                <Tooltip disableInteractive={true} key={index} title={color.label} placement={'top'}>
                  <div
                    key={index}
                    className={
                      'relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-[6px]'
                    }
                    onClick={() => handlePickedColor(EditorMarkFormat.BgColor, color.color)}
                  >
                    <div
                      className={`absolute top-0 left-0 h-full w-full rounded-[6px] border-2`}
                      style={{
                        borderColor: activeBgColor === color.color ? 'var(--fill-default)' : undefined,
                      }}
                    />
                    <div
                      className={'z-[1] h-full w-full opacity-50 hover:opacity-100'}
                      style={{
                        backgroundColor: renderColor(color.color),
                      }}
                    />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [activeBgColor, activeFontColor, editorBgColors, editorTextColors, handlePickedColor, t]);

  return (
    <>
      <ActionButton onClick={onClick} active={isActivated} tooltip={t('editor.color')}>
        <ColorSvg />
      </ActionButton>
      {toolbarVisible && (
        <Popover
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
          }}
          disableRestoreFocus={true}
          disableAutoFocus={true}
          disableEnforceFocus={true}
          open={open}
          onClose={handleClose}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: -8,
            horizontal: 'center',
          }}
        >
          {popoverContent}
        </Popover>
      )}
    </>
  );
}

export default Color;
