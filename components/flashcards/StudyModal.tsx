"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFlashcardDeck, getFlashcards } from "@/app/flashcards";
import { Flashcard, FlashcardDeck } from "@/types/database";
import { FlashcardView } from "./FlashcardView";
import { ChevronLeft, ChevronRight, Loader2, Trophy, ArrowLeftIcon, ArrowRightIcon, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function StudyModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const deckId = searchParams.get("study");
    const isOpen = !!deckId;
    const { toast } = useToast();

    const [deck, setDeck] = useState<FlashcardDeck | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Load deck and cards
    useEffect(() => {
        const loadDeckData = async () => {
            if (!deckId) return;

            setLoading(true);
            try {
                const deckData = await getFlashcardDeck(deckId);
                const cardsData = await getFlashcards(deckId);

                setDeck(deckData);
                setCards(cardsData);
                setCurrentIndex(0);
                setFlipped(false);
                setCompleted(false);
            } catch (error) {
                console.error("Error loading study data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load flashcards"
                });
                handleClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            loadDeckData();
        }
    }, [isOpen, deckId]);

    const handleClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("study");
        router.push(`/dashboard/decks?${params.toString()}`);
    };

    const handleNext = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
        } else if (!completed && cards.length > 0) {
            // If we're at the last card, mark as completed
            setCompleted(true);
        }
    }, [currentIndex, cards.length, completed]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setFlipped(false);
        }
    }, [currentIndex]);

    const handleFlip = useCallback(() => {
        setFlipped(!flipped);
    }, [flipped]);

    const handleRestart = () => {
        setCurrentIndex(0);
        setFlipped(false);
        setCompleted(false);
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handlePrevious();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === " ") {
                e.preventDefault(); // Prevent page scrolling
                handleFlip();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handlePrevious, handleNext, handleFlip]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {deck ? deck.title : "Study Flashcards"}
                    </DialogTitle>
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
                                <h3 className="text-xl font-medium mb-2">Congratulations!</h3>
                                <p className="text-muted-foreground mb-6">
                                    You've completed all {cards.length} flashcards in this deck.
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={handleClose}>
                                        Close
                                    </Button>
                                    <Button onClick={handleRestart}>
                                        Study Again
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-muted-foreground text-center">
                                    Card {currentIndex + 1} of {cards.length}
                                </div>

                                <FlashcardView
                                    card={cards[currentIndex]}
                                    isFlipped={flipped}
                                    onFlip={handleFlip}
                                />

                                <div className="flex justify-between items-center pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleNext}
                                    >
                                        {currentIndex === cards.length - 1 ? "Finish" : "Next"}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>

                                <div className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-4">

                                    <div className="flex items-center gap-1">
                                        <ArrowLeftIcon className="h-3 w-3" />
                                        <span>Previous</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Keyboard className="h-3 w-3" />
                                        <span>Space to show ans</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ArrowRightIcon className="h-3 w-3" />
                                        <span>Next</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            This deck has no flashcards yet. Add some cards to start studying.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}