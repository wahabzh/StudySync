"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDashboardData } from "@/app/actions";
import { getLeaderBoardInfo } from "@/app/gamification";
import { User } from "@supabase/supabase-js";

// Define types explicitly
type League = {
  name: string;
  symbol: string;
};

type Player = {
  username: string;
  points: number;
  league: League;
};

type LeaderboardData = {
  username: string;
  points: number;
  topPlayers: Player[];
  userRank: string | number;
  userLeague: League;
};

// Function to assign league based on points
function getLeague(points: number): League {
  if (points >= 15000) return { name: "Platinum", symbol: "🏆" };
  if (points >= 10000) return { name: "Gold", symbol: "🥇" };
  if (points >= 5000) return { name: "Silver", symbol: "🥈" };
  return { name: "Bronze", symbol: "🥉" };
}

export default function StatsDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [CurUser, setCurUser] = useState<User | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    username: "",
    points: 0,
    topPlayers: [],
    userRank: "N/A",
    userLeague: { name: "", symbol: "" },
  });

  // Fetch user data
  useEffect(() => {
    getDashboardData()
      .then((data) => {
        if (data) setCurUser(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  // Fetch leaderboard data when the dialog opens
  useEffect(() => {
    if (open) {
      getLeaderBoardInfo().then((data) => {
        if (data) {
          setLeaderboardData({
            username: data.username || "",
            points: data.points || 0,
            topPlayers: data.topPlayers || [],
            userRank: data.userRank || "N/A",
            userLeague: data.userLeague || { name: "", symbol: "" },
          });
        }
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Star className="mr-2 h-4 w-4" />
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Statistics</DialogTitle>
        </DialogHeader>

        {/* User's stats */}
        <div className="mt-4">
          <p>
            <strong>Username:</strong> {leaderboardData.username || "Loading..."}
          </p>
          <p>
            <strong>Points:</strong> {leaderboardData.points ?? "Loading..."}
          </p>
          <p>
            <strong>League:</strong> {leaderboardData.userLeague.symbol}{" "}
            {leaderboardData.userLeague.name}
          </p>
        </div>

        {/* Leaderboard */}
        <div className="mt-6">
          <h3 className="text-lg font-bold">Leaderboard (Top 10)</h3>
          <ul className="mt-2">
            {leaderboardData.topPlayers.length > 0 ? (
              leaderboardData.topPlayers.map((player, index) => (
                <li key={index} className="flex justify-between border-b py-1">
                  <span>
                    {index + 1}. {player.username} {player.league.symbol}
                  </span>
                  <span>{player.points} pts</span>
                </li>
              ))
            ) : (
              <p>Loading...</p>
            )}
          </ul>
        </div>

        {/* Current User Standing */}
        <div className="mt-4">
          <h3 className="text-lg font-bold">Your Standing</h3>
          <p>
            <strong>Rank:</strong> {leaderboardData.userRank}
          </p>
          <p>
            <strong>Points:</strong> {leaderboardData.points}
          </p>
          <p>
            <strong>League:</strong> {leaderboardData.userLeague.symbol}{" "}
            {leaderboardData.userLeague.name}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
