"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { DocumentStatus } from "@/types/database";
import { Resend } from "resend";
import { InviteEmailTemplate } from "@/components/email-templates/collab-invite";
import { CollaboratorInfo } from "@/types/collaborator";
import { getUserAccessLevel } from "@/utils/permissions";
import { convertBlocksToMarkdown } from "@/utils/blockNoteConverter";

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
    .update({ share_status: newStatus })
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: document } = await supabase
    .from("documents")
    .select("owner_id, editors, viewers")
    .eq("id", documentId)
    .single();

  if (!document) throw new Error("Document not found");

  // Only owners can modify permissions
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
  if (document.owner_id === invited_id) {
    throw new Error("You cannot invite the owner");
  }
  if (document.owner_id !== user.id && !document.editors?.includes(user.id)) {
    throw new Error("Unauthorized");
  }

  // Check if user is already a collaborator
  if (document.editors?.includes(invited_id)) {
    throw new Error("User is already an editor");
  }
  if (document.viewers?.includes(invited_id)) {
    throw new Error("User is already a viewer");
  }

  // Send email
  const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: "Team Study Sync <no-reply@studysync.site>",
      to: [email],
      subject: "You've been invited to collaborate on a document!",
      react: InviteEmailTemplate({
        documentLink: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/doc/${documentId}`,
        role: role,
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }

  // Update appropriate array
  const newEditors = [...(document.editors || [])];
  const newViewers = [...(document.viewers || [])];

  if (role === "editor") {
    newEditors.push(invited_id);
  } else {
    newViewers.push(invited_id);
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

export async function getDocumentWithCollaborators(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch document
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return null;
  }

  // Check user's access level
  const accessLevel = getUserAccessLevel(document, user.id);
  if (accessLevel === "none") {
    return null;
  }

  const { data, error } = await supabase.rpc(
    "get_all_email_and_ids_from_auth_users"
  );

  if (error) throw error;
  if (!data || !data[0]?.id)
    throw new Error("Error fetching user details from DB");

  //  for user ids in viewers, get corresponding email from data, and then add email and id to viewerInfo
  let viewerInfo: CollaboratorInfo[] = [];
  for (const viewerId of document.viewers || []) {
    const viewer = data.find((user: any) => user.id === viewerId);
    if (viewer) {
      viewerInfo.push({ id: viewer.id, email: viewer.email });
    }
  }

  //  for user ids in editors, get corresponding email from data, and then add email and id to editorInfo
  let editorInfo: CollaboratorInfo[] = [];
  for (const editorId of document.editors || []) {
    const editor = data.find((user: any) => user.id === editorId);
    if (editor) {
      editorInfo.push({ id: editor.id, email: editor.email });
    }
  }

  return {
    document,
    viewerInfo,
    editorInfo,
    userAccess: accessLevel,
  };
}

export async function uploadImage(formData: FormData) {
  //"use server";

  // Get user from Supabase auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const file = formData.get("image") as File;
  if (!file) {
    return { error: "No file uploaded" };
  }

  try {
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    // Convert File to Blob for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: file.type });

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("File Uploads") // Change this to your actual bucket name
      .upload(fileName, fileBlob, { upsert: true });
    console.log(data);
    if (error) throw error;

    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from("File Uploads")
      .getPublicUrl(fileName);

    if (!publicUrl.publicUrl) {
      throw new Error("Failed to get public URL.");
    }

    // Revalidate cache if needed
    //revalidatePath("/");  

    return { url: publicUrl.publicUrl };
  } catch (error) {
    console.error("Upload failed:", error);
    return { error: "Image upload failed. Please try again." };
  }
}

/**
 * Get the content of a document as plain text
 */
export async function getDocumentContentById(documentId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the document
  const { data: document, error } = await supabase
    .from("documents")
    .select("content")
    .eq("id", documentId)
    .single();

  if (error) {
    console.error("Error fetching document content:", error);
    throw error;
  }

  // // Parse the JSON content
  // let parsedContent;
  // try {
  //   parsedContent = JSON.parse(document?.content || '[]');
  // } catch (e) {
  //   console.error("Error parsing document content:", e);
  //   return "";
  // }

  // Convert to markdown 
  return convertBlocksToMarkdown(document?.content || []);
}