// app/api/chat/route.ts
import { createClient } from "@/utils/supabase/server";
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, useGeneralKnowledge } = await req.json();
        const latestMessage = messages[messages.length - 1].content;

        // Generate embedding for the query
        const model = google.textEmbeddingModel('text-embedding-004');
        const { embedding } = await embed({
            model,
            value: latestMessage,
        });

        // Retrieve relevant documents using similarity search with a lower threshold
        const { data: documentData } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.3, // Lower threshold to catch more matches
            match_count: 5, // Increased from 3 to 5
            user_id: user.id
        });

        // Retrieve relevant flashcards
        const { data: flashcardData } = await supabase.rpc('match_flashcard_decks', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 5,
            user_id: user.id
        });

        // Retrieve relevant quiz questions
        const { data: quizData } = await supabase.rpc('match_quizzes', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 5,
            user_id: user.id
        });

        // Combine all relevant context
        const contextItems = [
            ...(documentData || []).map((item: any) => item.content),
            ...(flashcardData || []).map((item: any) => item.content),
            ...(quizData || []).map((item: any) => item.content)
        ];

        const context = contextItems.join('\n\n');
        const hasContext = contextItems.length > 0;
        const shouldUseGeneralKnowledge = useGeneralKnowledge === true || !hasContext;

        console.log("shouldUseGeneralKnowledge", shouldUseGeneralKnowledge);
        
        // Generate response using AI with or without context
        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: `You are StudySync's Knowledge Base Assistant, a helpful AI that assists students with their study materials and learning.
        
${shouldUseGeneralKnowledge ? 
    "You are allowed to use your general knowledge to answer questions beyond the user's own materials." : 
    "Only use information from the user's own study materials to answer questions."}

${hasContext ? `I found relevant information in your study materials that might help answer your question. I'll use this to give you a specific answer.` :
            `I don't have any specific notes or materials from you that match this question. ${!shouldUseGeneralKnowledge ? "I can only answer questions based on your uploaded materials." : "I'll provide a general answer based on my knowledge."}`}

${hasContext ? `Guidelines when answering with context:
- ${!shouldUseGeneralKnowledge ? "Use ONLY" : "Primarily use"} the information provided in the context below to answer the user's question
- If the context doesn't fully answer the question, ${shouldUseGeneralKnowledge ? "supplement with general knowledge" : "say so clearly"}
- For flashcards and quiz questions, explain the answers thoroughly
- Format your response nicely with markdown, including headings, lists, and emphasis where appropriate
- Use code blocks with syntax highlighting when showing code examples

Here is the context from the user's study materials:

${context}` :
            `Guidelines when answering general questions:
- ${shouldUseGeneralKnowledge ? "Provide accurate, educational information" : "Politely explain that you can only answer questions about their uploaded materials"}
- Format your response nicely with markdown, including headings, lists, and emphasis where appropriate
- Use code blocks with syntax highlighting when showing code examples
- ${shouldUseGeneralKnowledge ? "Always mention that this is general knowledge, not from their specific materials" : ""}
- Encourage them to add their own notes on this topic to StudySync`}`,
            messages: messages,
            temperature: 0.7, // Slightly higher temperature for more creative responses
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response('Error processing your request', { status: 500 });
    }
}