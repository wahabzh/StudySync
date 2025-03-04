import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success" | null,
  path: string,
  message: string,
) {
  if (type==null) return redirect(`${path}`)
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function getRandomColor(){
  const colors = [
    "#333333", // Dark Gray
    "#4A4A4A", // Charcoal
    "#001F3F", // Navy Blue
    "#2C003E", // Deep Purple
    "#014421", // Forest Green
    "#5C0000", // Burgundy
    "#4169E1", // Royal Blue
    "#008080", // Teal
    "#005F5F", // Dark Cyan
    "#DC143C", // Crimson
    "#FF8C00", // Dark Orange
    "#8B008B", // Dark Magenta
    "#FF1493", // Deep Pink
    "#C71585", // Medium Violet Red
    "#4B0082", // Indigo
    "#556B2F", // Olive Drab
    "#6A5ACD", // Slate Blue
    "#2F4F4F", // Slate Gray
    "#4682B4", // Steel Blue
    "#556B2F", // Dark Olive Green
    "#5F9EA0", // Cadet Blue
    "#2E2E2E", // Dark Slate Gray
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

export function generateToken(docId: string){
  const data = { allowedDocumentNames: [docId] };
  const token = jwt.sign(data, `${process.env.NEXT_PUBLIC_TIPTAP_APP_SECRET}`);
  return token;
};