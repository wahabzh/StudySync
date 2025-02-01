import { notFound } from "next/navigation";
import * as React from "react";
import { getCommunityDocument } from "@/app/community/community-actions";
import { CommunityDocumentContent } from "@/components/community/community-document-content";

export default async function CommunityDocumentPage({
    params,
}: {
    params: Promise<{ documentId: string }>;
}) {
    const documentId = (await params).documentId;
    const document = await getCommunityDocument(documentId);


    if (!document) {
        return notFound();
    }


    return <CommunityDocumentContent document={document} />;
}
