'use server'

import { ImageAnnotatorClient } from '@google-cloud/vision';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


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