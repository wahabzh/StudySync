import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the thread and verify ownership
        const { data: thread, error: threadError } = await supabase
            .from('chat_threads')
            .select('*')
            .eq('id', params.threadId)
            .eq('owner_id', user.id)
            .single();

        if (threadError) {
            return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 404 });
        }

        // Get all messages for this thread
        const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('thread_id', params.threadId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            return NextResponse.json({ error: messagesError.message }, { status: 500 });
        }

        return NextResponse.json({ thread, messages });
    } catch (error) {
        console.error('Error getting thread:', error);
        return NextResponse.json({ error: 'Failed to get thread' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, useGeneralKnowledge } = await req.json();

        // Verify ownership before updating
        const { data: existingThread, error: verifyError } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('id', params.threadId)
            .eq('owner_id', user.id)
            .single();

        if (verifyError) {
            return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 404 });
        }

        // Update the thread
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (useGeneralKnowledge !== undefined) updates.use_general_knowledge = useGeneralKnowledge;

        const { data, error } = await supabase
            .from('chat_threads')
            .update(updates)
            .eq('id', params.threadId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ thread: data });
    } catch (error) {
        console.error('Error updating thread:', error);
        return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership before deleting
        const { data: existingThread, error: verifyError } = await supabase
            .from('chat_threads')
            .select('id')
            .eq('id', params.threadId)
            .eq('owner_id', user.id)
            .single();

        if (verifyError) {
            return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 404 });
        }

        // Delete the thread (will cascade to messages due to foreign key constraint)
        const { error } = await supabase
            .from('chat_threads')
            .delete()
            .eq('id', params.threadId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting thread:', error);
        return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
    }
} 