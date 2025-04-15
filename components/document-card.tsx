"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BookOpenCheck, Share2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DocumentActions } from "@/components/document-actions";

interface DocumentCardProps {
  id: string;
  title: string;
  preview?: string;
  lastEdited: string;
  isOwned: boolean;
  isShared: boolean;
  isPublished: boolean;
  userId: string;
  onDeleted?: () => void;
}

export function DocumentCard({
  id,
  title,
  preview,
  lastEdited,
  isOwned,
  isShared,
  isPublished,
  userId,
  onDeleted
}: DocumentCardProps) {
  return (
    <Card className="group flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {isOwned && (
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-red-500 hover:bg-blue-500/20"
              >
                <Lock className="mr-1 h-3 w-3" />
                Owned
              </Badge>
            )}
            {isShared && (
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                <Share2 className="mr-1 h-3 w-3" />
                Shared
              </Badge>
            )}
            {isPublished && (
              <Badge
                variant="secondary"
                className="bg-gray-500/10 text-blue-500 hover:bg-gray-500/20"
              >
                <BookOpenCheck className="mr-1 h-3 w-3" />
                Published
              </Badge>
            )}
          </div>
        </div>
        <DocumentActions documentId={id} documentTitle={title} onDeleted={onDeleted} />
      </CardHeader>
      <Link
        href={isOwned ? `/dashboard/doc/${id}` : isPublished ? `/community/doc/${id}` : `/dashboard/doc/${id}`}
        className="flex-1"
      >
        <CardContent>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {preview && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {preview}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-auto pt-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Last edited {lastEdited}
          </p>
          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Open document
            <ArrowRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
