"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CollaboratorInfo } from "@/types/collaborator";

interface ManageTabProps {
  documentId: string;
  editors: CollaboratorInfo[];
  viewers: CollaboratorInfo[];
  onUpdatePermission: (
    userId: string,
    newRole: "viewer" | "editor"
  ) => Promise<void>;
  onRemoveCollaborator: (userId: string) => Promise<void>;
}

export function ManageTab({
  documentId,
  viewers,
  editors,
  onUpdatePermission,
  onRemoveCollaborator,
}: ManageTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePermissionChange = async (
    userId: string,
    newRole: "viewer" | "editor"
  ) => {
    setIsLoading(userId);
    try {
      await onUpdatePermission(userId, newRole);
      toast({
        title: "Permission updated",
        description: `Updated user permission to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setIsLoading(userId);
    try {
      await onRemoveCollaborator(userId);
      toast({
        title: "Collaborator removed",
        description: "User has been removed from the document",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove collaborator",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Current Collaborators</Label>
      <div className="space-y-2">
        {editors.length === 0 && viewers.length === 0 ? (
          <p className="text-muted-foreground">No collaborators yet</p>
        ) : (
          <>
            {editors.map((editor) => (
              <CollaboratorRow
                key={editor.id}
                user={editor}
                currentRole="editor"
                isLoading={isLoading === editor.id}
                onPermissionChange={handlePermissionChange}
                onRemove={handleRemove}
              />
            ))}
            {viewers.map((viewer) => (
              <CollaboratorRow
                key={viewer.id}
                user={viewer}
                currentRole="viewer"
                isLoading={isLoading === viewer.id}
                onPermissionChange={handlePermissionChange}
                onRemove={handleRemove}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

interface CollaboratorRowProps {
  user: CollaboratorInfo;
  currentRole: "viewer" | "editor";
  isLoading: boolean;
  onPermissionChange: (
    userId: string,
    newRole: "viewer" | "editor"
  ) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

function CollaboratorRow({
  user,
  currentRole,
  isLoading,
  onPermissionChange,
  onRemove,
}: CollaboratorRowProps) {
  return (
    <div className="flex items-center justify-between space-x-4 p-2 rounded-md hover:bg-muted w-full">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="max-w-[140px]">
          <p className="text-sm font-medium leading-none truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Select
          value={currentRole}
          onValueChange={(value: "viewer" | "editor") =>
            onPermissionChange(user.id, value)
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(user.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
