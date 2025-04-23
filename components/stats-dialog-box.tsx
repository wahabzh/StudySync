"use client";

import { useEffect, useState } from "react";
import { Star, Trophy, Award, Flame, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProfileData } from "@/app/sidebar";
import { getLeaderBoardInfo } from "@/app/gamification";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
  streak: number;
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

// Function to get color based on league
function getLeagueColor(leagueName: string): string {
  switch (leagueName) {
    case "Platinum": return "bg-purple-500";
    case "Gold": return "bg-yellow-500";
    case "Silver": return "bg-gray-400";
    case "Bronze": return "bg-amber-700";
    default: return "bg-gray-500";
  }
}

// Function to get progress to next league
function getProgressToNextLeague(points: number): { progress: number, nextLeague: string, pointsNeeded: number } {
  if (points >= 15000) return { progress: 100, nextLeague: "Platinum", pointsNeeded: 0 };
  if (points >= 10000) return { progress: Math.min(((points - 10000) / 5000) * 100, 99), nextLeague: "Platinum", pointsNeeded: 15000 - points };
  if (points >= 5000) return { progress: Math.min(((points - 5000) / 5000) * 100, 99), nextLeague: "Gold", pointsNeeded: 10000 - points };
  return { progress: Math.min((points / 5000) * 100, 99), nextLeague: "Silver", pointsNeeded: 5000 - points };
}

export default function StatsDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [CurUser, setCurUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    username: "",
    points: 0,
    streak: 0,
    topPlayers: [],
    userRank: "N/A",
    userLeague: { name: "", symbol: "" },
  });
  const [activeTab, setActiveTab] = useState("stats");

  // Fetch user data
  useEffect(() => {
    getProfileData()
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
      setLoading(true);
      getLeaderBoardInfo().then((data) => {
        if (data) {
          setLeaderboardData({
            username: data.username || "",
            points: data.points || 0,
            streak: data.streak || 0,
            topPlayers: data.topPlayers || [],
            userRank: data.userRank || "N/A",
            userLeague: data.userLeague || { name: "", symbol: "" },
          });
        }
        setTimeout(() => setLoading(false), 500); // Small delay for better UX
      });
    }
  }, [open]);

  const { progress, nextLeague, pointsNeeded } = getProgressToNextLeague(leaderboardData.points);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Player Statistics
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stats" className="mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Your Stats</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 pt-4">
            {loading ? (
              <StatsSkeletonLoader />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {leaderboardData.username ? leaderboardData.username.substring(0, 2).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{leaderboardData.username}</h3>
                      <Badge 
                        className={`${getLeagueColor(leaderboardData.userLeague.name)} text-white`}
                      >
                        {leaderboardData.userLeague.symbol} {leaderboardData.userLeague.name} League
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Rank #{leaderboardData.userRank}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Total Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{leaderboardData.points.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Current Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-2xl font-bold">{leaderboardData.streak} days</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progress to {nextLeague}</span>
                      <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    {pointsNeeded > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {pointsNeeded.toLocaleString()} more points needed
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Top Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {loading ? (
                    <LeaderboardSkeletonLoader />
                  ) : leaderboardData.topPlayers.length > 0 ? (
                    leaderboardData.topPlayers.map((player, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-2 rounded-md ${
                          player.username === leaderboardData.username 
                            ? "bg-primary/10 font-medium" 
                            : index % 2 === 0 ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            index === 0 ? "bg-yellow-500" : 
                            index === 1 ? "bg-gray-400" : 
                            index === 2 ? "bg-amber-700" : "bg-muted"
                          } text-white font-bold`}>
                            {index + 1}
                          </div>
                          <span>{player.username}</span>
                          <Badge 
                            variant="outline" 
                            className={`${getLeagueColor(player.league.name)} text-white text-xs`}
                          >
                            {player.league.symbol}
                          </Badge>
                        </div>
                        <span className="font-medium">{player.points.toLocaleString()} pts</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Users className="h-6 w-6 mr-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No leaderboard data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!loading && leaderboardData.userRank !== "N/A" && (
              <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Your position</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{leaderboardData.userRank}</Badge>
                    <span className="font-medium">{leaderboardData.username}</span>
                  </div>
                  <span>{leaderboardData.points.toLocaleString()} pts</span>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="mt-4">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Skeleton loader for the stats tab
function StatsSkeletonLoader() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      <Skeleton className="h-[1px] w-full my-4" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 border rounded-lg p-4">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
        
        <div className="space-y-2 border rounded-lg p-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </>
  );
}

// Skeleton loader for the leaderboard tab
function LeaderboardSkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-md">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </>
  );
}
