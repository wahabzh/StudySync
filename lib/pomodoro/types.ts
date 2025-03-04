// lib/pomodoro/types.ts
export interface TimerState {
  mode: "pomodoro" | "shortBreak" | "longBreak";
  timeLeft: number;
  isRunning: boolean;
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  userGoal: number | null,
  progressOnCustom: number | null,
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}
