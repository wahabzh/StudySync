"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateFlashcardsFromDocument } from "@/app/ai";
import { useToast } from "@/hooks/use-toast";
import { getDocumentContentById } from "@/app/document";

interface GenerateFlashcardsButtonProps {
    documentId: string;
}

export default function GenerateFlashcardsButton({ documentId }: GenerateFlashcardsButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleGenerateFlashcards = async () => {
        setIsGenerating(true);
        try {
            // In a real implementation, we would get the document content
            // For now, we'll just pass a placeholder
            const placeholderContent = "This is a sample document content for testing flashcard generation.";
           
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
            // toast({
            //     variant: "destructive",
            //     title: "Generation failed",
            //     description: "Failed to generate flashcards. Please try again.",
            // });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="flex items-center gap-1"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate Flashcards</span>
                    <span className="sm:hidden">Flashcards</span>
                </>
            )}
        </Button>
    );
} 