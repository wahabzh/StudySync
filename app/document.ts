"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { DocumentStatus } from "@/types/database";

export async function updateDocumentStatus(
  documentId: string,
  newStatus: DocumentStatus
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify user has permission to update document
  const { data: document } = await supabase
    .from("documents")
    .select("owner_id, editors")
    .eq("id", documentId)
    .single();

  if (!document) throw new Error("Document not found");
  if (document.owner_id !== user.id && !document.editors?.includes(user.id)) {
    throw new Error("Unauthorized");
  }

  // Update document status
  const { error } = await supabase
    .from("documents")
    .update({ status: newStatus })
    .eq("id", documentId);

  if (error) throw error;

  revalidatePath(`/dashboard/doc/${documentId}`);
}

export async function updateCollaborator(
  documentId: string,
  userId: string,
  newRole: "viewer" | "editor"
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify user has permission to update document
  const { data: document } = await supabase
    .from("documents")
    .select("owner_id, editors, viewers")
    .eq("id", documentId)
    .single();

  if (!document) throw new Error("Document not found");
  if (document.owner_id !== user.id) {
    throw new Error("Only the owner can modify collaborator permissions");
  }

  // Remove from both arrays first
  const newEditors = (document.editors || []).filter(
    (id: string) => id !== userId
  );
  const newViewers = (document.viewers || []).filter(
    (id: string) => id !== userId
  );

  // Add to appropriate array
  if (newRole === "editor") {
    newEditors.push(userId);
  } else {
    newViewers.push(userId);
  }

  // Update document
  const { error } = await supabase
    .from("documents")
    .update({
      editors: newEditors,
      viewers: newViewers,
    })
    .eq("id", documentId);

  if (error) throw error;

  revalidatePath(`/dashboard/doc/${documentId}`);
}

export async function removeCollaborator(documentId: string, userId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify user has permission to update document
  const { data: document } = await supabase
    .from("documents")
    .select("owner_id, editors, viewers")
    .eq("id", documentId)
    .single();

  if (!document) throw new Error("Document not found");
  if (document.owner_id !== user.id) {
    throw new Error("Only the owner can remove collaborators");
  }

  // Remove from both arrays
  const newEditors = (document.editors || []).filter(
    (id: string) => id !== userId
  );
  const newViewers = (document.viewers || []).filter(
    (id: string) => id !== userId
  );

  // Update document
  const { error } = await supabase
    .from("documents")
    .update({
      editors: newEditors,
      viewers: newViewers,
    })
    .eq("id", documentId);

  if (error) throw error;

  revalidatePath(`/dashboard/doc/${documentId}`);
}

export async function inviteUser(
  documentId: string,
  email: string,
  role: "viewer" | "editor"
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Find user by email using RPC
  let invited_id;
  try {
    const { data, error } = await supabase.rpc("get_id_from_auth_users", {
      user_email: email,
    });

    console.log("data", data); // data [ { id: '8d2c2458-d896-4d10-9ac3-1fccf9eea989' } ]
    console.log("error", error);

    if (error) throw error;
    if (!data || !data[0]?.id) throw new Error("User not found");

    invited_id = data[0].id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    throw new Error("User not found");
  }

  // Get current document
  const { data: document } = await supabase
    .from("documents")
    .select("owner_id, editors, viewers")
    .eq("id", documentId)
    .single();

  if (!document) throw new Error("Document not found");
  if (document.owner_id !== user.id && !document.editors?.includes(user.id)) {
    throw new Error("Unauthorized");
  }

  // Update appropriate array
  const newEditors = [...(document.editors || [])];
  const newViewers = [...(document.viewers || [])];

  if (role === "editor") {
    if (!newEditors.includes(invited_id)) {
      newEditors.push(invited_id);
    }
  } else {
    if (!newViewers.includes(invited_id)) {
      newViewers.push(invited_id);
    }
  }

  // Update document
  const { error } = await supabase
    .from("documents")
    .update({
      editors: newEditors,
      viewers: newViewers,
    })
    .eq("id", documentId);

  if (error) throw error;

  revalidatePath(`/dashboard/doc/${documentId}`);
}
