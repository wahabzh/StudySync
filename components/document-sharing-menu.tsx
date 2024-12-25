"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// icons
import {
  UserPlus,
  Users,
  Globe,
  Lock,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function DocumentSharingMenu() {
  const { toast } = useToast();
  const [visibility, setVisibility] = useState<"link" | "invite">("invite");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"Editor" | "Viewer">(
    "Viewer"
  );
  const [shareLink, setShareLink] = useState(
    "https://studysync.com/doc/123?key=abc"
  );
  const [isPublished, setIsPublished] = useState(false);
  const [publishDescription, setPublishDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Mock data for collaborators
  const collaborators = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "",
      permission: "Editor" as const,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "",
      permission: "Viewer" as const,
    },
  ];

  // Mock handlers (to be implemented later with real functionality)
  const handleInvite = () => {
    console.log("Invite");
  };

  const handleVisibilityChange = (value: "link" | "invite") => {
    setVisibility(value);
  };

  const handlePermissionChange = (
    userId: string,
    permission: "Editor" | "Viewer"
  ) => {
    toast({
      title: "Permission updated",
      description: `Updated user permission to ${permission.toLowerCase()}`,
    });
  };

  const handleRemoveCollaborator = (userId: string) => {
    toast({
      title: "Collaborator removed",
      description: "The collaborator has been removed from the document",
    });
  };

  const handlePublish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsPublished(true);
      setIsLoading(false);
      toast({
        title: "Document published",
        description: "Your document is now available in the community",
      });
    }, 1000);
  };

  const handleUnpublish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsPublished(false);
      setIsLoading(false);
      toast({
        title: "Document unpublished",
        description: "Your document has been removed from the community",
      });
    }, 1000);
  };

  const copyLink = () => {
    console.log("Copy Link");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Share Document
          </DialogTitle>
          <DialogDescription>
            Invite others to collaborate or make your document public.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>
          <TabsContent value="share">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">Visibility</Label>
                <RadioGroup
                  defaultValue={visibility}
                  onValueChange={handleVisibilityChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <RadioGroupItem value="link" id="link" />
                    <Label
                      htmlFor="link"
                      className="flex items-center cursor-pointer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Anyone with link
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <RadioGroupItem value="invite" id="invite" />
                    <Label
                      htmlFor="invite"
                      className="flex items-center cursor-pointer"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Invite only
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {visibility === "link" && (
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-lg font-semibold">
                    Shareable Link
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="link"
                      value={shareLink}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        toast({
                          title: "Link copied",
                          description:
                            "The shareable link has been copied to your clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-semibold">
                  Invite Collaborators
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    placeholder="Email or username"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-grow"
                  />
                  <Select
                    value={invitePermission}
                    onValueChange={(value: "Editor" | "Viewer") =>
                      setInvitePermission(value)
                    }
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleInvite}
                    disabled={isLoading || !inviteEmail}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="mr-2 h-4 w-4" />
                    )}
                    Invite
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="manage">
            <div className="space-y-4 py-4">
              <Label className="text-lg font-semibold">
                Current Collaborators
              </Label>
              {collaborators.length === 0 ? (
                <p className="text-muted-foreground">No collaborators yet.</p>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between space-x-4 p-2 rounded-md hover:bg-muted"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {collaborator.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        defaultValue={collaborator.permission}
                        onValueChange={(value: "Editor" | "Viewer") =>
                          handlePermissionChange(collaborator.id, value)
                        }
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveCollaborator(collaborator.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="publish">
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="publish" className="text-lg font-semibold">
                  Publish to Community
                </Label>
              </div>
              {isPublished ? (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-lg font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add a description for your document"
                      value={publishDescription}
                      onChange={(e) => setPublishDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-lg font-semibold">
                      Tags
                    </Label>
                    <Select defaultValue="study">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="study">Study Notes</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handlePublish} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    Publish
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleUnpublish}
                  variant="destructive"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Unpublish
                </Button>
              )}
            </div>
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
