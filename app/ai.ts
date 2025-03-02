'use server'

import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

export async function performOCR(url: string) {
    try {
        if (!url) {
            throw new Error('Image URL is required.');
        }

        // Initialize the Vision API client using credentials from env var
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
        const client = new ImageAnnotatorClient({
            credentials,
            projectId: process.env.GOOGLE_CLOUD_PROJECT
        });

        // Perform OCR using Google Vision API
        const [result] = await client.textDetection(url);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { text: 'No text detected in the image.' };
        }

        return { text: detections[0].description };
    } catch (error) {
        console.error('Error during OCR:', error);
        throw new Error('Failed to process the image.');
    }
}

export const askAIAboutImage = async (imageUrl: string) => {
    const maxTokens = 50;
    //download the image from the url

    try {
        const result = await generateText({
            model: google('gemini-1.5-flash-8b'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'What is the content of the image about?',
                        },
                        {
                            type: 'file',
                            mimeType: 'image',
                            data: imageUrl,
                        },
                    ],
                },
            ],
            maxTokens: maxTokens,
        });

        return result.text;
    } catch (error) {
        console.error('Error during askAIAboutImage:', error);
        throw new Error('Failed to ask AI about the image.');
    }
}

export async function continueWriting(selectedText: string, documentMarkdown: string) {

    // limit the documentMarkdown to first 1000 characters
    const truncatedDocumentMarkdown = documentMarkdown.slice(0, 1000);

    // limit the selectedText to last 200 characters
    const truncatedSelectedText = selectedText.slice(-200);

    const maxTokens = 50;


    const result = await generateText({
        model: google('gemini-1.5-flash-latest'),
        system: `You are a helpful assistant that continues writing a document. You are given a selected text and a document. You need to continue writing the document in a way that is coherent with the selected text and the document and must be completed within ${maxTokens} tokens. Also include the selected text in the response.`,
        prompt: `Continue writing the following selected text: ${selectedText}. For context, here is the entire document: ${truncatedDocumentMarkdown}`,
        maxTokens: maxTokens,
    });
    return result.text;
}

// /**
//  * Generate flashcards from document content
//  * @param documentId The ID of the document to generate flashcards from
//  * @param documentContent The content of the document
//  * @returns The ID of the created flashcard deck
//  */
// export async function generateFlashcardsFromDocument(documentId: string, documentMarkdown: string) {
//     try {
//         // This is a placeholder implementation
//         // In a real implementation, we would:
//         // 1. Use AI to extract key concepts from the document
//         // 2. Generate question-answer pairs
//         // 3. Create a new flashcard deck with these pairs


//         // For now, we'll create a static deck with placeholder cards
//         const { saveFlashcardDeckWithCards } = await import('./flashcards');

//         // Extract a title from the first few characters of the document
//         const title = documentMarkdown.slice(0, 30).trim() + "...";

//         // Create a deck with some placeholder cards
//         const { deckId } = await saveFlashcardDeckWithCards(
//             {
//                 title: `AI Generated: ${title}`,
//                 description: `Automatically generated from document ${documentId}`
//             },
//             [
//                 {
//                     question: documentMarkdown, // testing
//                     answer: "This is a placeholder answer. In the real implementation, AI would analyze the document content.",
//                     position: 0
//                 },
//                 {
//                     question: "What are the key concepts mentioned?",
//                     answer: "This is a placeholder answer. The AI would extract key concepts from the document.",
//                     position: 1
//                 },
//                 {
//                     question: "How does this relate to the course material?",
//                     answer: "This is a placeholder answer. The AI would try to connect the document to relevant course material.",
//                     position: 2
//                 }
//             ]
//         );

//         return { deckId };
//     } catch (error) {
//         console.error("Error generating flashcards:", error);
//         throw new Error("Failed to generate flashcards from document");
//     }
// }

// Define the card schema outside the function to reduce nesting
const CardSchema = z.object({
    question: z.string().describe("A specific question about a concept in the document"),
    answer: z.string().describe("A concise but complete answer to the question"),
    position: z.number().describe("The position of this card in the deck, starting from 0")
});

// Define the flashcard deck schema separately
const FlashcardDeckSchema = z.object({
    title: z.string().describe("A concise title for the flashcard deck based on the document content"),
    description: z.string().describe("A brief description of what this flashcard deck covers"),
    cards: z.array(CardSchema).min(1).max(10).describe("An array of 1-10 flashcards covering the key concepts in the document")
});

// Type for the generated object
type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>;

/**
 * Generate flashcards from document content
 * @param documentId The ID of the document to generate flashcards from
 * @param documentMarkdown The content of the document
 * @returns The ID of the created flashcard deck
 */
export async function generateFlashcardsFromDocument(documentId: string, documentMarkdown: string) {
    try {
        // Truncate document if it's too long
        const truncatedContent = documentMarkdown.length > 6000
            ? documentMarkdown.slice(0, 6000) + "..."
            : documentMarkdown;

        // Generate structured flashcards using AI with type assertion
        const result = await generateObject({
            model: google('gemini-1.5-flash-latest'),
            schema: FlashcardDeckSchema,
            prompt: `Create flashcards from this document: ${truncatedContent}`
        });

        // Use type assertion to help TypeScript
        const object = result.object as FlashcardDeck;

        // Save the generated flashcards
        const { saveFlashcardDeckWithCards } = await import('./flashcards');

        const { deckId } = await saveFlashcardDeckWithCards(
            {
                title: object.title,
                description: object.description
            },
            object.cards
        );

        return { deckId };
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Failed to generate flashcards from document");
    }
}