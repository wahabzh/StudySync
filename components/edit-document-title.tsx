"use client";

import { useState, useRef, useEffect } from "react";
import { renameDocument } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditDocumentTitleProps {
  documentId: string;
  initialTitle: string;
  canEdit: boolean;
}

export default function EditDocumentTitle({ 
  documentId, 
  initialTitle, 
  canEdit 
}: EditDocumentTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = async () => {
    if (!title.trim() || title === initialTitle) {
      setIsEditing(false);
      setTitle(initialTitle);
      return;
    }

    setIsPending(true);
    try {
      await renameDocument(documentId, title.trim());
      toast({
        title: "Document renamed",
        description: "Your document has been successfully renamed.",
      });
    } catch (error) {
      console.error("Failed to rename document:", error);
      toast({
        title: "Rename failed",
        description: "Could not rename the document. Please try again.",
        variant: "destructive",
      });
      setTitle(initialTitle);
    } finally {
      setIsPending(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(initialTitle);
    }
  };

  if (!canEdit) {
    return <span className="font-medium text-lg truncate max-w-[35ch]">{initialTitle}</span>;
  }
  
  return (
    <div className="flex items-center gap-1">
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-medium text-lg focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 max-w-[35ch]"
            disabled={isPending}
          />
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleRename}
              disabled={isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => {
                setIsEditing(false);
                setTitle(initialTitle);
              }}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="font-medium text-lg truncate max-w-[35ch]">{title}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
} 