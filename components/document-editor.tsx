"use client";

import ReactDOM from "react-dom/client";
import { Editor, EditorContent, BubbleMenu } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Document } from "@/types/database";
import { useCallback, useEffect, useState } from "react";
import { updateDocument } from "@/app/actions";
import { useDebounce } from "use-debounce";
import { Check, Cloud, CloudOff, Loader2, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateToken, getRandomColor } from "@/utils/utils";

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

interface DocumentEditorProps {
  doc: Document;
  canEdit: boolean;
}

const ydoc = new Y.Doc();

export default function DocumentEditor({ doc, canEdit }: DocumentEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [content, setContent] = useState(doc.content);
  const [debouncedContent] = useDebounce(content, 1000); // 1 second
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: doc.id,
      appId: "ok0161xm",
      token: generateToken(doc.id),
      document: ydoc,
    });
    
    setEditor( new Editor({
        editable: canEdit,
        extensions: [
          StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            history: false,
          }),
          Typography,
          Highlight,
          Placeholder.configure({ placeholder: "# Write something..." }),
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCursor.configure({
            provider,
            user: {
              name: sessionStorage.getItem("username"),
              color: getRandomColor(),
            },
            render: (user) => {
              const cursor = document.createElement("span");
              cursor.className = `absolute z-10 border-l-2 h-[1.2em] ml-[-2px]`;
              cursor.style.borderColor = user.color;

              const label = document.createElement("div");
              label.className = `absolute top-[-1.5em] left-[-2px] bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]`;
              label.style.backgroundColor = user.color;

              label.appendChild(document.createTextNode(user.name));
              cursor.appendChild(label);

              return cursor;
            },
          }),
        ],
        content: doc.content,
        // immediatelyRender: false,
        editorProps: {
          attributes: {
            class:
              "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[500px] max-w-none prose-headings:font-normal dark:prose-invert",
          },
        },
        onUpdate: ({ editor }) => {
          setContent(editor.getJSON());
          if (editor.isEditable) {
            setSaveStatus("unsaved");
            console.log("edited");
          }
        },
      })
    );
    // cleanup
    return () => {
      provider.disconnect();
    };
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (
      debouncedContent &&
      JSON.stringify(debouncedContent) !== JSON.stringify(doc.content)
    ) {
      const saveContent = async () => {
        setSaveStatus("saving");
        try {
          await updateDocument(doc.id, debouncedContent);
          setSaveStatus("saved");
        } catch (error) {
          console.error("Failed to save:", error);
          setSaveStatus("error");
        }
      };

      saveContent();
    }
  }, [debouncedContent]);

  return (
    <div className="relative">
      <div className="sticky top-4 z-50 flex justify-end">
        {canEdit && (
          <div className="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        )}
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
