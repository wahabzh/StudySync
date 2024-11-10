"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Document } from "@/types/database";
import { useCallback, useEffect, useState } from "react";
import { updateDocument } from "@/app/actions";
import { useDebounce } from "use-debounce";
import { Loader2 } from "lucide-react";

const editorClassName =
  "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-screen prose-headings:p-0 prose-headings:font-normal dark:prose-invert";

export default function DocumentEditor({ document }: { document: Document }) {
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(document.content);
  const [debouncedContent] = useDebounce(content, 1000); // 1 second debounce
  // initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Typography,
      Highlight,
      Placeholder.configure({ placeholder: " # Write something..." }),
    ],
    content: document.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
    // update the content state when the editor content changes
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
  });

  // automatically save the document when the debounced content changes
  // Auto-save effect
  useEffect(() => {
    if (
      debouncedContent &&
      JSON.stringify(debouncedContent) !== JSON.stringify(document.content)
    ) {
      const saveContent = async () => {
        setIsSaving(true);
        try {
          await updateDocument(document.id, debouncedContent);
        } catch (error) {
          console.error("Failed to save:", error);
          // You might want to show an error toast here
        } finally {
          setIsSaving(false);
        }
      };

      saveContent();
    }
  }, [debouncedContent, document.id, document.content]);

  return <EditorContent editor={editor} />;
}
