import { CONTAINER_BLOCK_TYPES, SOFT_BREAK_TYPES } from '@/application/slate-yjs/command/const';
import { BlockData, BlockType, ColumnNodeData, YjsEditorKey } from '@/application/types';
import { BulletedList } from '@/components/editor/components/blocks/bulleted-list';
import { Callout } from '@/components/editor/components/blocks/callout';
import { CodeBlock } from '@/components/editor/components/blocks/code';
import { Column, Columns } from '@/components/editor/components/blocks/columns';
import { DatabaseBlock } from '@/components/editor/components/blocks/database';
import { DividerNode } from '@/components/editor/components/blocks/divider';
import { FileBlock } from '@/components/editor/components/blocks/file';
import { GalleryBlock } from '@/components/editor/components/blocks/gallery';
import { Heading } from '@/components/editor/components/blocks/heading';
import { ImageBlock } from '@/components/editor/components/blocks/image';
import { LinkPreview } from '@/components/editor/components/blocks/link-preview';
import { MathEquation } from '@/components/editor/components/blocks/math-equation';
import { NumberedList } from '@/components/editor/components/blocks/numbered-list';
import { Outline } from '@/components/editor/components/blocks/outline';
import { Page } from '@/components/editor/components/blocks/page';
import { Paragraph } from '@/components/editor/components/blocks/paragraph';
import { Quote } from '@/components/editor/components/blocks/quote';
import SimpleTable from '@/components/editor/components/blocks/simple-table/SimpleTable';
import SimpleTableCell from '@/components/editor/components/blocks/simple-table/SimpleTableCell';
import SimpleTableRow from '@/components/editor/components/blocks/simple-table/SimpleTableRow';
import { TableBlock, TableCellBlock } from '@/components/editor/components/blocks/table';
import { Text } from '@/components/editor/components/blocks/text';
import { VideoBlock } from '@/components/editor/components/blocks/video';
import { UnSupportedBlock } from '@/components/editor/components/element/UnSupportedBlock';
import { EditorElementProps, TextNode } from '@/components/editor/editor.type';
import { useEditorContext } from '@/components/editor/EditorContext';
import { ElementFallbackRender } from '@/components/error/ElementFallbackRender';
import { renderColor } from '@/utils/color';
import React, { FC, useEffect, useMemo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ReactEditor, RenderElementProps, useSelected, useSlateStatic } from 'slate-react';
import smoothScrollIntoViewIfNeeded from 'smooth-scroll-into-view-if-needed';
import SubPage from 'src/components/editor/components/blocks/sub-page/SubPage';
import { TodoList } from 'src/components/editor/components/blocks/todo-list';
import { ToggleList } from 'src/components/editor/components/blocks/toggle-list';

export const Element = ({
  element: node,
  attributes,
  children,
}: RenderElementProps & {
  element: EditorElementProps['node'];
}) => {
  const {
    jumpBlockId,
    onJumpedBlockId,
    selectedBlockIds,
  } = useEditorContext();

  const { blockId, type } = node;
  const isSelected = useSelected();
  const selected = useMemo(() => {
    if(blockId && selectedBlockIds?.includes(blockId)) return true;
    if([
      ...CONTAINER_BLOCK_TYPES,
      ...SOFT_BREAK_TYPES,
      BlockType.HeadingBlock,
      BlockType.TableBlock,
      BlockType.TableCell,
      BlockType.SimpleTableBlock,
    ].includes(type as BlockType)) return false;
    return isSelected;
  }, [blockId, selectedBlockIds, type, isSelected]);

  const editor = useSlateStatic();
  const highlightTimeoutRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if(!jumpBlockId) return;

    if(node.blockId !== jumpBlockId) {
      return;
    }

    const element = ReactEditor.toDOMNode(editor, node);

    void (async() => {
      await smoothScrollIntoViewIfNeeded(element, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      });
      element.className += ' highlight-block';
      highlightTimeoutRef.current = setTimeout(() => {
        element.className = element.className.replace('highlight-block', '');
      }, 5000);

      onJumpedBlockId?.();
    })();

  }, [editor, jumpBlockId, node, onJumpedBlockId]);

  useEffect(() => {
    return () => {
      if(highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);
  const Component = useMemo(() => {
    switch(type) {
      case BlockType.HeadingBlock:
        return Heading;
      case BlockType.TodoListBlock:
        return TodoList;
      case BlockType.ToggleListBlock:
        return ToggleList;
      case BlockType.Paragraph:
        return Paragraph;
      case BlockType.DividerBlock:
        return DividerNode;
      case BlockType.Page:
        return Page;
      case BlockType.QuoteBlock:
        return Quote;
      case BlockType.BulletedListBlock:
        return BulletedList;
      case BlockType.NumberedListBlock:
        return NumberedList;
      case BlockType.CodeBlock:
        return CodeBlock;
      case BlockType.CalloutBlock:
        return Callout;
      case BlockType.EquationBlock:
        return MathEquation;
      case BlockType.ImageBlock:
        return ImageBlock;
      case BlockType.OutlineBlock:
        return Outline;
      case BlockType.TableBlock:
        return TableBlock;
      case BlockType.TableCell:
        return TableCellBlock;
      case BlockType.GridBlock:
      case BlockType.BoardBlock:
      case BlockType.CalendarBlock:
        return DatabaseBlock;
      case BlockType.LinkPreview:
        return LinkPreview;
      case BlockType.FileBlock:
        return FileBlock;
      case BlockType.GalleryBlock:
        return GalleryBlock;
      case BlockType.SubpageBlock:
        return SubPage;
      case BlockType.SimpleTableBlock:
        return SimpleTable;
      case BlockType.SimpleTableRowBlock:
        return SimpleTableRow;
      case BlockType.SimpleTableCellBlock:
        return SimpleTableCell;
      case BlockType.VideoBlock:
        return VideoBlock;
      case BlockType.ColumnsBlock:
        return Columns;
      case BlockType.ColumnBlock:
        return Column;
      default:
        return UnSupportedBlock;
    }
  }, [type]) as FC<EditorElementProps>;

  const blockStyle = useMemo(() => {
    const type = node.type as BlockType;
    const style = {};

    if(type === BlockType.ColumnBlock) {
      const ratio = (node.data as ColumnNodeData)?.ratio;

      Object.assign(style, {
        flexGrow: ratio ? ratio * 1000 : 500,
        flexBasis: 0,
        flexShrink: 0,
      });
    }

    return style;
  }, [node.data, node.type]);

  const className = useMemo(() => {
    const data = (node.data as BlockData) || {};
    const align = data.align;
    const classList = ['block-element relative flex rounded-[4px]'];

    if(selected) {
      classList.push('selected');
    }

    if(align) {
      classList.push(`block-align-${align}`);
    }

    return classList.join(' ');
  }, [node.data, selected]);

  const style = useMemo(() => {
    const data = (node.data as BlockData) || {};
    const properties = {
      backgroundColor: !selected && data.bgColor ? renderColor(data.bgColor) : undefined,
      color: data.font_color ? renderColor(data.font_color) : undefined,
    };

    const type = node.type as BlockType;

    if(type === BlockType.ColumnsBlock) {
      Object.assign(properties, {
        display: 'flex',
        width: '100%',
      });
    }

    return properties;
  }, [node.data, node.type, selected]);

  const fallbackRender = useMemo(() => {
    return (props: FallbackProps) => {
      return (
        <ElementFallbackRender {...props} description={JSON.stringify(node)} />
      );
    };
  }, [node]);

  if(type === YjsEditorKey.text) {
    return (
      <Text {...attributes} node={node as TextNode}>
        {children}
      </Text>
    );
  }

  if([BlockType.SimpleTableRowBlock, BlockType.SimpleTableCellBlock].includes(node.type as BlockType)) {
    return (
      <Component
        node={node}
        {...attributes}
      >
        {children}
      </Component>
    );
  }

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <div
        {...attributes}
        data-block-type={type}
        className={className}
        style={blockStyle}
      >
        <Component
          style={style}
          className={`flex w-full flex-col`}
          node={node}
        >
          {children}
        </Component>
      </div>
    </ErrorBoundary>
  );
};
