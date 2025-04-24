"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { generateFlashcardsFromDocument } from "@/app/ai";
import { useToast } from "@/hooks/use-toast";
import { getDocumentContentById } from "@/app/document";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GenerateFlashcardsButtonProps {
    documentId: string;
    className?: string;
}

export default function GenerateFlashcardsButton({ documentId, className }: GenerateFlashcardsButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleGenerateFlashcards = async () => {
        setIsGenerating(true);
        try {
            const documentMarkdown = await getDocumentContentById(documentId);
            const { deckId } = await generateFlashcardsFromDocument(documentId, documentMarkdown);

            toast({
                title: "Flashcards generated!",
                description: "Your flashcards have been created successfully.",
            });

            // Navigate to the newly created deck
            router.push(`/dashboard/decks?edit=${deckId}`);
        } catch (error) {
            console.error("Error generating flashcards:", error);
            toast({
                variant: "destructive",
                title: "Generation failed",
                description: "Failed to generate flashcards. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            disabled={isGenerating}
            className={className}
            onClick={handleGenerateFlashcards}
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <BookOpen className="h-4 w-4" />
            )}
        </Button>
    );
} 