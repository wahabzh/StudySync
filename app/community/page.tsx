"use client";
import { CommunityDocumentFilters } from "@/components/community/community-document-filters";
import { CommunityDocumentCard } from "@/components/community/community-document-card";
import { type Document } from "@/types/database";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertOctagon, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getCommunityDocuments } from "@/app/community-actions";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunityPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            try {
                const docs = await getCommunityDocuments("", "updated_desc");
                setDocuments(docs);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    return (
        <div className="container py-8">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Community Documents</h1>
                        <p className="text-muted-foreground mt-1">
                            Explore documents shared by other students and educators
                        </p>
                    </div>
                    <CommunityDocumentFilters setDocuments={setDocuments} />
                </div>

                {isLoading ? (
                    <DocumentsLoadingSkeleton />
                ) : documents.length === 0 ? (
                    <EmptyState />
                ) : (
                    <CommunityDocumentGrid documents={documents} />
                )}
            </div>
        </div>
    );
}

const EmptyState = () => {
    return (
        <Alert className="mx-auto max-w-3xl">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>No documents found</AlertTitle>
            <AlertDescription>
                There are no documents in the community which match your criteria. Try adjusting your search or check back later.
            </AlertDescription>
        </Alert>
    );
};

const CommunityDocumentGrid = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
                <CommunityDocumentCard
                    key={document.id}
                    id={document.id}
                    title={document.title}
                    lastEdited={formatDistanceToNow(new Date(document.updated_at), {
                        addSuffix: true,
                    })}
                    claps={document.clap_count || 0}
                />
            ))}
        </div>
    );
}

const DocumentsLoadingSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-[180px] animate-pulse opacity-70">
                    <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded-md mb-4 w-3/4"></div>
                        <div className="h-4 bg-muted rounded-md mb-2 w-1/4"></div>
                        <div className="h-4 bg-muted rounded-md mb-8 w-1/2"></div>
                        <div className="h-4 bg-muted rounded-md mt-auto w-2/3"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}