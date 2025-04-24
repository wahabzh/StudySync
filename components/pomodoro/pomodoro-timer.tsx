// components/pomodoro/PomodoroTimer.tsx
"use client";

import React from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { TimerDisplay } from "./timer-display";
import { PomodoroSettings } from "./pomodoro-settings";
import { usePomodoroContext } from "@/contexts/pomodoro-context";

export function PomodoroTimer() {
  const {
    settings,
    timer,
    completedPomodoros,
    goalCompleted,
    toggleTimer,
    resetTimer,
    saveSettings,
  } = usePomodoroContext();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Pomodoro Timer</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-transparent"
            >
              <Settings2 className="h-3 w-3" />
              <span className="sr-only">Timer settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            side="right"
            align="start"
            alignOffset={-8}
          >
            <PomodoroSettings settings={settings} onSave={saveSettings} />
          </PopoverContent>
        </Popover>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <TimerDisplay
          timer={timer}
          settings={settings}
          completedPomodoros={completedPomodoros}
          goalCompleted={goalCompleted}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          saveSettings={saveSettings}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
