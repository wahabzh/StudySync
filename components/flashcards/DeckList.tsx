"use client";

import { useState, useEffect, useCallback } from "react";
import { FlashcardDeck } from "@/types/database";
import { getFlashcardDecks } from "@/app/flashcards";
import { DeckCard } from "@/components/flashcards/DeckCard";
import { DeckFilters } from "@/components/flashcards/DeckFilters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { EmptyDeckState } from "@/components/flashcards/EmptyDeckState";

export function DeckList() {
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("updated_desc");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Load decks with current filters
    const loadDecks = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedDecks = await getFlashcardDecks(searchQuery, sortBy);
            setDecks(fetchedDecks);
        } catch (error) {
            console.error("Error loading flashcard decks:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, sortBy]);

    // Load decks on initial render and when filters change
    useEffect(() => {
        loadDecks();
    }, [loadDecks]);

    // Refresh decks when URL changes (modal closes)
    useEffect(() => {
        const handleRouteChange = () => {
            // Check if we're on the decks page without any modal params
            if (pathname === "/dashboard/decks" &&
                !searchParams.has("create") &&
                !searchParams.has("edit") &&
                !searchParams.has("study")) {
                loadDecks();
            }
        };

        // Call once on mount
        handleRouteChange();

        // Listen for URL changes
        window.addEventListener("popstate", handleRouteChange);
        return () => {
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [pathname, searchParams, loadDecks]);

    // Handle creating a new deck
    const handleCreateDeck = () => {
        // Update URL to show create modal
        const params = new URLSearchParams(searchParams);
        params.set("create", "true");
        router.push(`/dashboard/decks?${params.toString()}`);
    };

    // Handle studying a deck
    const handleStudyDeck = (deckId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("study", deckId);
        router.push(`/dashboard/decks?${params.toString()}`);
    };

    // Handle editing a deck
    const handleEditDeck = (deckId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("edit", deckId);
        router.push(`/dashboard/decks?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Flashcard Decks</h1>
                <Button onClick={handleCreateDeck} className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Deck</span>
                </Button>
            </div>

            <DeckFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-[180px] rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse"
                        />
                    ))}
                </div>
            ) : decks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {decks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            onStudy={() => handleStudyDeck(deck.id)}
                            onEdit={() => handleEditDeck(deck.id)}
                            onRefresh={loadDecks}
                        />
                    ))}
                </div>
            ) : (
                <EmptyDeckState onCreate={handleCreateDeck} />
            )}
        </div>
    );
}