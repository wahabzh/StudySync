"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Flashcard, FlashcardDeck } from "@/types/database";
import { addPoints } from "@/app/gamification";
import { generateAndStoreFlashcardEmbeddings } from "@/app/knowledge-base";

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

    try {
        // Fetch the deck information
        const { data: deck, error: deckFetchError } = await supabase
            .from("flashcard_decks")
            .select("*")
            .eq("id", deckId)
            .single();

        if (deckFetchError) {
            console.error("Error fetching deck:", deckFetchError);
        } else {
            // Generate embeddings for the newly created flashcard
            await generateAndStoreFlashcardEmbeddings(deck, [flashcard]);
        }
    } catch (error) {
        console.error("Error generating flashcard embeddings:", error);
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

    try {
        // Fetch the updated flashcard
        const { data: updatedFlashcard, error: flashcardFetchError } = await supabase
            .from("flashcards")
            .select("*")
            .eq("id", flashcardId)
            .single();

        if (flashcardFetchError) {
            console.error("Error fetching updated flashcard:", flashcardFetchError);
        } else {
            // Fetch the deck
            const { data: deck, error: deckFetchError } = await supabase
                .from("flashcard_decks")
                .select("*")
                .eq("id", updatedFlashcard.deck_id)
                .single();

            if (deckFetchError) {
                console.error("Error fetching deck:", deckFetchError);
            } else {
                // Generate embeddings for the updated flashcard
                await generateAndStoreFlashcardEmbeddings(deck, [updatedFlashcard]);
            }
        }
    } catch (error) {
        console.error("Error generating flashcard embeddings:", error);
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

/**
 * Save a flashcard deck with its cards in a single operation
 * This handles both creation and updates
 */
export async function saveFlashcardDeckWithCards(
    deckData: { id?: string; title: string; description?: string },
    cards: { id?: string; question: string; answer: string; position: number }[]
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    let deckId: string;

    // Step 1: Create or update the deck
    if (deckData.id) {
        // Update existing deck
        const { error: updateError } = await supabase
            .from("flashcard_decks")
            .update({
                title: deckData.title,
                description: deckData.description || null,
            })
            .eq("id", deckData.id)
            .eq("owner_id", user.id);

        if (updateError) {
            console.error("Error updating flashcard deck:", updateError);
            throw updateError;
        }

        deckId = deckData.id;
    } else {
        // Create new deck
        const { data: newDeck, error: createError } = await supabase
            .from("flashcard_decks")
            .insert({
                title: deckData.title,
                description: deckData.description || null,
                owner_id: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating flashcard deck:", createError);
            throw createError;
        }

        deckId = newDeck.id;

        // Award points for creating a new deck
        await addPoints(10);
    }

    // Step 2: Get existing cards for this deck
    const { data: existingCards, error: fetchError } = await supabase
        .from("flashcards")
        .select("id")
        .eq("deck_id", deckId);

    if (fetchError) {
        console.error("Error fetching existing flashcards:", fetchError);
        throw fetchError;
    }

    // Step 3: Determine which cards to delete
    const existingCardIds = new Set(existingCards.map(card => card.id));
    const newCardIds = new Set(cards.filter(card => card.id).map(card => card.id));

    const cardsToDelete = Array.from(existingCardIds).filter(id => !newCardIds.has(id));

    // Step 4: Delete cards that are no longer present
    if (cardsToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from("flashcards")
            .delete()
            .in("id", cardsToDelete);

        if (deleteError) {
            console.error("Error deleting flashcards:", deleteError);
            throw deleteError;
        }
    }

    // Step 5: Update existing cards and create new ones
    for (const card of cards) {
        if (card.id && existingCardIds.has(card.id)) {
            // Update existing card
            const { error: updateError } = await supabase
                .from("flashcards")
                .update({
                    question: card.question,
                    answer: card.answer,
                    position: card.position,
                })
                .eq("id", card.id)
                .eq("deck_id", deckId);

            if (updateError) {
                console.error("Error updating flashcard:", updateError);
                throw updateError;
            }
        } else {
            // Create new card
            const { error: createError } = await supabase
                .from("flashcards")
                .insert({
                    deck_id: deckId,
                    question: card.question,
                    answer: card.answer,
                    position: card.position,
                });

            if (createError) {
                console.error("Error creating flashcard:", createError);
                throw createError;
            }

            // Award points for each new flashcard
            await addPoints(2);
        }
    }
    try {
        // Fetch the complete deck information
        const { data: deck, error: deckFetchError } = await supabase
            .from("flashcard_decks")
            .select("*")
            .eq("id", deckId)
            .single();

        if (deckFetchError) {
            console.error("Error fetching deck:", deckFetchError);
        } else {
            // Fetch all flashcards in the deck
            const { data: allCards, error: cardsFetchError } = await supabase
                .from("flashcards")
                .select("*")
                .eq("deck_id", deckId)
                .order("position");

            if (cardsFetchError) {
                console.error("Error fetching cards:", cardsFetchError);
            } else {
                // Generate embeddings for the entire flashcard deck
                await generateAndStoreFlashcardEmbeddings(deck, allCards);
            }
        }
    } catch (error) {
        console.error("Error generating flashcard deck embeddings:", error);
    }

    revalidatePath("/dashboard/decks");

    return { deckId };
} 