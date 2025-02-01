// lib/pomodoro/hooks/usePomodoro.ts
import { useState, useEffect, useCallback } from "react";
import { TimerState, Settings } from "../types";
import { useSound } from "use-sound";
import { toast } from "@/hooks/use-toast";
import { addPoints } from "@/app/gamification";

export function usePomodoro(initialSettings: Settings) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [timer, setTimer] = useState<TimerState>({
    mode: "pomodoro",
    timeLeft: initialSettings.pomodoro * 60,
    isRunning: false,
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const [playDing] = useSound("/ding.mp3", { volume: 0.5 });

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playDing();
    if ("Notification" in window && Notification.permission === "granted") {
      if (timer.mode === "pomodoro"){
        new Notification("Pomodoro Timer", {
          body: `Your ${timer.mode} session has ended! and you have been awarded ${settings.pomodoro} points for this pomodoro`,
          icon: "/favicon.ico",
          
        });
      }else{
        new Notification("Pomodoro Timer", {
          body: `Your ${timer.mode} session has ended!`,
          icon: "/favicon.ico",
          
        });
      }
    }
    if (timer.mode === "pomodoro") {
      setCompletedPomodoros((prev) => prev + 1);
      if (completedPomodoros + 1 >= settings.longBreakInterval) {
        addPoints(settings.pomodoro);
        switchMode("longBreak");
        setCompletedPomodoros(0);
      } else {
        addPoints(settings.pomodoro);
        switchMode("shortBreak");
      }
    } else {
      switchMode("pomodoro");
    }
  }, [timer.mode, completedPomodoros, settings.longBreakInterval, playDing]);

  // Switch timer mode
  const switchMode = useCallback(
    (mode: TimerState["mode"]) => {
      const newTimeLeft = settings[mode] * 60;
      const shouldAutoStart =
        mode === "pomodoro"
          ? settings.autoStartPomodoros
          : settings.autoStartBreaks;

      setTimer({
        mode,
        timeLeft: newTimeLeft,
        isRunning: shouldAutoStart,
      });
    },
    [settings]
  );

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.isRunning && timer.timeLeft > 0) {
      interval = setInterval(() => {
        setTimer((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.timeLeft, handleTimerComplete]);

  // Toggle timer
  const toggleTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  // Reset timer
  const resetTimer = () => {
    setTimer((prev) => ({
      ...prev,
      timeLeft: settings[prev.mode] * 60,
      isRunning: false,
    }));
  };

  // Save settings
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setTimer((prev) => ({
      ...prev,
      timeLeft: newSettings[prev.mode] * 60,
      isRunning: false,
    }));
    toast({
      title: "Settings saved",
      description: "Your timer settings have been updated.",
    });
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  // Initialize notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return {
    settings,
    timer,
    completedPomodoros,
    toggleTimer,
    resetTimer,
    saveSettings,
  };
}
