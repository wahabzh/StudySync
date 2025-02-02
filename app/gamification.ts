"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { leaderBoardInfo } from "@/types/leaderBoardInfo";


function getLeague(points: number) {
  if (points >= 15000) return { name: "Platinum", symbol: "🏆" };
  if (points >= 10000) return { name: "Gold", symbol: "🥇" };
  if (points >= 5000) return { name: "Silver", symbol: "🥈" };
  return { name: "Bronze", symbol: "🥉" };
}

export async function getLeaderBoardInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch top 10 players sorted by points
  const { data: topPlayers, error: leaderboardError } = await supabase
    .from("profiles")
    .select("username, points")
    .order("points", { ascending: false }) // Highest points first
    .limit(10);

  if (leaderboardError) {
    console.error("Error fetching leaderboard:", leaderboardError);
    return null;
  }

  // Fetch ALL players sorted by points to determine rank
  const { data: allPlayers, error: rankError } = await supabase
    .from("profiles")
    .select("id")
    .order("points", { ascending: false });

  if (rankError) {
    console.error("Error fetching player rankings:", rankError);
    return null;
  }

  // Find user's rank by checking their index in the sorted list
  const userRank = allPlayers.findIndex(player => player.id === user.id) + 1; // 1-based index

  const { data: profile, error: docError } = await supabase
  .from("profiles") // Ensure the correct lowercase table name
  .select("username, points")
  .eq("id", user.id) // Filter where id = user.id
  .single(); // Ensure we get only one result

  const formattedTopPlayers = topPlayers.map(player => ({
    ...player,
    league: getLeague(player.points),
  }));

  console.log(topPlayers)

  return {
    topPlayers: formattedTopPlayers,
    userRank: userRank || "N/A",
    username: profile?.username || "Unknown",
    points: profile?.points || 0,
    userLeague: getLeague(profile?.points),
  };
}

export async function addPoints(points: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return { success: false, message: "User not authenticated" };
  }

  // Fetch the user's current points
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching user points:", fetchError);
    return { success: false, message: "Error fetching user points" };
  }

  const newPoints = (profile?.points || 0) + points; // Add new points

  // Update the points column for the user
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: newPoints })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating points:", updateError);
    return { success: false, message: "Error updating points" };
  }

  return { success: true, newPoints, message: "Points updated successfully" };
}

export async function checkDailyReward(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return false;
  }

  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("daily_goal, points")
    .eq("id", user.id)
    .single();

  if (fetchError || !data) {
    return false;
  }

  if (!data.daily_goal) {
    await supabase
      .from("profiles")
      .update({ daily_goal: true, points: data.points + 10 })
      .eq("id", user.id);
    return true;
  }

  return false;
}
