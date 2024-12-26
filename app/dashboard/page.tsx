import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Document } from "@/types/database";
import { createDocument } from "@/app/actions";
import NewDocumentDialog from "@/components/new-document-dialog";
import { DocumentActions } from "@/components/document-actions";

const EmptyState = () => {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">No documents found.</p>
            <NewDocumentDialog onCreate={createDocument} />
        </div>
    );
};

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="grid gap-4">
            {documents.map((document) => (
                <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                >
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-medium">
                            {document.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Last edited{" "}
                            {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            }).format(new Date(document.updated_at))}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/dashboard/doc/${document.id}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Edit
                        </Link>
                        <DocumentActions
                            documentId={document.id}
                            documentTitle={document.title}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const getDocuments = async (userId: string) => {
    const supabase = await createClient();
    const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching documents");
        return [] as Document[];
    }

    return documents as Document[];
};

export default async function HomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const documents = await getDocuments(user.id);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">
                    My Documents
                </h1>
                <NewDocumentDialog onCreate={createDocument} />
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    {documents.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <DocumentList documents={documents} />
                    )}
                </div>
            </div>
        </div>
    );
}
