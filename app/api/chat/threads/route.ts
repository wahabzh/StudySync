import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all chat threads for the user, ordered by most recent first
        const { data: threads, error } = await supabase
            .from('chat_threads')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ threads });
    } catch (error) {
        console.error('Error getting chat threads:', error);
        return NextResponse.json({ error: 'Failed to get chat threads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, useGeneralKnowledge = false } = await req.json();

        // Create new chat thread
        const { data: thread, error } = await supabase
            .from('chat_threads')
            .insert({
                title: title || 'New Chat',
                owner_id: user.id,
                use_general_knowledge: useGeneralKnowledge
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ thread });
    } catch (error) {
        console.error('Error creating chat thread:', error);
        return NextResponse.json({ error: 'Failed to create chat thread' }, { status: 500 });
    }
} 