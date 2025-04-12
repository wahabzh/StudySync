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
  const userRank = allPlayers.findIndex((player) => player.id === user.id) + 1; // 1-based index

  const { data: profile, error: docError } = await supabase
    .from("profiles") // Ensure the correct lowercase table name
    .select("username, points, streak")
    .eq("id", user.id) // Filter where id = user.id
    .single(); // Ensure we get only one result

  const formattedTopPlayers = topPlayers.map((player) => ({
    ...player,
    league: getLeague(player.points),
  }));

  // console.log(topPlayers)

  return {
    topPlayers: formattedTopPlayers,
    userRank: userRank || "N/A",
    username: profile?.username || "Unknown",
    points: profile?.points || 0,
    streak: profile?.streak || 0,
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
  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("points, last_pomodoro, streak")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching user points:", fetchError);
    return { success: false, message: "Error fetching user points" };
  }

  const newPoints = (data.points || 0) + points; // Add new points

  const fetchedDate = new Date(data.last_pomodoro);
  const now = new Date();

  // Function to strip time and get only the date part
  const getDateWithoutTime = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Strip time from both dates
  const fetchedDateOnly = getDateWithoutTime(fetchedDate);
  const nowDateOnly = getDateWithoutTime(now);

  // Calculate the difference in milliseconds
  const diffInMilliseconds = nowDateOnly.getTime() - fetchedDateOnly.getTime();

  // Convert milliseconds to days
  const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
  console.log("Diff in days:", diffInDays);

  // For First Day
  if ((diffInDays === 0 && data.streak === 0) || null) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ streak: data.streak + 1 })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating points:", updateError);
      return { success: false, message: "Error updating points" };
    }
  }
  // for consecutive days
  else if (diffInDays >= 1 && diffInDays < 2) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ streak: data.streak + 1 })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating points:", updateError);
      return { success: false, message: "Error updating points" };
    }
  }
  // reset streak
  else if (diffInDays >= 2) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ streak: 0 })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating points:", updateError);
      return { success: false, message: "Error updating points" };
    }
  }

  // Update the points column for the user
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: newPoints, last_pomodoro: now })
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
    .select("points, loginRewardDateStamp")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching user points:", fetchError);
    return false;
  }

  // const new_account = user.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10);
  
  const lastRewardDate = data.loginRewardDateStamp
  ? new Date(data.loginRewardDateStamp).toISOString().slice(0, 10)
  : null;
  const todayDate = new Date().toISOString().slice(0, 10);
  const giveDailyReward = lastRewardDate !== todayDate;
  console.log(lastRewardDate)
  console.log(todayDate)
  const todayDateNew = new Date().toISOString()
  if (giveDailyReward) {  // error-handling?
    await supabase
      .from("profiles")
      .update({ points: data.points + 10, loginRewardDateStamp: todayDateNew  })
      .eq("id", user.id);
  }

  return giveDailyReward;
}

export async function updateCustomGoalProgress(goal: number) {
  const supabase = await createClient();

  // 1. Get the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return { success: false, message: "User not authenticated" };
  }

  // 2. Fetch the user's current data from 'profiles'
  // Make sure these columns match your actual table column names.
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("custom_user_goal, progress_on_custom, last_pomodoro, points")
    .eq("id", user.id)
    .single();

  if (fetchError || !profile) {
    console.error("Error fetching user goal data:", fetchError);
    return { success: false, message: "Error fetching user data" };
  }

  // const { custom_user_goal, progress_on_custom, last_pomodoro, points} = profile;

  // If there's no set custom goal or it's 0, reset progress
  if (!profile.custom_user_goal || profile.custom_user_goal <= 0) {
    await supabase
      .from("profiles")
      .update({ progress_on_custom: 0 })
      .eq("id", user.id);
    return { success: true, message: "No custom goal set, nothing to update." };
  }

  // 3. Calculate the difference in days since the last pomodoro
  const now = new Date();

  if (profile.last_pomodoro) {
    const fetchedDate = new Date(profile.last_pomodoro);

    // Helper to strip out the time portion
    const getDateWithoutTime = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const fetchedDateOnly = getDateWithoutTime(fetchedDate);
    const nowDateOnly = getDateWithoutTime(now);

    const diffInDays =
      (nowDateOnly.getTime() - fetchedDateOnly.getTime()) /
      (1000 * 60 * 60 * 24);
    console.log("Diff in days:", diffInDays);

    // For First Day
    if ((diffInDays === 0 && profile.progress_on_custom === 0) || null) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ progress_on_custom: profile.progress_on_custom + 1 })
        .eq("id", user.id);

      if (updateError) {
        console.error(
          "Error updating progress on custom user goal:",
          updateError
        );
        return { success: false, message: "Error updating user goal progress" };
      }
    }
    // for consecutive days
    else if (diffInDays >= 1 && diffInDays < 2) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ progress_on_custom: profile.progress_on_custom + 1 })
        .eq("id", user.id);

      if (updateError) {
        console.error(
          "Error updating progress on custom user goal:",
          updateError
        );
        return { success: false, message: "Error updating user goal progress" };
      }
    }

    // 4. Check if the user has reached or surpassed their custom goal
    // If yes, optionally reward them and reset their progress
    if (profile.progress_on_custom >= profile.custom_user_goal) {
      // Reset progress on custom
      const { error: resetError } = await supabase
        .from("profiles")
        .update({ progress_on_custom: 0 })
        .eq("id", user.id);

      // Decide how many points to award
      let rewardPoints = 0;
      switch (profile.custom_user_goal) {
        case 3:
          rewardPoints = 10; // e.g., 10 points for completing 3-day goal
          break;
        case 5:
          rewardPoints = 20; // 20 points for completing 5-day goal
          break;
        case 7:
          rewardPoints = 30; // 30 points for completing 7-day goal
          break;
        default:
          // If for some reason custom_user_goal is something else,
          // you could set a default reward or handle it differently
          rewardPoints = 0;
          break;
      }

      // Add the reward points to the user’s existing total
      // Make sure you have the user's current points from the DB as `data.points`
      const { error: rewardError } = await supabase
        .from("profiles")
        .update({
          points: (profile.points || 0) + rewardPoints,
        })
        .eq("id", user.id);

      if (rewardError) {
        console.error("Error granting custom goal reward:", rewardError);
        return { success: false, message: "Error updating reward points" };
      }

      console.log("User has achieved their custom goal!");
      // Return early if desired, or continue below
      return {
        success: true,
        message: "Custom goal completed! Reward granted.",
      };
    }
    // 5. Update the database with the new progress and the new last pomodoro
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        progress_on_custom: profile.progress_on_custom,
        last_pomodoro: now,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating custom goal progress:", updateError);
      return { success: false, message: "Error updating custom goal progress" };
    }
    const progress = profile.progress_on_custom;

    return {
      success: true,
      progress,
      message: "Custom goal progress updated successfully",
    };
  }
}
