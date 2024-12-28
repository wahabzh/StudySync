"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShareTab } from "./share-tab";
import { ManageTab } from "./manage-tab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatus } from "@/types/database";
import {
  updateDocumentStatus,
  updateCollaborator,
  removeCollaborator,
  inviteUser,
} from "@/app/document";
import { CollaboratorInfo } from "@/types/collaborator";

interface DocumentSharingMenuProps {
  documentId: string;
  status: DocumentStatus;
  editorInfo: CollaboratorInfo[];
  viewerInfo: CollaboratorInfo[];
  userAccess: "none" | "view" | "edit" | "owner";
}

export default function DocumentSharingMenu({
  documentId,
  status,
  editorInfo,
  viewerInfo,
  userAccess,
}: DocumentSharingMenuProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateDocumentStatus(documentId, newStatus);
      toast({
        title: "Status updated",
        description: `Document is now ${
          newStatus === "anyone-with-link"
            ? "accessible via link"
            : "invite-only"
        }`,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update status"
      );
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (email: string, role: "viewer" | "editor") => {
    try {
      setIsLoading(true);
      setError(null);
      await inviteUser(documentId, email, role);
      toast({
        title: "User invited",
        description: `Successfully invited ${email} as ${role}`,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to invite user"
      );
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (
    userId: string,
    newRole: "viewer" | "editor"
  ) => {
    try {
      setError(null);
      await updateCollaborator(documentId, userId, newRole);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update permission"
      );
      throw error; // Re-throw to be handled by the ManageTab component
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      setError(null);
      await removeCollaborator(documentId, userId);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to remove collaborator"
      );
      throw error; // Re-throw to be handled by the ManageTab component
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Invite others to collaborate or make your document public.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          <TabsContent value="share">
            <ShareTab
              documentId={documentId}
              status={status}
              onStatusChange={handleStatusChange}
              onInviteUser={handleInviteUser}
              isOwner={userAccess === "owner"}
            />
          </TabsContent>
          <TabsContent value="manage">
            <ManageTab
              documentId={documentId}
              editors={editorInfo}
              viewers={viewerInfo}
              onUpdatePermission={handleUpdatePermission}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          </TabsContent>
        </Tabs>
        {error && (
          <div className="mt-4 p-2 bg-destructive/15 text-destructive rounded-md">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
