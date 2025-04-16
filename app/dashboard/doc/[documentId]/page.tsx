import { notFound } from "next/navigation";
import { DocumentEditorWrapper } from "@/components/editor/document-editor-wrapper";
import { getDocumentWithCollaborators } from "@/app/document";
import { DocumentHeader } from "@/components/editor/document-header";
import DocumentEditorClientWrapper from "@/components/editor/document-page-wrapper"

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
  const canShare = userAccess === "owner" || userAccess === "edit";
  const lastEdited = formatDate(document.updated_at);

  return (
    <div className="flex flex-1 flex-col h-full">
      <DocumentEditorClientWrapper
        document={document}
        canShare={canShare}
        lastEdited={lastEdited}
        editorInfo={editorInfo}
        viewerInfo={viewerInfo}
        userAccess={userAccess}
      />
    </div>
  );
}