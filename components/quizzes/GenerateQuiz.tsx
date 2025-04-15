"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileQuestion } from "lucide-react";
import { generateQuizFromDocument } from "@/app/ai";
import { useToast } from "@/hooks/use-toast";
import { getDocumentContentById } from "@/app/document";

interface GenerateQuizButtonProps {
    documentId: string;
    className?: string;
}

export default function GenerateQuizButton({ documentId, className }: GenerateQuizButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleGenerateQuiz = async () => {
        setIsGenerating(true);
        try {
            const documentMarkdown = await getDocumentContentById(documentId);
            const { quizId } = await generateQuizFromDocument(documentId, documentMarkdown);

            toast({
                title: "Quiz generated!",
                description: "Your quiz has been created successfully.",
            });

            // Navigate to the newly created quiz
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
            size="icon"
            disabled={isGenerating}
            className={className}
            onClick={handleGenerateQuiz}
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileQuestion className="h-4 w-4" />
            )}
        </Button>
    );
} 