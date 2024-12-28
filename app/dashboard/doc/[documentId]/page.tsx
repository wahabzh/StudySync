import { notFound, redirect } from "next/navigation";
import * as React from "react";
import DocumentEditor from "@/components/document-editor";
import { Document } from "@/types/database";
import DocumentSharingMenu from "@/components/sharing/document-sharing-menu";
import { CollaboratorInfo } from "@/types/collaborator";
import { createClient } from "@/utils/supabase/server";
import { getUserAccessLevel } from "@/utils/permissions";

import { Check, Cloud, CloudOff, Loader2, EyeIcon } from "lucide-react";
const ViewOnlyBadge = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 bg-background/95 px-3 py-1.5 rounded-full shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur">
      <EyeIcon className="h-4 w-4" />
      <span className="hidden sm:inline">View only</span>
    </div>
  );
};

interface DocumentWithCollaborators {
  document: Document;
  viewerInfo: CollaboratorInfo[];
  editorInfo: CollaboratorInfo[];
  userAccess: "none" | "view" | "edit" | "owner";
}

async function getDocumentWithCollaborators(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch document
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return null;
  }

  // Check user's access level
  const accessLevel = getUserAccessLevel(document, user.id);
  if (accessLevel === "none") {
    return null;
  }

  const { data, error } = await supabase.rpc(
    "get_all_email_and_ids_from_auth_users"
  );

  if (error) throw error;
  if (!data || !data[0]?.id)
    throw new Error("Error fetching user details from DB");

  //  for user ids in viewers, get corresponding email from data, and then add email and id to viewerInfo
  let viewerInfo: CollaboratorInfo[] = [];
  for (const viewerId of document.viewers) {
    const viewer = data.find((user: any) => user.id === viewerId);
    if (viewer) {
      viewerInfo.push({ id: viewer.id, email: viewer.email });
    }
  }

  //  for user ids in editors, get corresponding email from data, and then add email and id to editorInfo
  let editorInfo: CollaboratorInfo[] = [];
  for (const editorId of document.editors) {
    const editor = data.find((user: any) => user.id === editorId);
    if (editor) {
      editorInfo.push({ id: editor.id, email: editor.email });
    }
  }

  return {
    document,
    viewerInfo,
    editorInfo,
    userAccess: accessLevel,
  };
}

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">{document.title}</h1>
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
      </div>
      <DocumentEditor document={document} canEdit={canEdit} />
    </div>
  );
}
