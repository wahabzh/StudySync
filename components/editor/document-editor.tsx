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
import { ReactImage, insertReactImage, uploadLocalImage} from "./react-image";
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

  const provider = useMemo(() => {
    return new TiptapCollabProvider({
      name: doc.id,
      appId: "ok0161xm",
      token: generateToken(doc.id),
      document: ydoc,
    });
  }, [doc.id]);

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
    schema: BlockNoteSchema.create({
      blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Add custom block
        reactImage: ReactImage,
      },
    }),
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
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query: string) =>
            // Gets all default slash menu items and `insertReact` item.
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                insertReactImage(editor),
                uploadLocalImage(editor),
              ],
              query
            )
          }
        />

        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              {/* custom buttons */}
              <ContinueWritingButton key={"continueWritingButton"} />

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
