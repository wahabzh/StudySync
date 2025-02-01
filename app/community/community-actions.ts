"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Document } from "@/types/database";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

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
    const { data: document, error } = await supabase.from("documents").select("*").eq("id", documentId).eq("share_status", "published").single();

    if (error) {
        console.error("Error fetching document:", error);
        return null;
    }


    return document as Document;
}