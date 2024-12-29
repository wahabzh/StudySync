"use client";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Document } from "@/types/database";
import { createDocument, getUserId } from "@/app/actions";
import NewDocumentDialog from "@/components/new-document-dialog";
import { DocumentCard } from "@/components/document-card";
import { DocumentFilters } from "@/components/document-filters";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const EmptyState = () => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">No documents found.</p>
      {/* <NewDocumentDialog onCreate={createDocument} /> */}
    </div>
  );
};

const DocumentGrid = ({
  documents,
  userId,
}: {
  documents: Document[];
  userId: string;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          id={document.id}
          title={document.title}
          lastEdited={formatDistanceToNow(new Date(document.updated_at), {
            addSuffix: true,
          })}
          isOwned={document.owner_id === userId}
          isShared={document.share_status === "invite-only"}
          isPublished={document.share_status === "published"}
        />
      ))}
    </div>
  );
};

export default function HomePage() {
  const [userId, setUserId] = useState<string>("");   // after refresh fix
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    getUserId().then((id) => setUserId(id));
  }, []);

  return (
    (userId && <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">My Documents</h1>
        <NewDocumentDialog onCreate={createDocument} />
      </div>
      <DocumentFilters setDocuments={setDocuments} userId={userId} />
      <div className="flex flex-col gap-4">
        {documents.length === 0 ? (
          <EmptyState />
        ) : (
          <DocumentGrid documents={documents} userId={userId} />
        )}
      </div>
    </div>)
  );
}
