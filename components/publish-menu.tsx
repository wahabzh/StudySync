"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileX2, FileCheck2, BookOpenCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateDocumentStatus } from "@/app/document";
import { set } from "date-fns";

interface PublishMenuProps {
  documentId: string;
  userAccess: string;
  status: string;
}

const PublishMenu: React.FC<PublishMenuProps> = ({
  documentId,
  userAccess,
  status,
}) => {
  const [shareStatus, setShareStatus] = useState(status);

  const handlePublish = async () => {
    try {
      await updateDocumentStatus(documentId, "published");
      toast({
        title: "Document published!",
        description: "Your document has been published in the community.",
      });
      setShareStatus("published");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish document",
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateDocumentStatus(documentId, "invite-only");
      toast({
        title: "Document unpublished!",
        description: "Your document is no longer published in the community.",
      });
      setShareStatus("invite-only");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unpublish document",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {userAccess === "owner" ? (
        shareStatus === "published" ? (
          <Button
            variant="outline"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleUnpublish}
          >
            <FileX2 className="mr-2 h-4 w-4" />
            Unpublish
          </Button>
        ) : (
          <Button
            variant="outline"
            className="bg-cyan-600 text-white hover:bg-cyan-700"
            onClick={handlePublish}
          >
            <FileCheck2 className="mr-2 h-4 w-4" />
            Publish
          </Button>
        )
      ) : shareStatus === "published" ? (
        <Button variant="outline" className="text-cyan-600">
          <BookOpenCheck className="mr-2 h-4 w-4" />
          Published
        </Button>
      ) : null}
    </div>
  );
};

export default PublishMenu;
