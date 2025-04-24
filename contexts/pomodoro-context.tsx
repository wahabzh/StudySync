"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePomodoro } from "@/lib/pomodoro/hooks/use-pomodoro";
import { Goal } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

// Default settings for the Pomodoro timer
const initialSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  userGoal: 0,
  progressOnCustom: 0,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

type PomodoroContextType = ReturnType<typeof usePomodoro>;

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // Initialize usePomodoro with initial settings
  // The hook will handle loading from localStorage and syncing with server
  const pomodoroState = usePomodoro(initialSettings);

  return (
    <PomodoroContext.Provider value={pomodoroState}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoroContext must be used within a PomodoroProvider");
  }
  return context;
}


