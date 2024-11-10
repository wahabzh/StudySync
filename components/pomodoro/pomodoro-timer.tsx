// components/pomodoro/PomodoroTimer.tsx
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
import { usePomodoro } from "@/lib/pomodoro/hooks/use-pomodoro";

const initialSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export function PomodoroTimer() {
  const {
    settings,
    timer,
    completedPomodoros,
    toggleTimer,
    resetTimer,
    saveSettings,
  } = usePomodoro(initialSettings);

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
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
