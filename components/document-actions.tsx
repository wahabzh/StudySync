"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { deleteDocument } from "@/app/actions";
import { useRouter } from "next/navigation";

interface DocumentActionsProps {
  documentId: string;
  documentTitle: string;
  userAccess?: "none" | "view" | "edit" | "owner";
  onSelect?: () => void;
  isSelected?: boolean;
}

export function DocumentActions({
  documentId,
  documentTitle,
  userAccess = "owner",
  onSelect,
  isSelected = false,
}: DocumentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(documentId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onSelect && (
            <>
              <DropdownMenuItem onClick={onSelect}>
                <Check
                  className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                />
                Select
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {userAccess === "owner" && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive data-[highlighted]:text-destructive-foreground data-[highlighted]:bg-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{documentTitle}&quot; and
              remove all of its contents from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
