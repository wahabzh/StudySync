"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Globe, Lock } from "lucide-react";
import { DocumentStatus } from "@/types/database";

interface ShareTabProps {
  documentId: string;
  status: DocumentStatus;
  onStatusChange: (status: DocumentStatus) => Promise<void>;
  onInviteUser: (email: string, role: "viewer" | "editor") => Promise<void>;
}

export function ShareTab({
  documentId,
  status,
  onStatusChange,
  onInviteUser,
}: ShareTabProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("viewer");
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    setIsLoading(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      await onInviteUser(inviteEmail, inviteRole);
      setInviteEmail("");
    } catch (error) {
      console.error("Failed to invite user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Visibility</Label>
        <RadioGroup
          value={status}
          onValueChange={(value: DocumentStatus) => handleStatusChange(value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
            <RadioGroupItem value="anyone-with-link" id="anyone-with-link" />
            <Label
              htmlFor="anyone-with-link"
              className="flex items-center cursor-pointer"
            >
              <Globe className="mr-2 h-4 w-4" />
              Anyone with link
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
            <RadioGroupItem value="invite-only" id="invite-only" />
            <Label
              htmlFor="invite-only"
              className="flex items-center cursor-pointer"
            >
              <Lock className="mr-2 h-4 w-4" />
              Invite only
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg font-semibold">
          Invite People
        </Label>
        <div className="flex space-x-2">
          <Input
            id="email"
            placeholder="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as "viewer" | "editor")
            }
            className="px-3 py-2 border rounded-md"
          >
            <option value="viewer">Can view</option>
            <option value="editor">Can edit</option>
          </select>
          <Button onClick={handleInvite} disabled={isLoading || !inviteEmail}>
            Invite
          </Button>
        </div>
      </div>
    </div>
  );
}
