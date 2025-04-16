"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Document } from "@/types/database";// adjust as needed
import { notFound } from "next/navigation";
import { DocumentEditorWrapper } from "@/components/editor/document-editor-wrapper";
import { getDocumentWithCollaborators } from "@/app/document";
import { DocumentHeader } from "@/components/editor/document-header";
import { CollaboratorInfo } from "@/types/collaborator";

/*const DocumentEditor = dynamic(() => import("./DocumentEditor"), {
  ssr: false,
});*/

export default function DocumentEditorClientWrapper({
    document,
    canShare,
    lastEdited,
    editorInfo,
    viewerInfo,
    userAccess,
}: {
    document: Document;
    canShare: boolean;
    lastEdited: string;
    editorInfo : CollaboratorInfo[];
    viewerInfo: CollaboratorInfo[];
    userAccess: "none" | "view" | "edit" | "owner";
}) {
    type SaveStatus = "saved" | "saving" | "unsaved" | "error";
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  return (
      <div className="flex flex-1 flex-col h-full">
        <DocumentHeader
          document={document}
          canShare={canShare}
          lastEdited={lastEdited}
          editorInfo={editorInfo}
          viewerInfo={viewerInfo}
          userAccess={userAccess}
          saveStatus={saveStatus}
        />
  
        {/* Document Editor - Clean and Full Screen */}
        <div className="flex-1 overflow-auto">
          <DocumentEditorWrapper
            doc={document}
            canEdit={canShare && document.share_status !== "published"}
            onSaveStatusChange={setSaveStatus}
          />
        </div>
      </div>
    );
}
