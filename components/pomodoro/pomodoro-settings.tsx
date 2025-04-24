// components/pomodoro/PomodoroSettings.tsx
import React, { useState, useEffect } from "react";
import { Settings } from "@/lib/pomodoro/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { savePomodoroGoal } from "@/app/actions";
import { getUser } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Trophy, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  // Initialize state from provided settings
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [customGoal, setCustomGoal] = useState<string>(localSettings.userGoal > 0 ? localSettings.userGoal.toString() : "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Update local settings when provided settings change
  useEffect(() => {
    setLocalSettings(settings);
    setCustomGoal(settings.userGoal > 0 ? settings.userGoal.toString() : "");
  }, [settings]);

  // Fetch the user's current progress on load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUser();
        if (userData && typeof userData.progress_on_custom !== 'undefined') {
          setCurrentProgress(userData.progress_on_custom);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only positive numbers
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomGoal(value);

      // Update local settings with the new goal
      if (value === "") {
        setLocalSettings(prev => ({ ...prev, userGoal: 0 }));
      } else {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue) && numericValue >= 0) {
          setLocalSettings(prev => ({ ...prev, userGoal: numericValue }));
        }
      }
    }
  };

  const handleSaveClick = () => {
    // Check if we need to show confirmation dialog
    if (
      settings.userGoal > 0 &&
      localSettings.userGoal !== settings.userGoal &&
      localSettings.userGoal > 0 &&
      settings.progressOnCustom > 0
    ) {
      setShowConfirmDialog(true);
    } else {
      // No confirmation needed, save directly
      saveSettings();
    }
  };

  const saveSettings = () => {
    // Close dialog if open
    setShowConfirmDialog(false);

    // Pass updated settings to parent component
    onSave(localSettings);
  };

  return (
    <>
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
          {/* User Goal Input */}
          <div className="grid gap-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <label className="text-sm font-medium leading-none">Daily Goal</label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Set how many pomodoros you want to complete today. The timer will stop automatically when you reach your goal.
            </p>
            <Input
              type="text"
              value={customGoal}
              onChange={handleGoalInputChange}
              placeholder="Enter number of pomodoros (e.g., 5)"
              className="w-full"
            />

            {/* Show current progress if a goal is set */}
            {settings.userGoal > 0 && settings.progressOnCustom > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Current progress: {settings.progressOnCustom} / {settings.userGoal} pomodoros
              </div>
            )}
          </div>

          {/* Save Settings Button */}
          <Button className="w-full mt-2" variant="outline" onClick={handleSaveClick}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Goal Change
            </DialogTitle>
            <DialogDescription>
              Changing your goal will reset your current progress of {settings.progressOnCustom} pomodoros.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={saveSettings}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
