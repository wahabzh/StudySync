"use client";
import { Document } from "@/types/database";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Clock,
  HandHeartIcon,
  ChevronRight,
} from "lucide-react";
import { useTransition } from "react";
import { toggleDocumentClap } from "@/app/community/community-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ReactImage } from "../editor/react-image";

interface CommunityDocumentContentProps {
  document: Document & { has_clapped: boolean };
}

export const CommunityDocumentContent = ({
  document,
}: CommunityDocumentContentProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  console.log("document", document.content); // Debugging
  const editor = useCreateBlockNote({
    initialContent: document.content,
    schema: BlockNoteSchema.create({
      blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Add custom block
        reactImage: ReactImage,
      },
    }),
  });

  const handleClap = () => {
    startTransition(async () => {
      const { error } = await toggleDocumentClap(document.id);
      if (error) {
        toast({
          title: "Oops!",
          description: error,
        });
      }
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/community">Community</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>{document.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-12 space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium">Community Document</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{document.title}</h1>

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

        <div className="flex items-center gap-4">
          <Button
            onClick={handleClap}
            variant={document.has_clapped ? "default" : "outline"}
            size="sm"
            className="gap-2"
            disabled={isPending}
          >
            <HandHeartIcon className="h-4 w-4" />
            <span>{document.clap_count || 0}</span>
          </Button>
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
