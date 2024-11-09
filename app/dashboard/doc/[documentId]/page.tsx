import { notFound } from "next/navigation";
import DocumentEditor from "@/components/document-editor";

async function getDocument(documentId: string) {
  // TODO: get document by id
  return null;
}

export default async function DocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  const resolvedParams = await params;
  const document = await getDocument(resolvedParams.documentId);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Document Name</h1>
      </div>
      {document ? (
        <DocumentEditor document={document} />
      ) : (
        <DocumentEditor document={{ content: "<p>Hello World</p>" }} />
      )}
    </div>
  );
}
