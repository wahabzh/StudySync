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

        const { messages } = await req.json();
        const latestMessage = messages[messages.length - 1].content;

        // Generate embedding for the query
        const model = google.textEmbeddingModel('text-embedding-004');
        const { embedding } = await embed({
            model,
            value: latestMessage,
        });

        // Retrieve relevant documents using similarity search
        const { data: documentData } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 3,
            user_id: user.id
        });

        // Retrieve relevant flashcards
        const { data: flashcardData } = await supabase.rpc('match_flashcard_decks', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 3,
            user_id: user.id
        });

        // Retrieve relevant quiz questions
        const { data: quizData } = await supabase.rpc('match_quizzes', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 3,
            user_id: user.id
        });

        // Combine all relevant context
        const context = [
            ...(documentData || []).map((item: any) => item.content),
            ...(flashcardData || []).map((item: any) => item.content),
            ...(quizData || []).map((item: any) => item.content)
        ].join('\n\n');

        console.log(context);

        // Generate response using AI with context
        const result = await streamText({
            model: google('gemini-1.5-flash-latest'),
            system: `You are StudySync's Knowledge Base Assistant, a helpful AI that assists students with their study materials. 
      Answer questions based on the user's study materials, which include documents, flashcards, and quizzes.
      Only use the provided context to answer questions. If the answer is not in the context, say that you don't have enough information.
      Here is the context from the user's study materials:
      
      ${context}`,
            messages: messages,
        });
        console.log("hehe")
        console.log(context);

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response('Error processing your request', { status: 500 });
    }
}