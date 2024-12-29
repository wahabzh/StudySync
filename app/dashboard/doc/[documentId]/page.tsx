import { notFound, redirect } from "next/navigation";
import * as React from "react";
import DocumentEditor from "@/components/document-editor";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/database";
import DocumentSharingMenu from "@/components/sharing/document-sharing-menu";
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
  const canEdit = userAccess === "owner" || userAccess === "edit";

  const handlePublish = async () => {
    try {
      await updateDocumentStatus(documentId, "published");
      toast({
        title: "Document published!",
        description: "Your document has been published in the community.",
      });
      redirect(`/doc/${documentId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish document",
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateDocumentStatus(documentId, "invite-only");
      toast({
        title: "Document unpublished!",
        description: "Your document is no longer published in the community.",
      });
      redirect(`/doc/${documentId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unpublish document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">{document.title}</h1>
        <div className="flex items-center gap-2">
          {canEdit ? (
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
          {userAccess === "owner" ? (
            document.share_status === "published" ? (
              <Button
                variant="outline"
                className="bg-red-600 text-white hover:bg-red-700"
                // onClick={handleUnpublish}
              >
                <FileX2 className="mr-2 h-4 w-4" />
                Unpublish
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-cyan-600 text-white hover:bg-cyan-700"
                // onClick={handlePublish}
              >
                <FileCheck2 className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )
          ) : document.share_status === "published" ? (
            <Button variant="outline" className="text-cyan-600">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Published
            </Button>
          ) : null}
        </div>
      </div>
      <DocumentEditor document={document} canEdit={canEdit} />
    </div>
  );
}
