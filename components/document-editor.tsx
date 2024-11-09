"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";

import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";

import { useEffect } from "react";
import { TiptapCollabProvider } from "@hocuspocus/provider";

const doc = new Y.Doc();

const editorClassName =
  "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-screen prose-headings:m-0 prose-headings:p-0 prose-headings:font-normal dark:prose-invert";

export default function DocumentEditor({ document }: { document: any }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        history: false,
      }),
      Typography,
      Highlight,
      Placeholder.configure({ placeholder: "Write something..." }),
      Collaboration.configure({ document: doc }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
  });

  // connect to collaboration server
  useEffect(() => {
    console.log("connecting to collaboration server");
    const provider = new TiptapCollabProvider({
      name: "document.name", // Unique document identifier for syncing. This is your document name.
      appId: process.env.NEXT_PUBLIC_TIP_TAP_APP_ID!, // Your Cloud Dashboard AppID or `baseURL` for on-premises
      token: process.env.NEXT_PUBLIC_TIP_TAP_JWT_SECRET, // Your JWT token
      document: doc,

      // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content loading on editor syncs.
      onSynced() {
        if (!doc.getMap("config").get("initialContentLoaded") && editor) {
          doc.getMap("config").set("initialContentLoaded", true);

          editor.commands.setContent(document.content);
        }
      },
    });
  }, []);

  return <EditorContent editor={editor} />;
}
