// components/pomodoro/TimerDisplay.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerState, Settings } from "@/lib/pomodoro/types";
import { Progress } from "@/components/ui/progress";
import { Trophy, Check, Settings as SettingsIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PomodoroSettings } from "./pomodoro-settings";

interface TimerDisplayProps {
  timer: TimerState;
  settings: Settings;
  completedPomodoros: number;
  goalCompleted?: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  saveSettings?: (settings: Settings) => void;
}

export function TimerDisplay({
  timer,
  settings,
  completedPomodoros,
  goalCompleted = false,
  toggleTimer,
  resetTimer,
  saveSettings,
}: TimerDisplayProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage for timer
  const getProgressPercent = () => {
    const totalSeconds = settings[timer.mode] * 60;
    return ((totalSeconds - timer.timeLeft) / totalSeconds) * 100;
  };

  // Calculate goal progress percentage
  const getGoalProgressPercent = () => {
    if (!settings.userGoal || settings.userGoal <= 0) return 0;
    return Math.min((settings.progressOnCustom / settings.userGoal) * 100, 100);
  };

  // Get display text for current mode
  const getModeText = () => {
    if (timer.mode === "shortBreak") return "Short Break";
    if (timer.mode === "longBreak") return "Long Break";
    return "Focus";
  };

  // Set indicator color based on mode - updated to match app aesthetic
  const getModeColor = () => {
    if (timer.mode === "shortBreak") return "bg-teal-500 dark:bg-teal-600";
    if (timer.mode === "longBreak") return "bg-purple-500 dark:bg-purple-600";
    return "bg-primary dark:bg-primary";
  };

  // Get progress bar color based on mode
  const getProgressColor = () => {
    if (timer.mode === "shortBreak") return "bg-teal-500 dark:bg-teal-600";
    if (timer.mode === "longBreak") return "bg-purple-500 dark:bg-purple-600";
    return "";  // Use default primary color for Focus mode
  };

  return (
    <Card className="relative overflow-hidden border-2 transition-colors hover:border-primary/50">
      <div className={`absolute top-0 left-0 w-1 h-full ${getModeColor()}`} />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${getModeColor()}`} />
            <span className="text-xs font-medium capitalize">
              {getModeText()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {timer.mode === "pomodoro" && `${completedPomodoros}/${settings.longBreakInterval}`}
          </span>
        </div>

        {/* Timer Progress Bar */}
        <Progress
          value={getProgressPercent()}
          className={`h-1 mb-2 ${getProgressColor()}`}
        />

        {/* Timer Display */}
        <div className="mb-3 text-center">
          <span className="text-3xl font-bold tabular-nums">
            {formatTime(timer.timeLeft)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2 mb-3">
          <Button
            variant={timer.isRunning ? "destructive" : "default"}
            size="sm"
            onClick={toggleTimer}
            className="w-20"
            disabled={goalCompleted && timer.mode === "pomodoro"}
          >
            {timer.isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="w-20"
          >
            Reset
          </Button>
        </div>

        {/* Goal Display */}
        {settings.userGoal > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-xs">
                <Trophy className={`h-3 w-3 ${goalCompleted ? "text-amber-400" : ""}`} />
                <span>{goalCompleted ? "Goal Completed!" : "Goal Progress"}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {settings.progressOnCustom}/{settings.userGoal}
              </span>
            </div>
            <Progress
              value={getGoalProgressPercent()}
              className={`h-1 ${goalCompleted ? "bg-amber-400 dark:bg-amber-500" : ""}`}
            />

            {/* Show goal completed message and option to set new goal */}
            {goalCompleted && timer.mode === "pomodoro" && saveSettings && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="text-xs text-center flex items-center justify-center gap-1 text-green-500 dark:text-green-400">
                  <Check className="h-3 w-3" />
                  <span>Daily goal reached! Set a new goal to continue.</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-1 w-full text-xs">
                      <SettingsIcon className="mr-1 h-3 w-3" />
                      Set New Goal
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="right" align="start">
                    {saveSettings && (
                      <PomodoroSettings settings={settings} onSave={saveSettings} />
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
