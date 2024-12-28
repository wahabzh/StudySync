"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Share2, Lock } from "lucide-react";
import Link from "next/link";

interface DocumentCardProps {
  id: string;
  title: string;
  preview?: string;
  lastEdited: string;
  isSharedWithMe?: boolean;
  isSharedWithOthers?: boolean;
}

export function DocumentCard({
  id,
  title,
  preview,
  lastEdited,
  isSharedWithMe = false,
  isSharedWithOthers = false,
}: DocumentCardProps) {
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {isSharedWithMe && (
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              >
                <Share2 className="mr-1 h-3 w-3" />
                Shared With Me
              </Badge>
            )}
            {isSharedWithOthers ? (
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                <Share2 className="mr-1 h-3 w-3" />
                Shared With Others
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
              >
                <Lock className="mr-1 h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/dashboard/doc/${id}`} className="flex w-full">
                Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {preview && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {preview}
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">
          Last edited {lastEdited}
        </p>
      </CardFooter>
    </Card>
  );
}
