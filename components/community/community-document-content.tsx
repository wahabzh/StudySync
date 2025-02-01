"use client";
import { Document } from "@/types/database";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { format } from "date-fns";
import { Calendar, FileText, Clock } from "lucide-react";

interface CommunityDocumentContentProps {
    document: Document;
}

export const CommunityDocumentContent = ({ document }: CommunityDocumentContentProps) => {
    const editor = useCreateBlockNote({
        initialContent: document.content,
    });

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            <header className="mb-12 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">Community Document</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                    {document.title}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={document.updated_at}>
                            {format(document.updated_at, "MMMM d, yyyy")}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <time dateTime={document.updated_at}>
                            {format(document.updated_at, "h:mm a")}
                        </time>
                    </div>
                </div>
            </header>

            <div className="prose prose-lg dark:prose-invert  prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-muted">
                <BlockNoteView
                    editor={editor}
                    editable={false}
                    className="min-h-[500px]"
                />
            </div>
        </article>
    );
};
