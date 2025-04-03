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

