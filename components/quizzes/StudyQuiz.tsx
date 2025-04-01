"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getQuiz, getQuestions } from "@/app/quizzes";
import { Quiz, QuizQuestion } from "@/types/database";
import { QuizView } from "./QuizView";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function StudyQuiz() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get("study");
    const isOpen = !!quizId;
    const { toast } = useToast();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [cards, setCards] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const loadDeckData = async () => {
            if (!quizId) return;

            setLoading(true);
            try {
                const quizData = await getQuiz(quizId);
                const cardsData = await getQuestions(quizId);

                setQuiz(quizData);
                setCards(cardsData);
                setCurrentIndex(0);
                setSelectedAnswers(new Array(cardsData.length).fill(null));
                setCorrectAnswers(0);
                setCompleted(false);
            } catch (error) {
                console.error("Error loading data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load quiz"
                });
                handleClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            loadDeckData();
        }
    }, [isOpen, quizId]);

    const handleClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("study");
        router.push(`/dashboard/quizzes?${params.toString()}`);
    };

    const handleNext = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCompleted(true);
        }
    }, [currentIndex, cards.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && currentIndex !== 0) {
                handlePrevious();
            } else if (e.key === "ArrowRight" && selectedAnswers[currentIndex] !== null) {
                handleNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, selectedAnswers, handlePrevious, handleNext]);

    const handleSelectAnswer = (answerIndex: number) => {
        if (selectedAnswers[currentIndex] !== null) return; // Prevent multiple selections

        const newSelectedAnswers = [...selectedAnswers];
        newSelectedAnswers[currentIndex] = answerIndex;
        setSelectedAnswers(newSelectedAnswers);

        if (answerIndex === cards[currentIndex].correct) {
            setCorrectAnswers((prev) => prev + 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswers(new Array(cards.length).fill(null));
        setCorrectAnswers(0);
        setCompleted(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{quiz ? quiz.title : "Study Quiz"}</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : cards.length > 0 ? (
                    <div className="space-y-6 py-4">
                        {completed ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="rounded-full bg-primary/10 p-3 mb-4">
                                    <Trophy className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">Quiz Completed!</h3>
                                <p className="text-muted-foreground mb-6">
                                    You answered {correctAnswers} out of {cards.length} correctly ({((correctAnswers / cards.length) * 100).toFixed(2)}%).
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={handleClose}>
                                        Close
                                    </Button>
                                    <Button onClick={handleRestart}>Retry Quiz</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-muted-foreground text-center">
                                    Question {currentIndex + 1} of {cards.length}
                                </div>

                                <QuizView
                                    card={cards[currentIndex]}
                                    selectedAnswer={selectedAnswers[currentIndex]}
                                    onSelectAnswer={handleSelectAnswer}
                                />

                                <div className="flex justify-between items-center pt-2">
                                    <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>

                                    <Button variant="outline" onClick={handleNext} disabled={selectedAnswers[currentIndex] === null}>
                                        {currentIndex === cards.length - 1 ? "Finish" : "Next"}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">This quiz has no questions yet. Add some questions to start.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
