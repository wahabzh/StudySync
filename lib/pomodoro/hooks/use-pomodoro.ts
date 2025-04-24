// lib/pomodoro/hooks/usePomodoro.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { TimerState, Settings } from "../types";
import { useSound } from "use-sound";
import { toast } from "@/hooks/use-toast";
import { addPoints, updateCustomGoalProgress } from "@/app/gamification";
import { savePomodoroGoal } from "@/app/actions";
import { usePathname } from "next/navigation";
import { getUser } from "@/app/actions";
import confetti from 'canvas-confetti';

const STORAGE_KEY = "pomodoroState";

export function usePomodoro(initialSettings: Settings) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [timer, setTimer] = useState<TimerState>({
    mode: "pomodoro",
    timeLeft: initialSettings.pomodoro * 60,
    isRunning: false,
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const [playDing] = useSound("/ding.mp3", { volume: 0.5 });
  const [playSuccess] = useSound("/success.mp3", { volume: 0.6 });

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Fetch user's goal from server first
        const userData = await getUser();
        let userGoalFromServer = 0;
        let progressFromServer = 0;

        if (userData) {
          userGoalFromServer = userData.custom_user_goal || 0;
          progressFromServer = userData.progress_on_custom || 0;
          setGoalProgress(progressFromServer);
        }

        // Load timer state from localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);

          // Update settings with user's goal from server, but keep other settings from localStorage
          const updatedSettings = {
            ...parsedState.savedSettings,
            userGoal: userGoalFromServer,
            progressOnCustom: progressFromServer
          };

          setSettings(updatedSettings);
          setTimer(parsedState.savedTimer);
          setCompletedPomodoros(parsedState.savedCompletedPomodoros);

          // Check if goal is already completed
          if (userGoalFromServer > 0 && progressFromServer >= userGoalFromServer) {
            setGoalCompleted(true);
          }
        } else {
          // No saved state, just update settings with user's goal from server
          setSettings(prev => ({
            ...prev,
            userGoal: userGoalFromServer,
            progressOnCustom: progressFromServer
          }));

          // Check if goal is already completed
          if (userGoalFromServer > 0 && progressFromServer >= userGoalFromServer) {
            setGoalCompleted(true);
          }
        }
      } catch (error) {
        console.error("Error loading pomodoro state:", error);
      }
    };

    loadSavedState();
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Don't save if we're just initializing
    if (timer.timeLeft === initialSettings.pomodoro * 60 && !timer.isRunning && completedPomodoros === 0) {
      return;
    }

    try {
      const stateToSave = {
        savedSettings: settings,
        savedTimer: timer,
        savedCompletedPomodoros: completedPomodoros
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving pomodoro state:", error);
    }
  }, [timer, settings, completedPomodoros, initialSettings.pomodoro]);

  // Update settings.progressOnCustom whenever goalProgress changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      progressOnCustom: goalProgress
    }));
  }, [goalProgress]);

  // Celebrate goal completion with confetti animation
  const celebrateGoalCompletion = useCallback(() => {
    // Play success sound
    playSuccess();

    // Trigger confetti animation
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Show toast notification
    toast({
      title: "Goal completed! 🎉",
      description: `Congratulations! You've completed your goal of ${settings.userGoal} pomodoros!`,
    });
  }, [settings.userGoal, playSuccess]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    playDing();

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      if (timer.mode === "pomodoro") {
        new Notification("Pomodoro Timer", {
          body: `Your ${timer.mode} session has ended! You earned ${settings.pomodoro * 10} points.`,
          icon: "/favicon.ico",
        });
      } else {
        new Notification("Pomodoro Timer", {
          body: `Your ${timer.mode} session has ended!`,
          icon: "/favicon.ico",
        });
      }
    }

    // Handle pomodoro completion
    if (timer.mode === "pomodoro") {
      // Award points only when pomodoro is completed
      await addPoints(settings.pomodoro * 10);

      // Update goal progress if user has a goal set
      if (settings.userGoal > 0 && !goalCompleted) {
        // Update server progress
        await updateCustomGoalProgress(settings.userGoal);

        // Update local progress state
        const newProgress = goalProgress + 1;
        setGoalProgress(newProgress);

        // Check if goal is now completed
        if (newProgress >= settings.userGoal) {
          setGoalCompleted(true);
          celebrateGoalCompletion();

          // Stop the auto-continuation if goal is reached
          const newCompletedPomodoros = completedPomodoros + 1;
          setCompletedPomodoros(newCompletedPomodoros);

          // Switch to long break as a reward, but don't auto-start
          switchMode("longBreak", false);
          return; // Exit early to prevent auto-continuation
        }
      }

      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);

      // Determine next break type
      if (newCompletedPomodoros >= settings.longBreakInterval) {
        switchMode("longBreak");
        setCompletedPomodoros(0); // Reset counter after long break
      } else {
        switchMode("shortBreak");
      }

      // Show toast notification for pomodoro completion
      toast({
        title: "Pomodoro completed!",
        description: `You earned ${settings.pomodoro * 10} points.`,
      });
    } else {
      // After break, switch back to pomodoro
      // If goal was completed, don't auto-start the next pomodoro
      switchMode("pomodoro", !goalCompleted);
    }
  }, [timer.mode, completedPomodoros, settings, playDing, goalProgress, goalCompleted, celebrateGoalCompletion]);

  // Switch timer mode with optional auto-start override
  const switchMode = useCallback(
    (mode: TimerState["mode"], autoStart?: boolean) => {
      const newTimeLeft = settings[mode] * 60;
      const shouldAutoStart = autoStart !== undefined
        ? autoStart
        : (mode === "pomodoro"
          ? settings.autoStartPomodoros
          : settings.autoStartBreaks);

      setTimer({
        mode,
        timeLeft: newTimeLeft,
        isRunning: shouldAutoStart && !goalCompleted, // Don't auto-start if goal completed
      });
    },
    [settings, goalCompleted]
  );

  // Clear previous interval when component unmounts or timer state changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname]); // Reset timer when navigating between pages

  // Timer effect with protection against infinite loops
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't run timer if goal is completed and we're in pomodoro mode
    if (goalCompleted && timer.mode === "pomodoro") {
      setTimer(prev => ({
        ...prev,
        isRunning: false,
      }));
      return;
    }

    if (timer.isRunning && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          // Prevent infinite loop by checking if we need to reduce timeLeft
          if (prev.timeLeft <= 0) {
            clearInterval(intervalRef.current!);
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (timer.timeLeft === 0 && timer.isRunning) {
      // Only call handleTimerComplete when timer is still running and reached zero
      handleTimerComplete();
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timer.timeLeft, timer.mode, handleTimerComplete, goalCompleted]);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    // If goal is completed and we're in pomodoro mode, don't allow starting
    if (goalCompleted && timer.mode === "pomodoro") {
      toast({
        title: "Goal completed",
        description: "Set a new goal in settings to continue with new pomodoros.",
      });
      return;
    }

    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, [goalCompleted, timer.mode]);

  // Reset timer
  const resetTimer = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimer(prev => ({
      ...prev,
      timeLeft: settings[prev.mode] * 60,
      isRunning: false,
    }));
  }, [settings]);

  // Save settings
  const saveSettings = useCallback(async (newSettings: Settings) => {
    // Handle goal change
    const isGoalChanged = newSettings.userGoal !== settings.userGoal;

    // Update local state
    setSettings(newSettings);

    // Reset timer with new settings values
    setTimer(prev => ({
      ...prev,
      timeLeft: newSettings[prev.mode] * 60,
      isRunning: false,
    }));

    // If setting a new goal or changing goal, reset goal completed state
    if (isGoalChanged) {
      setGoalCompleted(false);
    }

    // Save to localStorage
    try {
      localStorage.setItem("pomodoroSettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }

    // If userGoal changed, update server
    if (isGoalChanged) {
      const result = await savePomodoroGoal(newSettings.userGoal);
      if (!result.success) {
        console.error("Failed to update user goal:", result.message);
        return;
      }

      if (newSettings.userGoal > 0) {
        // Refresh user data to get the latest progress
        const userData = await getUser();
        if (userData) {
          // Update progress from server
          const serverProgress = userData.progress_on_custom || 0;
          setGoalProgress(serverProgress);

          // Update settings with server progress
          setSettings(prev => ({
            ...prev,
            progressOnCustom: serverProgress
          }));

          // Check if goal is already completed with the new progress
          if (serverProgress >= newSettings.userGoal) {
            setGoalCompleted(true);
          }
        }
      }

      toast({
        title: "Goal updated",
        description: newSettings.userGoal > 0
          ? `New goal set: ${newSettings.userGoal} pomodoros`
          : "Goal removed",
      });
    }

    toast({
      title: "Settings saved",
      description: "Your timer settings have been updated.",
    });
  }, [settings]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  // Initialize notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    settings,
    timer,
    completedPomodoros,
    userGoal: settings.userGoal,
    goalProgress: settings.progressOnCustom,
    goalCompleted,
    toggleTimer,
    resetTimer,
    saveSettings,
  };
}
