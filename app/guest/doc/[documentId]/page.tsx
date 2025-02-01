import { notFound, redirect } from "next/navigation";
import * as React from "react";
import { DocumentEditor } from "@/components/editor/dynamic-editor";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/database";
import DocumentSharingMenu from "@/components/sharing/document-sharing-menu";
import PublishMenu from "@/components/publish-menu";
import { CollaboratorInfo } from "@/types/collaborator";
import { createClient } from "@/utils/supabase/server";
import { AccessLevel, getUserAccessLevel } from "@/utils/permissions";
import {
  Check,
  Cloud,
  CloudOff,
  Loader2,
  EyeIcon,
  BookUp,
  BookOpenCheck,
  EyeOff,
  FileCheck2,
  FileX2,
} from "lucide-react";
import {
  getDocumentWithCollaborators,
  updateDocumentStatus,
} from "@/app/document";
import { toast } from "@/hooks/use-toast";

const ViewOnlyBadge = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 bg-background/95 px-3 py-1.5 rounded-full shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur">
      <EyeIcon className="h-4 w-4" />
      <span className="hidden sm:inline">View only</span>
    </div>
  );
};

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const documentId = (await params).documentId;
  const data = await getDocumentWithCollaborators(documentId);

  if (!data) {
    return notFound();
  }

  const { document, viewerInfo, editorInfo, userAccess } = data;
  const canShare = userAccess === "owner" || userAccess === "edit";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">{document.title}</h1>
        <div className="flex items-center gap-2">
          {canShare ? (
            <DocumentSharingMenu
              documentId={document.id}
              status={document.share_status}
              editorInfo={editorInfo}
              viewerInfo={viewerInfo}
              userAccess={userAccess}
            />
          ) : (
            <ViewOnlyBadge />
          )}
          <PublishMenu documentId={document.id} userAccess={userAccess} status={document.share_status} />
        </div>
      </div>
      <DocumentEditor doc={document} canEdit={canShare && document.share_status !== "published"} />
    </div>
  );
}
