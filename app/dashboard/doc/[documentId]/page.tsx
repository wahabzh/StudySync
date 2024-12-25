import { notFound } from "next/navigation";
import DocumentEditor from "@/components/document-editor";
import { Document } from "@/types/database";
import { createClient } from "@/utils/supabase/server";
import DocumentSharingMenu from "@/components/document-sharing-menu";

async function getDocument(documentId: string) {
  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error) {
    console.error("Error fetching document", error);
    return null;
  }

  return document as Document;
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const documentId = (await params).documentId;
  const document = await getDocument(documentId);
  if (!document) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">{document.title}</h1>
        <DocumentSharingMenu />
      </div>
      <DocumentEditor document={document} />
    </div>
  );
}
