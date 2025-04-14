"use client";

import ReactDOM from "react-dom/client";
import "@blocknote/core/fonts/inter.css";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  NestBlockButton,
  SuggestionMenuController,
  TextAlignButton,
  UnnestBlockButton,
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { Document } from "@/types/database";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { updateDocument } from "@/app/actions";
import { useDebounce } from "use-debounce";
import { Check, Cloud, CloudOff, Loader2, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateToken, getRandomColor } from "@/utils/utils";
import { ContinueWritingButton } from "./continue-writting-button";
import { GetTextButton } from "./get-text-button";
import { uploadImage } from "@/app/document";
import { useToast } from "@/hooks/use-toast";

// Add custom styles to override BlockNote dark mode variables with shadcn theme
const customStyles = `
  .bn-shadcn.dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 142.1 70.6% 45.3%;
    --primary-foreground: 144.9 80.4% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142.4 71.8% 29.2%;
  }

  .bn-shadcn.dark .bn-editor {
    background-color: hsl(20 14.3% 4.1%);
    color: hsl(0 0% 95%);
  }

  .bn-shadcn.dark .bn-container {
    background-color: hsl(20 14.3% 4.1%);
    border-color: hsl(240 3.7% 15.9%);
  }

  .bn-shadcn.dark .bn-menu {
    background-color: hsl(0 0% 9%);
    color: hsl(0 0% 95%);
    border-color: hsl(240 3.7% 15.9%);
  }

  .bn-shadcn.dark .bn-menu-item:hover {
    background-color: hsl(12 6.5% 15.1%);
  }

  .bn-shadcn.dark .bn-menu-item.selected {
    background-color: hsl(142.1 70.6% 45.3%);
    color: hsl(144.9 80.4% 10%);
  }
`;

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

export default function DocumentEditor({ doc, canEdit }: DocumentEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [content, setContent] = useState(doc.content);
  const [debouncedContent] = useDebounce(content, 1000); // 1 second
  const ydoc = useMemo(() => new Y.Doc(), [doc.id]);
  const { toast } = useToast();
  const provider = useMemo(() => {
    return new TiptapCollabProvider({
      name: doc.id,
      appId: "ok0161xm",
      token: generateToken(doc.id),
      document: ydoc,
    });
  }, [doc.id]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const imageUrl = await uploadImage(formData);
      return imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  }

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: ydoc.getXmlFragment("document"),
      user: {
        name: sessionStorage.getItem("username") || "Anon",
        color: getRandomColor(),
      },
      showCursorLabels: "activity",
      // render: (user) => {
      //   const cursor = document.createElement("span");
      //   cursor.className = `absolute z-10 border-l-2 h-[1.2em] ml-[-2px]`;
      //   cursor.style.borderColor = user.color;

      //   const label = document.createElement("div");
      //   label.className = `absolute top-[-1.5em] left-[-2px] bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]`;
      //   label.style.backgroundColor = user.color;

      //   label.appendChild(document.createTextNode(user.name));
      //   cursor.appendChild(label);

      //   return cursor;
      // },
    },

    uploadFile: uploadFile,
  });

  useEffect(() => {
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
      <style>{customStyles}</style>
      <div className="sticky top-4 z-50 flex justify-end">
        {canEdit && (
          <div className="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        )}
      </div>
      <BlockNoteView
        editor={editor}
        editable={canEdit}
        slashMenu={true}
        formattingToolbar={false}
        onChange={() => {
          setContent(editor.document);
          if (canEdit) {
            setSaveStatus("unsaved");
          }
        }}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              {/* custom buttons */}
              <ContinueWritingButton key={"continueWritingButton"} />
              <GetTextButton key={"getTextButton"} />
              {/* default buttons */}
              <FileCaptionButton key={"fileCaptionButton"} />
              <FileReplaceButton key={"replaceFileButton"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              {/* Extra button to toggle code styles */}
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />

              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />

              <ColorStyleButton key={"colorStyleButton"} />

              <NestBlockButton key={"nestBlockButton"} />
              <UnnestBlockButton key={"unnestBlockButton"} />

              <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
    </div>
  );
}

