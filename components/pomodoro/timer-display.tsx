// components/pomodoro/TimerDisplay.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerState, Settings } from "@/lib/pomodoro/types";

interface TimerDisplayProps {
  timer: TimerState;
  settings: Settings;
  completedPomodoros: number;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export function TimerDisplay({
  timer,
  settings,
  completedPomodoros,
  toggleTimer,
  resetTimer,
}: TimerDisplayProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const getProgressPercent = () => {
    const totalSeconds = settings[timer.mode] * 60;
    return ((totalSeconds - timer.timeLeft) / totalSeconds) * 100;
  };

  return (
    <Card className="relative overflow-hidden border-2 transition-colors hover:border-primary/50">
      <div
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all"
        style={{ width: `${getProgressPercent()}%` }}
      />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium capitalize">
            {timer.mode === "shortBreak"
              ? "Short Break"
              : timer.mode === "longBreak"
                ? "Long Break"
                : "Focus"}
          </span>
          <span className="text-xs text-muted-foreground">
            {completedPomodoros}/{settings.longBreakInterval} pomodoros
          </span>
        </div>
        <div className="mb-4 text-center">
          <span className="text-3xl font-bold tabular-nums">
            {formatTime(timer.timeLeft)}
          </span>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTimer}
            className="w-20"
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
      </div>
    </Card>
  );
}
