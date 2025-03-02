import { DeckList } from "@/components/flashcards/DeckList";
import { DeckFormModal } from "@/components/flashcards/DeckFormModal";
import { StudyModal } from "@/components/flashcards/StudyModal";
import { Suspense } from "react";

export const metadata = {
    title: "Flashcard Decks",
    description: "Manage and study your flashcard decks",
};

export default function FlashcardDecksPage() {
    return (
        <Suspense>
            <div className="container py-8">
                <DeckList />
                <DeckFormModal />
                <StudyModal />
            </div>
        </Suspense>
    );
} 