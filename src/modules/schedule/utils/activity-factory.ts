import { EMOJI_KEYWORDS } from "../constants";
import type { Activity, ActivityPreset, Day } from "../types";

let counter = 1;
export const makeId = () => `act-${counter++}`;

export function guessEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const { words, emoji } of EMOJI_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return emoji;
  }
  return "📌";
}

export function makeActivity(preset: ActivityPreset, withSchedule = true): Activity {
  return {
    id: makeId(),
    name: preset.name,
    emoji: preset.emoji,
    days: withSchedule ? preset.defaultDays : ([] as Day[]),
    startTime: withSchedule ? preset.defaultStart : "",
    endTime: withSchedule ? preset.defaultEnd : "",
    expanded: false,
    custom: false,
    note: "",
  };
}

export function makeCustomActivity(withSchedule = true): Activity {
  return {
    id: makeId(),
    name: "",
    emoji: "⭐",
    days: [] as Day[],
    startTime: withSchedule ? "08:00" : "",
    endTime: withSchedule ? "09:00" : "",
    expanded: withSchedule,
    custom: true,
    note: "",
  };
}
