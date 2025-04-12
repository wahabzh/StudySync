import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all chat threads for the user (will cascade to messages)
        const { error } = await supabase
            .from('chat_threads')
            .delete()
            .eq('owner_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting all threads:', error);
        return NextResponse.json({ error: 'Failed to delete all chat threads' }, { status: 500 });
    }
} 