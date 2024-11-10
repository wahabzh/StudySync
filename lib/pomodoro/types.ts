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
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}
