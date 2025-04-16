"use client";

import { useState } from "react";
import DocumentEditor from "./document-editor";
import { Document } from "@/types/database";
import { SaveStatusIndicator } from "./save-status-indicator";

export function DocumentEditorWrapper({
  doc,
  canEdit,
  onSaveStatusChange,
}: {
  doc: Document;
  canEdit: boolean;
  onSaveStatusChange?: (status: "saved" | "saving" | "unsaved" | "error") => void;
}) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");

  const handleStatusChange = (status: "saved" | "saving" | "unsaved" | "error") => {
    setSaveStatus(status);
    onSaveStatusChange?.(status);
  };

  return (
    <DocumentEditor
      doc={doc}
      canEdit={canEdit}
      onSaveStatusChange={handleStatusChange}
    />
  );
}