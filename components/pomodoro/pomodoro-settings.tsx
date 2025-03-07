// components/pomodoro/PomodoroSettings.tsx
import React, { useState, useEffect } from "react";
import { Settings } from "@/lib/pomodoro/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { savePomodoroGoal} from "@/app/actions";
import { getUser } from "@/app/actions";

const defaultSettings: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  userGoal: 0,
  progressOnCustom: 0,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

interface PomodoroSettingsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function getSettings(): Settings {
  const saved = localStorage.getItem("pomodoroSettings");
  if (saved && saved !== "undefined") {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing pomodoroSettings from localStorage:", error);
    }
  }
  return defaultSettings;
}

export function PomodoroSettings({ settings, onSave }: PomodoroSettingsProps) {
  // Initialize state from localStorage if available; otherwise, use the passed-in settings.
  const [localSettings, setLocalSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("pomodoroSettings");
    return saved ? JSON.parse(saved) : settings;
  });

  const handleSave = async () => {
    const newGoal = localSettings.userGoal; // updated from front end
    const userResult = await getUser();

      // If newGoal is 0, show a confirmation popup.
      if (newGoal !== userResult.custom_user_goal) {
        const confirmSave = window.confirm(
          "Are you sure you want to save settings? This will reset your current progress."
        );
        if (!confirmSave) return; // If user cancels, exit without saving.
      }

    let updatedSettings = { ...localSettings };

    try {
      // Save the user's goal to the server (if newGoal is null, treat it as 0).
      const result = await savePomodoroGoal(newGoal ?? 0);
      if (!result.success) {
        console.error(`Error saving goal: ${result.message}`);
      } else {
        // After saving the goal, fetch the updated profile to get the latest progress.
        const userResult = await getUser();
        // Assuming getUser returns an object that includes progress_on_custom
        if (userResult && typeof userResult.progress_on_custom !== "undefined") {
          updatedSettings.progressOnCustom = userResult.progress_on_custom;
        }
      }
    } catch (error) {
      console.error(`Exception saving goal: ${error}`);
    }
        
    // Update the custom_user_goal in our local settings.
    updatedSettings.userGoal = newGoal ?? 0;
    
    // Persist the updated settings object to localStorage.
    localStorage.setItem("pomodoroSettings", JSON.stringify(updatedSettings));
    // Update local state.
    setLocalSettings(updatedSettings);
    // Notify parent components that settings have been saved.
    onSave(updatedSettings);
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Timer Settings</h4>
        <p className="text-sm text-muted-foreground">
          Configure your pomodoro timer preferences.
        </p>
      </div>
      <div className="grid gap-2">
        {/* Pomodoro Duration Slider */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Pomodoro</label>
            <span className="text-sm text-muted-foreground">
              {localSettings.pomodoro} min
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.pomodoro]}
            min={0.1}
            max={60}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, pomodoro: value }))
            }
          />
        </div>
        {/* Short Break Slider */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Short Break</label>
            <span className="text-sm text-muted-foreground">
              {localSettings.shortBreak} min
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.shortBreak]}
            min={0.1}
            max={15}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, shortBreak: value }))
            }
          />
        </div>
        {/* Long Break Slider */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">Long Break</label>
            <span className="text-sm text-muted-foreground">
              {localSettings.longBreak} min
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.longBreak]}
            min={0.1}
            max={30}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, longBreak: value }))
            }
          />
        </div>
        <Separator />
        {/* Auto-start Breaks Switch */}
        <div className="flex items-center justify-between">
          <label htmlFor="auto-breaks" className="text-sm font-medium leading-none">
            Auto-start Breaks
          </label>
          <Switch
            className="scale-75"
            id="auto-breaks"
            checked={localSettings.autoStartBreaks}
            onCheckedChange={(checked) =>
              setLocalSettings((prev) => ({ ...prev, autoStartBreaks: checked }))
            }
          />
        </div>
        {/* Auto-start Pomodoros Switch */}
        <div className="flex items-center justify-between">
          <label htmlFor="auto-pomodoros" className="text-sm font-medium leading-none">
            Auto-start Pomodoros
          </label>
          <Switch
            className="scale-75"
            id="auto-pomodoros"
            checked={localSettings.autoStartPomodoros}
            onCheckedChange={(checked) =>
              setLocalSettings((prev) => ({ ...prev, autoStartPomodoros: checked }))
            }
          />
        </div>
        {/* Long Break Interval Slider */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">
              Long Break Interval
            </label>
            <span className="text-sm text-muted-foreground">
              {localSettings.longBreakInterval} pomodoros
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.longBreakInterval]}
            min={1}
            max={8}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, longBreakInterval: value }))
            }
          />
        </div>
        {/* User Goal Selector */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">User Goal</label>
            <span className="text-sm text-muted-foreground">
              {localSettings.userGoal === null
                ? "No goal selected"
                : `${localSettings.userGoal} pomodoros`}
            </span>
          </div>
          <div className="flex justify-around gap-2">
            {[1, 2, 3].map((goal) => {
              const isSelected = localSettings.userGoal === goal;
              return (
                <Button
                  key={goal}
                  onClick={() =>
                    setLocalSettings((prev) =>
                      prev.userGoal === goal
                        ? { ...prev, userGoal: null }
                        : { ...prev, userGoal: goal }
                    )
                  }
                  className={
                    isSelected
                      ? "bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground rounded-full w-12 h-12"
                  }
                >
                  {goal}
                </Button>
              );
            })}
          </div>
        </div>
        {/* Save Settings Button */}
        <Button className="w-full mt-2" variant="outline" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
