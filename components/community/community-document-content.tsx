"use client";
import { Document, CommunityDocument } from "@/types/database";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { format } from "date-fns";
import {
  Calendar,
  FileText,
  Clock,
  HeartIcon,
  ChevronRight,
  Share2,
  ArrowLeft,
  BookOpenText,
  HomeIcon,
  UserIcon,
} from "lucide-react";
import { useTransition, useState } from "react";
import { toggleDocumentClap } from "@/app/community-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useRouter } from "next/navigation";

interface CommunityDocumentContentProps {
  document: CommunityDocument;
}

export const CommunityDocumentContent = ({
  document,
}: CommunityDocumentContentProps) => {
  const [isPending, startTransition] = useTransition();
  const [clapCount, setClapCount] = useState(document.clap_count || 0);
  const [hasClapped, setHasClapped] = useState(document.has_clapped || false);
  const { toast } = useToast();
  const router = useRouter();
  console.log("hasClapped", hasClapped);
  const editor = useCreateBlockNote({
    initialContent: document.content,
  });

  const handleClap = () => {
    startTransition(async () => {
      const { error, success, clapCount } = await toggleDocumentClap(document.id);
      if (error) {
        toast({
          title: "Oops!",
          description: error,
        });
      } else if (success) {
        setHasClapped(!hasClapped);
        setClapCount(clapCount || 0);
      }
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Link has been copied to clipboard.",
        duration: 3000,
      });
    }).catch((err) => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Navigation bar */}
      <div className="border-b py-2 px-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Breadcrumb className="overflow-hidden">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center">
                  <HomeIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/community">
                  <span>Community</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <span className="truncate max-w-[150px] inline-block align-bottom overflow-hidden">{document.title}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ThemeSwitcher />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 text-muted-foreground"
            onClick={() => router.push('/community')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar info panel - only visible on larger screens */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="rounded-lg border bg-card text-card-foreground p-6 sticky top-20">
                <h3 className="text-base font-semibold mb-4">Document Info</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Published:</div>
                      <div className="text-muted-foreground">
                        {format(document.created_at, "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Last updated:</div>
                      <div className="text-muted-foreground">
                        {format(document.updated_at, "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Appreciation</span>
                    <span className="font-medium">{clapCount}</span>
                  </div>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Document
                  </Button>
                </div>
              </div>
            </div>

            {/* Main content */}
            <article className="lg:col-span-9">
              {/* Document header */}
              <header className="mb-8 space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpenText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Community Document</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{document.title}</h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <UserIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Anonymous Author</div>
                      <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={document.updated_at}>
                            {format(document.updated_at, "MMMM d, yyyy")}
                          </time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <time dateTime={document.updated_at}>
                            {format(document.updated_at, "h:mm a")}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Show share button inline on mobile */}
                    <div className="lg:hidden">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={handleShare}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy link</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleClap}
                            variant={hasClapped ? "default" : "outline"}
                            size="sm"
                            className="gap-2 h-9 px-4"
                            disabled={isPending}
                          >
                            <HeartIcon className={`h-4 w-4 ${hasClapped ? 'text-primary-foreground fill-current' : 'text-rose-500'}`} />
                            <span>{clapCount}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{hasClapped ? 'Remove appreciation' : 'Show appreciation'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </header>

              {/* Document content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-muted">
                <Card className="border border-border/50 shadow-sm overflow-hidden p-8 rounded-xl">
                  <BlockNoteView
                    editor={editor}
                    editable={false}
                    className="min-h-[500px]"
                  />
                </Card>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
