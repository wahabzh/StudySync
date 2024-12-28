import { Document } from "@/types/database";

export type AccessLevel = "none" | "view" | "edit" | "owner";

export function getUserAccessLevel(
  document: Document,
  userId: string | undefined
): AccessLevel {
  if (!userId) return "none";
  if (document.owner_id === userId) return "owner";
  if (document.editors?.includes(userId)) return "edit";
  if (document.viewers?.includes(userId)) return "view";
  if (document.share_status === "anyone-with-link") return "view";
  return "none";
}

export function canEditDocument(
  document: Document,
  userId: string | undefined
): boolean {
  const access = getUserAccessLevel(document, userId);
  return access === "owner" || access === "edit";
}

export function canViewDocument(
  document: Document,
  userId: string | undefined
): boolean {
  const access = getUserAccessLevel(document, userId);
  return access !== "none";
}
