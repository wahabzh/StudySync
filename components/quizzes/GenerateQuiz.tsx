"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateQuizFromDocument } from "@/app/ai";
import { useToast } from "@/hooks/use-toast";
import { getDocumentContentById } from "@/app/document";

interface GenerateQuizButtonProps {
    documentId: string;
}

export default function GenerateQuizButton({ documentId }: GenerateQuizButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        setIsGenerating(true);
        try {
            // In a real implementation, we would get the document content
            // For now, we'll just pass a placeholder
            const placeholderContent = "This is a sample document content for testing flashcard generation.";
           
            const documentMarkdown = await getDocumentContentById(documentId);

            const { quizId } = await generateQuizFromDocument(documentId, documentMarkdown);

            toast({
                title: "Quiz generated!",
                description: "Your quiz has been created successfully.",
            });

            // Navigate to the newly created deck
            router.push(`/dashboard/quizzes?edit=${quizId}`);
        } catch (error) {
            console.error("Error generating quiz:", error);
            toast({
                variant: "destructive",
                title: "Generation failed",
                description: "Failed to generate quiz. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateQuiz}
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
                    <span className="hidden sm:inline">Generate Quiz</span>
                    <span className="sm:hidden">Quiz</span>
                </>
            )}
        </Button>
    );
} 