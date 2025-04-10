import { withYHistory } from '@/application/slate-yjs/plugins/withHistory';
import { CollabOrigin } from '@/application/types';
import { withYjs, YjsEditor } from '@/application/slate-yjs/plugins/withYjs';
import EditorEditable from '@/components/editor/Editable';
import { useEditorContext } from '@/components/editor/EditorContext';
import { withPlugins } from '@/components/editor/plugins';
import { getTextCount } from '@/utils/word';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { clipboardFormatKey } from '@/components/editor/plugins/withCopy';

const defaultInitialValue: Descendant[] = [];

function CollaborativeEditor({ doc, onEditorConnected }: {
  doc: Y.Doc,
  onEditorConnected?: (editor: YjsEditor) => void
}) {
  const context = useEditorContext();
  const readSummary = context.readSummary;
  const onRendered = context.onRendered;
  const uploadFile = context.uploadFile;
  const readOnly = context.readOnly;
  const viewId = context.viewId;
  const onWordCountChange = context.onWordCountChange;
  const [, setClock] = useState(0);
  const onContentChange = useCallback((content: Descendant[]) => {
    const wordCount = getTextCount(content);

    onWordCountChange?.(viewId, wordCount);
    setClock((prev) => prev + 1);
    onRendered?.();
  }, [onWordCountChange, viewId, onRendered]);

  const editor = useMemo(
    () =>
      doc &&
      (withPlugins(
        withReact(
          withYHistory(
            withYjs(createEditor(), doc, {
              readOnly,
              localOrigin: CollabOrigin.Local,
              readSummary,
              onContentChange,
              uploadFile,
              id: viewId,
            }),
          ),
          clipboardFormatKey,
        ),
      ) as YjsEditor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewId, doc],
  );
  const [, setIsConnected] = useState(false);

  useEffect(() => {
    if(!editor) return;

    editor.connect();
    setIsConnected(true);
    onEditorConnected?.(editor);

    return () => {
      console.log('disconnect');
      editor.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <Slate
      editor={editor}
      initialValue={defaultInitialValue}
    >
      <EditorEditable />
    </Slate>

  );
}

export default memo(CollaborativeEditor);
