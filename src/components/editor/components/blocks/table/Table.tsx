import TableContainer from '@/components/editor/components/table-container/TableContainer';
import { EditorElementProps, TableCellNode, TableNode } from '@/components/editor/editor.type';
import { useEditorContext } from '@/components/editor/EditorContext';
import React, { forwardRef, memo, useMemo } from 'react';
import { Grid } from '@atlaskit/primitives';
import './table.scss';
import isEqual from 'lodash-es/isEqual';

const Table = memo(
  forwardRef<HTMLDivElement, EditorElementProps<TableNode>>(({ node, children, className, ...attributes }, ref) => {
    const context = useEditorContext();
    const readSummary = context.readSummary;
    const { rowsLen, colsLen, rowDefaultHeight, colsHeight } = node.data;
    const cells = node.children as TableCellNode[];

    const columnGroup = useMemo(() => {
      return Array.from({ length: colsLen }, (_, index) => {
        return cells.filter((cell) => cell?.data.colPosition === index);
      });
    }, [cells, colsLen]);

    const rowGroup = useMemo(() => {
      return Array.from({ length: rowsLen }, (_, index) => {
        return cells.filter((cell) => cell?.data.rowPosition === index);
      });
    }, [cells, rowsLen]);

    const templateColumns = useMemo(() => {
      return columnGroup
        .map((group) => {
          return `${group[0]?.data.width || colsHeight}px`;
        })
        .join(' ');
    }, [colsHeight, columnGroup]);

    const templateRows = useMemo(() => {
      return rowGroup
        .map((group) => {
          return `${group[0]?.data.height || rowDefaultHeight}px`;
        })
        .join(' ');
    }, [rowGroup, rowDefaultHeight]);

    return (
      <div
        ref={ref} {...attributes}
        contentEditable={false}
        className={`table-block relative select-none my-2 w-full px-1 ${className || ''}`}
      >
        <TableContainer
          blockId={node.blockId}
          readSummary={readSummary}
        >
          <Grid
            id={`table-${node.blockId}`}
            rowGap="space.0"
            autoFlow="column"
            columnGap="space.0"
            templateRows={templateRows}
            templateColumns={templateColumns}
          >
            {children}
          </Grid>
        </TableContainer>
      </div>

    );
  }),
  (prevProps, nextProps) => isEqual(prevProps.node, nextProps.node),
);

export default Table;
