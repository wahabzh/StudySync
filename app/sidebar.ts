"use server";

import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

import { Document } from "@/types/database";







export async function getDashboardData() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (!user) {
      return redirect("/sign-in");
    } else return user;
  }
  
  export async function getUserDocumentsLatestTenSideBar(userId: string) {
    const supabase = await createClient();
    
    let query = supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);
  
    // Filter documents to only include those owned or shared with the user
    query = query.or(`owner_id.eq.${userId}`);
  
    const { data: documents, error } = await query;
  
    if (error) {
      console.error("Error fetching latest ten documents:", error);
      return [] as Document[];
    }
    console.log(documents);
  
    return documents as Document[];
  }
  
  export async function getSharedDocumentsLatestTenSideBar(userId: string) {
    const supabase = await createClient();
    
    let query = supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);
  
    // Filter documents to only include those owned or shared with the user
    query = query.or(`editors.cs.{${userId}},viewers.cs.{${userId}}`);
  
    const { data: documents, error } = await query;
  
    if (error) {
      console.error("Error fetching latest ten documents:", error);
      return [] as Document[];
    }
    console.log(documents);
  
    return documents as Document[];
  }