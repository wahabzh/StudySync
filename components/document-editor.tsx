"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";

const editorClassName =
  "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-screen prose-headings:p-0 prose-headings:font-normal dark:prose-invert";

export default function DocumentEditor({ document }: { document: any }) {
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
  });

  return <EditorContent editor={editor} />;
}
