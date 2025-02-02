"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Document } from "@/types/database";

export async function getCommunityDocuments(
    search: string,
    sort: string,
) {
    const supabase = await createClient();
    let query = supabase.from("documents").select("*").eq("share_status", "published");

    // search
    if (search) {
        query = query.ilike("title", `%${search}%`);
    }

    // sort
    if (sort === "created_desc")
        query = query.order("created_at", { ascending: false });
    else if (sort === "updated_desc")
        query = query.order("updated_at", { ascending: false });
    else query = query.order("title", { ascending: true });

    const { data: documents, error } = await query;

    if (error) {
        console.error("Error fetching documents:", error);
        return [] as Document[];
    }

    return documents as Document[];
}

export async function getCommunityDocument(documentId: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("share_status", "published");

    // Only check for claps if user is logged in
    if (user) {
        query = supabase
            .from("documents")
            .select(`
                *,
                document_claps!left (
                    user_id
                )
            `)
            .eq("id", documentId)
            .eq("share_status", "published")
            .eq("document_claps.user_id", user.id);
    }

    const { data: document, error } = await query.single();

    if (error) {
        console.error("Error fetching document:", error);
        return null;
    }

    return {
        ...document,
        has_clapped: document.has_clapped?.length > 0
    } as Document & { has_clapped: boolean };
}

export async function toggleDocumentClap(documentId: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Must be logged in to clap" };
    }

    // Check if user has already clapped
    const { data: existingClap } = await supabase
        .from("document_claps")
        .select()
        .eq("document_id", documentId)
        .eq("user_id", user.id)
        .single();

    if (existingClap) {
        // Remove clap
        const { error: deleteError } = await supabase
            .from("document_claps")
            .delete()
            .eq("document_id", documentId)
            .eq("user_id", user.id);

        if (deleteError) return { error: "Failed to remove clap" };
    } else {
        // Add clap
        const { error: insertError } = await supabase
            .from("document_claps")
            .insert({ document_id: documentId, user_id: user.id });

        if (insertError) return { error: "Failed to add clap" };
    }

    // Update clap count
    const { count } = await supabase
        .from("document_claps")
        .select("*", { count: "exact" })
        .eq("document_id", documentId);

    // Update document with new clap count
    await supabase
        .from("documents")
        .update({ clap_count: count })
        .eq("id", documentId);

    revalidatePath(`/community/doc/${documentId}`);
    return { success: true, clapCount: count };
}