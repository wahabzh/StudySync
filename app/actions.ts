"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Document } from "@/types/database";
import { doc } from "prettier";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    // return { error: "Email and password are required" };
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/recover/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/recover/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/recover/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/recover/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/recover/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function createDocument(title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      title,
      content: {},
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    throw error;
  }

  return document.id;
}

export async function updateDocument(
  documentId: string,
  content: Record<string, any>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("documents")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("owner_id", user.id); // Ensure user owns the document

  if (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("owner_id", user.id); // Ensure user owns the document

  if (error) {
    console.error("Error deleting document:", error);
    throw error;
  }

  revalidatePath("/dashboard");
}

export async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  } else return user.id;
}

export async function getDocuments(
  userId: string,
  search: string,
  sort: string,
  filter: string
) {
  const supabase = await createClient();
  let query = supabase.from("documents").select("*");

  // Filter
  if (filter === "owned") query = query.eq("owner_id", userId);
  else if (filter === "shared")
    query = query.or(`editors.cs.{${userId}},viewers.cs.{${userId}}`);
  else query = query.eq("share_status", filter);

  // Search
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  // Sort
  if (sort === "created_desc")
    query = query.order("created_at", { ascending: false });
  else if (sort === "updated_desc")
    query = query.order("updated_at", { ascending: false });
  else query = query.order("title", { ascending: true });

  const { data: documents, error } = await query;
  
  console.log(userId, search, sort, filter);

  if (error) {
    console.error("Error fetching documents:", error);
    return [] as Document[];
  }

  return documents as Document[];
}
