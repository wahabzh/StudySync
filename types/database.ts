// This file defines TypeScript types for our Supabase database schema

export type DocumentStatus = "invite-only" | "anyone-with-link" | "published";

// Profile type represents a user profile in the 'profiles' table
export type Profile = {
  id: string; // Unique identifier for the profile
  display_name: string | null; // User's display name (optional)
  avatar_url: string | null; // URL to user's avatar image (optional)
  created_at: string; // Timestamp when profile was created
  updated_at: string; // Timestamp when profile was last updated
};

// Document type represents a document in the 'documents' table
export type Document = {
  id: string; // Unique identifier for the document
  title: string; // Document title
  content: Record<string, any>[]; // Document content stored as JSON
  owner_id: string; // Foreign key to profiles.id - owner of document
  created_at: string; // Timestamp when document was created
  updated_at: string; // Timestamp when document was last updated
  share_status: DocumentStatus;
  viewers: string[] | null;
  editors: string[] | null;
  is_published?: boolean; // for community features
};

// Database type defines the full database schema for type safety with Supabase
export type Database = {
  public: {
    Tables: {
      // Profiles table schema
      profiles: {
        Row: Profile; // Shape of profile rows
        Insert: Omit<Profile, "created_at" | "updated_at">; // Fields needed when inserting (timestamps auto-generated)
        Update: Partial<Omit<Profile, "id">>; // Fields that can be updated (can't change id)
      };
      // Documents table schema
      documents: {
        Row: Document; // Shape of document rows
        Insert: Omit<Document, "id" | "created_at" | "updated_at">; // Fields needed when inserting
        Update: Partial<Omit<Document, "id" | "owner_id">>; // Fields that can be updated
      };
    };
  };
};
