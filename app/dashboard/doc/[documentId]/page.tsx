import { notFound } from "next/navigation";
import * as React from "react";
import { DocumentEditor } from "@/components/editor/dynamic-editor";
import { Button } from "@/components/ui/button";
import DocumentSharingMenu from "@/components/sharing/document-sharing-menu";
import PublishMenu from "@/components/publish-menu";
import { getDocumentWithCollaborators } from "@/app/document";
import GenerateFlashcardsButton from "@/components/flashcards/GenerateFlashcardsButton";
import GenerateQuizzesButton from "@/components/quizzes/GenerateQuiz";
import DownloadButton from "@/components/editor/DownloadButton";
import { ArrowLeft, Clock, EyeIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { renameDocument } from "@/app/actions";
import EditDocumentTitle from "@/components/edit-document-title";

const ViewOnlyBadge = () => {
  return (
    <Badge variant="outline" className="gap-1">
      <EyeIcon className="h-3 w-3" />
      <span>View only</span>
    </Badge>
  );
};

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
      {/* Minimal Header */}
      <div className="flex items-center justify-between py-2 px-4 border-b bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3 group">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <EditDocumentTitle 
            documentId={document.id} 
            initialTitle={document.title} 
            canEdit={canShare && document.share_status !== "published"}
          />
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Edited {lastEdited}</span>
          </div>
          {!canShare && <ViewOnlyBadge />}
        </div>

        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-2">
            {canShare && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DownloadButton documentId={document.id} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Download document</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <GenerateFlashcardsButton documentId={document.id} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Generate flashcards</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <GenerateQuizzesButton documentId={document.id} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Generate quiz</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {canShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DocumentSharingMenu
                      documentId={document.id}
                      status={document.share_status}
                      editorInfo={editorInfo}
                      viewerInfo={viewerInfo}
                      userAccess={userAccess}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Share document</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <PublishMenu
                    documentId={document.id}
                    userAccess={userAccess}
                    status={document.share_status}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{document.share_status === "published" ? "Unpublish" : "Publish"} document</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Document Editor - Clean and Full Screen */}
      <div className="flex-1 overflow-auto">
        <DocumentEditor
          doc={document}
          canEdit={canShare && document.share_status !== "published"}
        />
      </div>
    </div>
  );
}

