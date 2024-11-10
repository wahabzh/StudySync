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
  const [debouncedContent] = useDebounce(content, 1000);

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
      <EditorContent editor={editor} />
    </div>
  );
}
