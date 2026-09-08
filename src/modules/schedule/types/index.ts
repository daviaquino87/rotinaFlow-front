export type Day = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  days: Day[];
  startTime: string;
  endTime: string;
  expanded: boolean;
  custom: boolean;
  /** Free-text note about this activity (e.g. "prefiro à noite", "não pode no fim de semana"). */
  note: string;
}

export interface ActivityPreset {
  name: string;
  emoji: string;
  defaultDays: Day[];
  defaultStart: string;
  defaultEnd: string;
}
