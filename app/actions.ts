"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient , createAdminClient} from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Document } from "@/types/database";
import { doc } from "prettier";
import { generateAndStoreDocumentEmbeddings } from "@/app/knowledge-base";

// Maximum file size in bytes (800KB)
const MAX_FILE_SIZE = 1000 * 1024;

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
      emailRedirectTo: `${origin}/sign-in`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-in",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data: authResult, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const user = authResult.user;

  if (user) {
    const { id, email } = user;

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existingProfile && !profileError) {
      await supabase.from("profiles").insert({ id, email });
    }
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
      content: [{}], // start with an empty array
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    throw error;
  }

  try {
    // Generate and store document embeddings
    await generateAndStoreDocumentEmbeddings(document);
  } catch (error) {
    console.error("Error generating and storing document embeddings:", error);
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
    .eq("id", documentId);

  if (error) {
    console.error("Error updating document:", error);
    throw error;
  }

  // Get the updated document
  const { data: updatedDocument, error: documentError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (documentError) {
    console.error("Error fetching updated document:", documentError);
  }

  try {
    // Generate and store document embeddings
    await generateAndStoreDocumentEmbeddings(updatedDocument);
  } catch (error) {
    console.error("Error generating and storing document embeddings:", error);
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

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "username, progress_on_custom, custom_user_goal, avatar_url, description"
      )
      .eq("id", user.id)
      .single();

    if (error || !profile) throw error;
    return {
      id: user.id,
      email: user.email,
      username: profile.username,
      avatar_url: profile.avatar_url,
      description: profile.description,
      custom_user_goal: profile?.custom_user_goal || 0,
      progress_on_custom: profile?.progress_on_custom || 0,
    };
  }
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
  if (userId === "0") query = query.eq("share_status", filter);
  else if (filter === "owned") query = query.eq("owner_id", userId);
  else if (filter === "shared")
    query = query.or(`editors.cs.{${userId}},viewers.cs.{${userId}}`);
  else query = query.eq("share_status", filter);

  // Search
  if (search) {
    query = query.ilike("title", `%${search}%`); // ilike is case-insensitive, like is case-sensitive
  }

  // Sort
  if (sort === "created_desc")
    query = query.order("created_at", { ascending: false });
  else if (sort === "updated_desc")
    query = query.order("updated_at", { ascending: false });
  else query = query.order("title", { ascending: true });

  const { data: documents, error } = await query;

  // console.log(userId, search, sort, filter);

  if (error) {
    console.error("Error fetching documents:", error);
    return [] as Document[];
  }

  return documents as Document[];
}

export async function savePomodoroGoal(userGoal: number) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return { success: false, message: "User not authenticated." };
  }

  // Optional: Validate the goal
  // const allowedGoals = [0, 3, 5, 7];
  // if (!allowedGoals.includes(userGoal)) {
  //   return { success: false, message: "Invalid goal selected." };
  // }
  // Prepare update data: if userGoal is 0, reset progress_on_custom to 0
  const updateData: Record<string, any> = { custom_user_goal: userGoal };
  if (userGoal === 0) {
    updateData.progress_on_custom = 0;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating custom_user_goal:", updateError);
    return { success: false, message: "Database update error." };
  }

  return { success: true, message: "Pomodoro goal saved successfully!" };
}

export const updateProfile = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return encodedRedirect(
    "error",
    "/",
    "User not authenticated"
  );

  const avatarFile = formData.get("avatar_file") as File;

  if (avatarFile && avatarFile.size > 0) {
    // Check file size
    if (avatarFile.size > MAX_FILE_SIZE) {
      return encodedRedirect(
        "error",
        "/dashboard/profile",
        `File size exceeds 800KB. Current size: ${(avatarFile.size / 1024).toFixed(2)}KB`
      );
    }

    const fileName = avatarFile.name.replace(/\s+/g, '');
    const filePath = `avatars/${user.id}.${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("Avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("Avatars").getPublicUrl(filePath);
    const avatar_url = data.publicUrl;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", user?.id);

    if (error) throw error;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: formData.get("username")?.toString(),
      email: formData.get("email")?.toString(),
      description: formData.get("description")?.toString(),
    })
    .eq("id", user?.id);

  if (error) throw error;

  if (formData.get("email")) {
    const { error: authError } = await supabase.auth.updateUser({
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString() || undefined,
    });
    if (authError) throw authError;
  }
};


export async function deleteAccount(password: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      console.error("User fetch error:", userError?.message);
      throw new Error("Not authenticated");
    }

    // Step 1: Re-authenticate using provided password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError) {
      console.error("Password verification failed:", authError.message);
      throw new Error("Incorrect password");
    }

    // Step 2: Delete profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Error deleting profile:", profileError.message);
      throw new Error("Failed to delete profile");
    }

    // Step 3: Delete user's documents
    const { error: docError } = await supabase
      .from("documents")
      .delete()
      .eq("owner_id", user.id);

    if (docError) {
      console.error("Error deleting documents:", docError.message);
      throw new Error("Failed to delete documents");
    }

  
    const { data: quizzes, error: quizFetchError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("owner_id", user.id);

    if (quizFetchError) {
      console.error("Error fetching user's quizzes:", quizFetchError.message);
      throw new Error("Failed to retrieve quizzes");
    }

    const quizIds = quizzes.map((q: { id: string }) => q.id);

    if (quizIds.length > 0) {
      const { error: questionDeleteError } = await supabase
        .from("quiz_questions")
        .delete()
        .in("quiz_id", quizIds);

      if (questionDeleteError) {
        console.error("Error deleting quiz questions:", questionDeleteError.message);
        throw new Error("Failed to delete quiz questions");
      }

      const { error: quizDeleteError } = await supabase
        .from("quizzes")
        .delete()
        .in("id", quizIds);

      if (quizDeleteError) {
        console.error("Error deleting quizzes:", quizDeleteError.message);
        throw new Error("Failed to delete quizzes");
      }
    }

    const { data: flashcardsdeck, error: flashcardsdeckFetchError } = await supabase
      .from("flashcard_decks")
      .select("id")
      .eq("owner_id", user.id);

    if (flashcardsdeckFetchError) {
      console.error("Error fetching user's flashcards:", flashcardsdeckFetchError.message);
      throw new Error("Failed to retrieve flashcards");
    }

    const flashcardIds = flashcardsdeck.map((q: { id: string }) => q.id);

    if (flashcardIds.length > 0) {
      const { error: questionDeleteError } = await supabase
        .from("flashcards")
        .delete()
        .in("deck_id", flashcardIds);

      if (questionDeleteError) {
        console.error("Error deleting quiz questions:", questionDeleteError.message);
        throw new Error("Failed to delete quiz questions");
      }

      const { error: flashcarddeckDeleteError } = await supabase
        .from("flashcard_decks")
        .delete()
        .in("id", flashcardIds);

      if (flashcarddeckDeleteError) {
        console.error("Error deleting Flashcard deck:", flashcarddeckDeleteError.message);
        throw new Error("Failed to delete flashcard deck");
      }
    }

    // Step 4: Delete user from auth using admin client
    const adminClient = await createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError.message);
      throw new Error("Failed to delete user from auth system");
    }

    console.log("Account deletion successful");
    return true;
  } catch (err: any) {
    console.error("Account deletion failed:", err.message || err);
    throw err;
  }
}

export async function renameDocument(documentId: string, title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate title
  if (!title.trim()) {
    throw new Error("Title cannot be empty");
  }

  const { error } = await supabase
    .from("documents")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) {
    console.error("Error renaming document:", error);
    throw error;
  }

  revalidatePath(`/dashboard/doc/${documentId}`);
  return { success: true };
}