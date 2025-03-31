"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { QuizQuestion, Quiz } from "@/types/database";
import { addPoints } from "@/app/gamification";

// ==================== Flashcard Deck Operations ====================

/**
 * Get all flashcard decks for the current user
 */
export async function getQuizzes(
    searchQuery: string = "",
    sortBy: string = "updated_desc"
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    let query = supabase
        .from("quizzes")
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
        console.error("Error fetching quizzes:", error);
        throw error;
    }

    return decks as Quiz[];
}

/**
 * Delete a flashcard deck
 */
export async function deleteQuiz(quizId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId)
        .eq("owner_id", user.id);

    if (error) {
        console.error("Error deleting quiz:", error);
        throw error;
    }

    revalidatePath("/dashboard/quizzes");
}

/**
 * Get a specific flashcard deck by ID
 */
export async function getQuiz(quizId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data: deck, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .eq("owner_id", user.id)
        .single();

    if (error) {
        console.error("Error fetching quiz:", error);
        throw error;
    }

    return deck as Quiz;
}

/**
 * Get all flashcards for a specific deck
 */
export async function getQuestions(quizId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // First verify the user owns the deck
    const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("id")
        .eq("id", quizId)
        .eq("owner_id", user.id)
        .single();

    if (quizError || !quiz) {
        console.error("Error verifying quiz ownership:", quizError);
        throw new Error("Quiz not found or access denied");
    }

    const { data: questions, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("deck_id", quizId)
        .order("position", { ascending: true });

    if (error) {
        console.error("Error fetching questions:", error);
        throw error;
    }

    return questions as QuizQuestion[];
}

/**
 * Save a flashcard deck with its cards in a single operation
 * This handles both creation and updates
 */
export async function saveQuizWithQuestions(
    quizData: { id?: string; title: string; description?: string },
    questions: { id?: string; question: string; answer_a: string; answer_b: string; answer_c: string; answer_d: string; correct: number; position: number }[]
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    let quizId: string;

    // Step 1: Create or update the deck
    if (quizData.id) {
        // Update existing deck
        const { error: updateError } = await supabase
            .from("quizzes")
            .update({
                title: quizData.title,
                description: quizData.description || null,
            })
            .eq("id", quizData.id)
            .eq("owner_id", user.id);

        if (updateError) {
            console.error("Error updating quiz:", updateError);
            throw updateError;
        }

        quizId = quizData.id;
    } else {
        // Create new deck
        const { data: newQuiz, error: createError } = await supabase
            .from("quizzes")
            .insert({
                title: quizData.title,
                description: quizData.description || null,
                owner_id: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error("Error creating quiz:", createError);
            throw createError;
        }

        quizId = newQuiz.id;

        // Award points for creating a new deck
        await addPoints(10);
    }

    // Step 2: Get existing cards for this deck
    const { data: existingQuestions, error: fetchError } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("deck_id", quizId);

    if (fetchError) {
        console.error("Error fetching existing quizzes:", fetchError);
        throw fetchError;
    }

    // Step 3: Determine which cards to delete
    const existingQuestionIds = new Set(existingQuestions.map(question => question.id));
    const newQuestionIds = new Set(questions.filter(question => question.id).map(question => question.id));

    const questionsToDelete = Array.from(existingQuestionIds).filter(id => !newQuestionIds.has(id));

    // Step 4: Delete cards that are no longer present
    if (questionsToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from("quiz_questions")
            .delete()
            .in("id", questionsToDelete);

        if (deleteError) {
            console.error("Error deleting questions:", deleteError);
            throw deleteError;
        }
    }

    // Step 5: Update existing cards and create new ones
    for (const question of questions) {
        if (question.id && existingQuestionIds.has(question.id)) {
            // Update existing card
            const { error: updateError } = await supabase
                .from("quiz_questions")
                .update({
                    question: question.question,
                    answer_a: question.answer_a,
                    answer_b: question.answer_b,
                    answer_c: question.answer_c,
                    answer_d: question.answer_d,
                    correct: question.correct,
                    position: question.position,
                })
                .eq("id", question.id)
                .eq("deck_id", quizId);

            if (updateError) {
                console.error("Error updating question:", updateError);
                throw updateError;
            }
        } else {
            // Create new card
            const { error: createError } = await supabase
                .from("quiz_questions")
                .insert({
                    deck_id: quizId,
                    question: question.question,
                    answer_a: question.answer_a,
                    answer_b: question.answer_b,
                    answer_c: question.answer_c,
                    answer_d: question.answer_d,
                    correct: question.correct,
                    position: question.position,
                });

            if (createError) {
                console.error("Error creating question:", createError);
                throw createError;
            }

            // Award points for each new flashcard
            await addPoints(2);
        }
    }

    revalidatePath("/dashboard/quizzes");

    return { quizId };
} 