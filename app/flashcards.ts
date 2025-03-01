"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Flashcard, FlashcardDeck } from "@/types/database";
import { addPoints } from "@/app/gamification";

// ==================== Flashcard Deck Operations ====================

/**
 * Get all flashcard decks for the current user
 */
export async function getFlashcardDecks(
    searchQuery: string = "",
    sortBy: string = "updated_desc"
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    let query = supabase
        .from("flashcard_decks")
        .select("*")
        .eq("owner_id", user.id);

    // Apply search filter if provided
    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply sorting
    if (sortBy === "title_asc") {
        query = query.order("title", { ascending: true });
    } else if (sortBy === "created_desc") {
        query = query.order("created_at", { ascending: false });
    } else {
        // Default: updated_desc
        query = query.order("updated_at", { ascending: false });
    }

    const { data: decks, error } = await query;

    if (error) {
        console.error("Error fetching flashcard decks:", error);
        throw error;
    }

    return decks as FlashcardDeck[];
}

/**
 * Get a specific flashcard deck by ID
 */
export async function getFlashcardDeck(deckId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: deck, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("id", deckId)
        .eq("owner_id", user.id)
        .single();

    if (error) {
        console.error("Error fetching flashcard deck:", error);
        throw error;
    }

    return deck as FlashcardDeck;
}

/**
 * Create a new flashcard deck
 */
export async function createFlashcardDeck(title: string, description: string = "") {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: deck, error } = await supabase
        .from("flashcard_decks")
        .insert({
            title,
            description,
            owner_id: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating flashcard deck:", error);
        throw error;
    }

    // Award points for creating a new deck
    await addPoints(10);

    revalidatePath("/dashboard/decks");
    return deck.id;
}

/**
 * Update a flashcard deck
 */
export async function updateFlashcardDeck(
    deckId: string,
    updates: { title?: string; description?: string }
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { error } = await supabase
        .from("flashcard_decks")
        .update(updates)
        .eq("id", deckId)
        .eq("owner_id", user.id);

    if (error) {
        console.error("Error updating flashcard deck:", error);
        throw error;
    }

    revalidatePath("/dashboard/decks");
}

/**
 * Delete a flashcard deck
 */
export async function deleteFlashcardDeck(deckId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { error } = await supabase
        .from("flashcard_decks")
        .delete()
        .eq("id", deckId)
        .eq("owner_id", user.id);

    if (error) {
        console.error("Error deleting flashcard deck:", error);
        throw error;
    }

    revalidatePath("/dashboard/decks");
}

// ==================== Flashcard Operations ====================

/**
 * Get all flashcards for a specific deck
 */
export async function getFlashcards(deckId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // First verify the user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("id", deckId)
        .eq("owner_id", user.id)
        .single();

    if (deckError || !deck) {
        console.error("Error verifying deck ownership:", deckError);
        throw new Error("Deck not found or access denied");
    }

    const { data: flashcards, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("position", { ascending: true });

    if (error) {
        console.error("Error fetching flashcards:", error);
        throw error;
    }

    return flashcards as Flashcard[];
}

/**
 * Create a new flashcard
 */
export async function createFlashcard(
    deckId: string,
    question: string,
    answer: string
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // First verify the user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("id", deckId)
        .eq("owner_id", user.id)
        .single();

    if (deckError || !deck) {
        console.error("Error verifying deck ownership:", deckError);
        throw new Error("Deck not found or access denied");
    }

    // Get the highest position to place the new card at the end
    const { data: highestPosition, error: positionError } = await supabase
        .from("flashcards")
        .select("position")
        .eq("deck_id", deckId)
        .order("position", { ascending: false })
        .limit(1)
        .single();

    const newPosition = highestPosition ? highestPosition.position + 1 : 0;

    const { data: flashcard, error } = await supabase
        .from("flashcards")
        .insert({
            deck_id: deckId,
            question,
            answer,
            position: newPosition,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating flashcard:", error);
        throw error;
    }

    // Award points for creating a new flashcard
    await addPoints(2);

    revalidatePath("/dashboard/decks/");

    return flashcard.id;
}

/**
 * Update a flashcard
 */
export async function updateFlashcard(
    flashcardId: string,
    updates: { question?: string; answer?: string }
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the flashcard to find its deck
    const { data: flashcard, error: fetchError } = await supabase
        .from("flashcards")
        .select("deck_id")
        .eq("id", flashcardId)
        .single();

    if (fetchError || !flashcard) {
        console.error("Error fetching flashcard:", fetchError);
        throw new Error("Flashcard not found");
    }

    // Verify the user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("id", flashcard.deck_id)
        .eq("owner_id", user.id)
        .single();

    if (deckError || !deck) {
        console.error("Error verifying deck ownership:", deckError);
        throw new Error("Access denied");
    }

    const { error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", flashcardId);

    if (error) {
        console.error("Error updating flashcard:", error);
        throw error;
    }

    revalidatePath("/dashboard/decks/");
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(flashcardId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // First get the flashcard to find its deck
    const { data: flashcard, error: fetchError } = await supabase
        .from("flashcards")
        .select("deck_id")
        .eq("id", flashcardId)
        .single();

    if (fetchError || !flashcard) {
        console.error("Error fetching flashcard:", fetchError);
        throw new Error("Flashcard not found");
    }

    // Verify the user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("id", flashcard.deck_id)
        .eq("owner_id", user.id)
        .single();

    if (deckError || !deck) {
        console.error("Error verifying deck ownership:", deckError);
        throw new Error("Access denied");
    }

    const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId);

    if (error) {
        console.error("Error deleting flashcard:", error);
        throw error;
    }

    revalidatePath("/dashboard/decks/");
}

/**
 * Update the positions of multiple flashcards (for reordering)
 */
export async function updateFlashcardPositions(
    deckId: string,
    positionUpdates: { id: string; position: number }[]
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // Verify the user owns the deck
    const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("id", deckId)
        .eq("owner_id", user.id)
        .single();

    if (deckError || !deck) {
        console.error("Error verifying deck ownership:", deckError);
        throw new Error("Access denied");
    }

    // Update positions in a transaction
    for (const update of positionUpdates) {
        const { error } = await supabase
            .from("flashcards")
            .update({ position: update.position })
            .eq("id", update.id)
            .eq("deck_id", deckId);

        if (error) {
            console.error("Error updating flashcard position:", error);
            throw error;
        }
    }

    revalidatePath("/dashboard/decks/");
}

/**
 * Generate flashcards from document content using AI
 * This is a placeholder for future implementation
 */
export async function generateFlashcardsFromDocument(
    documentId: string,
    deckId?: string
) {
    // This would integrate with your AI service to generate flashcards
    // from document content

    // For now, we'll just return a placeholder message
    return {
        success: false,
        message: "Flashcard generation from documents is not yet implemented"
    };
} 