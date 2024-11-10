"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Document } from "@/types/database";
import { useCallback, useEffect, useState } from "react";
import { updateDocument } from "@/app/actions";
import { useDebounce } from "use-debounce";
import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const SaveStatusIndicator = ({ status }: { status: SaveStatus }) => {
  const statusConfig = {
    saved: {
      icon: Check,
      text: "Saved",
      className: "text-green-500",
    },
    saving: {
      icon: Cloud,
      text: "Saving...",
      className: "text-yellow-500",
    },
    unsaved: {
      icon: Cloud,
      text: "Unsaved changes",
      className: "text-yellow-500",
    },
    error: {
      icon: CloudOff,
      text: "Failed to save",
      className: "text-red-500",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-all duration-200",
        config.className
      )}
    >
      <Icon className={cn("h-4 w-4", status === "saving" && "animate-pulse")} />
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  );
};

export default function DocumentEditor({ document }: { document: Document }) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [content, setContent] = useState(document.content);
  const [debouncedContent] = useDebounce(content, 2000); // 2 seconds

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Typography,
      Highlight,
      Placeholder.configure({ placeholder: "# Write something..." }),
    ],
    content: document.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[500px] max-w-none prose-headings:font-normal dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
      setSaveStatus("unsaved");
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (
      debouncedContent &&
      JSON.stringify(debouncedContent) !== JSON.stringify(document.content)
    ) {
      const saveContent = async () => {
        setSaveStatus("saving");
        try {
          await updateDocument(document.id, debouncedContent);
          setSaveStatus("saved");
        } catch (error) {
          console.error("Failed to save:", error);
          setSaveStatus("error");
        }
      };

      saveContent();
    }
  }, [debouncedContent, document.id, document.content]);

  return (
    <div className="relative">
      <div className="sticky top-4 z-50 flex justify-end">
        <div className="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur">
          <SaveStatusIndicator status={saveStatus} />
        </div>
      </div>
      {editor && (
        <BubbleMenu
          className="flex bg-white text-black rounded-lg shadow-lg p-1 space-x-1"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive("bold") ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded ${editor.isActive("strike") ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            Strike
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor.isActive("bulletlist") ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray hover:bg-gray-200"}`}
          >
            Bullet list
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
