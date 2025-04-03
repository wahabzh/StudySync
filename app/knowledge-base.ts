import { createClient } from "@/utils/supabase/server";
import { Document, Flashcard, FlashcardDeck, Quiz, QuizQuestion } from '@/types/database';
import { convertBlocksToMarkdown } from '@/utils/blockNoteConverter';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export async function generateAndStoreDocumentEmbeddings(document: Document) {
    // Get the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // Get the document text
    const documentText = document.title + '\n' + convertBlocksToMarkdown(document.content);

    try {
        // Generate the embedding
        const model = google.textEmbeddingModel('text-embedding-004');
        const { embedding } = await embed({
            model,
            value: documentText,
        });

        // Store embedding in Supabase
        const { error } = await supabase
            .from('document_embeddings')
            .upsert({
                document_id: document.id,
                content: documentText,
                embedding
            });

        if (error) {
            console.error('Error storing document embeddings:', error);
            throw error;
        }
    } catch (error) {
        // if there's an error generate the embeddings, throw the error
        throw error;
    }
}

export async function generateAndStoreFlashcardEmbeddings(deck: FlashcardDeck, cards: Flashcard[]) {
    // Get the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // Get the flashcard text
    const flashcardText = getFlashcardText(deck, cards);

    // Generate the embedding
    const model = google.textEmbeddingModel('text-embedding-004');
    const { embedding } = await embed({
        model,
        value: flashcardText,
    });

    // Store embedding in Supabase
    const { error } = await supabase
        .from('flashcard_embeddings')
        .upsert({
            deck_id: deck.id,
            content: flashcardText,
            embedding
        }, { onConflict: 'deck_id' });

    if (error) {
        console.error('Error storing flashcard embeddings:', error);
        throw error;
    }
}

function getFlashcardText(deck: FlashcardDeck, cards: Flashcard[]) {
    return deck.title + '\n' + deck.description + '\n' + cards.map(card => "Q: " + card.question + '\n' + "A: " + card.answer).join('\n');
}

export async function generateAndStoreQuizEmbeddings(quiz: Quiz, questions: QuizQuestion[]) {
    // Get the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // Get the quiz text
    const quizText = getQuizText(quiz, questions);

    // Generate the embedding
    const model = google.textEmbeddingModel('text-embedding-004');
    const { embedding } = await embed({
        model,
        value: quizText,
    });

    // Store embedding in Supabase
    const { error } = await supabase
        .from('quiz_embeddings')
        .upsert({
            quiz_id: quiz.id,
            content: quizText,
            embedding
        }, { onConflict: 'quiz_id' });

    if (error) {
        console.error('Error storing quiz embeddings:', error);
        throw error;
    }
}

function getQuizText(quiz: Quiz, questions: QuizQuestion[]) {
    return quiz.title + '\n' + quiz.description + '\n' + questions.map(question =>
        "Question: " + question.question + '\n' +
        "A: " + question.answer_a + '\n' +
        "B: " + question.answer_b + '\n' +
        "C: " + question.answer_c + '\n' +
        "D: " + question.answer_d + '\n' +
        `Correct Answer: ${['A', 'B', 'C', 'D'][question.correct - 1]}`
    ).join('\n');
}