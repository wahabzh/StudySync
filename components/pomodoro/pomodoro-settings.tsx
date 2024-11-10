// components/pomodoro/PomodoroSettings.tsx
import React from "react";
import { Settings } from "@/lib/pomodoro/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface PomodoroSettingsProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export function PomodoroSettings({ settings, onSave }: PomodoroSettingsProps) {
  const [localSettings, setLocalSettings] = React.useState<Settings>(settings);

  const handleSave = () => {
    onSave(localSettings);
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
            min={1}
            max={60}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, pomodoro: value }))
            }
          />
        </div>
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">
              Short Break
            </label>
            <span className="text-sm text-muted-foreground">
              {localSettings.shortBreak} min
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.shortBreak]}
            min={1}
            max={15}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, shortBreak: value }))
            }
          />
        </div>
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">
              Long Break
            </label>
            <span className="text-sm text-muted-foreground">
              {localSettings.longBreak} min
            </span>
          </div>
          <Slider
            className="w-full h-4"
            value={[localSettings.longBreak]}
            min={1}
            max={30}
            step={1}
            onValueChange={([value]) =>
              setLocalSettings((prev) => ({ ...prev, longBreak: value }))
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <label
            htmlFor="auto-breaks"
            className="text-sm font-medium leading-none"
          >
            Auto-start Breaks
          </label>
          <Switch
            className="scale-75"
            id="auto-breaks"
            checked={localSettings.autoStartBreaks}
            onCheckedChange={(checked) =>
              setLocalSettings((prev) => ({
                ...prev,
                autoStartBreaks: checked,
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="auto-pomodoros"
            className="text-sm font-medium leading-none"
          >
            Auto-start Pomodoros
          </label>
          <Switch
            className="scale-75"
            id="auto-pomodoros"
            checked={localSettings.autoStartPomodoros}
            onCheckedChange={(checked) =>
              setLocalSettings((prev) => ({
                ...prev,
                autoStartPomodoros: checked,
              }))
            }
          />
        </div>
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
              setLocalSettings((prev) => ({
                ...prev,
                longBreakInterval: value,
              }))
            }
          />
        </div>
        <Button className="w-full" variant="outline" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
