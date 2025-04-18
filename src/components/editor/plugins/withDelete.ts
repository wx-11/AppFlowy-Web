import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import {
  isAtBlockStart,
  isAtBlockEnd,
  isEntireDocumentSelected,
  getBlockEntry,
} from '@/application/slate-yjs/utils/editor';
import { TextUnit, Range, EditorFragmentDeletionOptions } from 'slate';
import { ReactEditor } from 'slate-react';
import { TextDeleteOptions } from 'slate/dist/interfaces/transforms/text';
import { isEmbedBlockTypes } from '@/application/slate-yjs/command/const';
import { BlockType } from '@/application/types';

export function withDelete(editor: ReactEditor) {
  const { deleteForward, deleteBackward, delete: deleteText } = editor;

  editor.delete = (options?: TextDeleteOptions) => {
    const { selection } = editor;

    if (!selection) return;

    const [node] = getBlockEntry(editor as YjsEditor);

    if (Range.isCollapsed(selection)) {
      if (isEmbedBlockTypes(node.type as BlockType) && node.blockId) {

        CustomEditor.deleteBlock(editor as YjsEditor, node.blockId);
        return;
      }

      deleteText(options);
      return;
    }

    const [start, end] = Range.edges(selection);
    const startBlock = getBlockEntry(editor as YjsEditor, start)[0];
    const endBlock = getBlockEntry(editor as YjsEditor, end)[0];

    if (startBlock.blockId === endBlock.blockId) {
      deleteText(options);
      return;
    }

    CustomEditor.deleteBlockBackward(editor as YjsEditor, selection);
  };

  editor.deleteFragment = (options?: EditorFragmentDeletionOptions) => {
    const deleteEntireDocument = isEntireDocumentSelected(editor as YjsEditor);

    if (deleteEntireDocument) {
      CustomEditor.deleteEntireDocument(editor as YjsEditor);
      return;
    }

    const { selection } = editor;

    if (!selection) return;

    if (options?.direction === 'backward') {
      CustomEditor.deleteBlockBackward(editor as YjsEditor, selection);
    } else {
      CustomEditor.deleteBlockForward(editor as YjsEditor, selection);
    }
  };

  // Handle `delete` key press
  editor.deleteForward = (unit: TextUnit) => {
    const { selection } = editor;

    if (!selection) {
      return;
    }

    let shouldUseDefaultBehavior = false;

    if (selection && Range.isCollapsed(selection)) {
      shouldUseDefaultBehavior = !isAtBlockEnd(editor, selection.anchor);
    }

    if (shouldUseDefaultBehavior) {
      deleteForward(unit);
      return;
    }

    const after = editor.after(editor.end(selection), { unit: 'block' });

    if (!after) {
      return;
    }

    const nextBlock = getBlockEntry(editor as YjsEditor, after)[0];

    if (isEmbedBlockTypes(nextBlock.type as BlockType) && nextBlock.blockId) {
      CustomEditor.deleteBlock(editor as YjsEditor, nextBlock.blockId);
      return;
    }

    CustomEditor.deleteBlockForward(editor as YjsEditor, selection);
  };

  // Handle `backspace` key press
  editor.deleteBackward = (unit: TextUnit) => {
    const { selection } = editor;

    if (!selection) {
      return;
    }

    let shouldUseDefaultBehavior = false;

    const isCollapsed = selection && Range.isCollapsed(selection);

    if (isCollapsed) {
      shouldUseDefaultBehavior = !isAtBlockStart(editor, selection.anchor);
    }

    if (shouldUseDefaultBehavior) {
      deleteBackward(unit);
      return;
    }

    CustomEditor.deleteBlockBackward(editor as YjsEditor, selection);
  };

  return editor;
}
