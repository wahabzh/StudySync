"use client";
import { CommunityDocumentFilters } from "@/components/community/community-document-filters";
import { CommunityDocumentCard } from "@/components/community/community-document-card";
import { type Document } from "@/types/database";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertOctagon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
    const [documents, setDocuments] = useState<Document[]>([]);


    return <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg md:text-2xl">Community Documents</h1>
        </div>
        <CommunityDocumentFilters setDocuments={setDocuments} />
        <div className="flex flex-col gap-4">
            {documents.length === 0 ? (
                <EmptyState />
            ) : (
                <CommunityDocumentGrid documents={documents} />
            )}
        </div>
    </div>;
}

const EmptyState = () => {
    return (
        <Alert>

            <AlertOctagon className="h-4 w-4" />

            <AlertTitle>No documents found</AlertTitle>
            <AlertDescription>
                There are no documents in the community which match your criteria.
            </AlertDescription>
        </Alert>
    );
};

const CommunityDocumentGrid = ({ documents }: { documents: Document[] }) => {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
            <CommunityDocumentCard key={document.id} id={document.id} title={document.title} lastEdited={formatDistanceToNow(new Date(document.updated_at), {
                addSuffix: true,
            })} claps={20} />
        ))}
    </div>
    );
}