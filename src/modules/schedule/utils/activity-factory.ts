import { EMOJI_KEYWORDS } from "../constants";
import type { Activity, ActivityPreset, Day } from "../types";

let counter = 1;
export const makeId = () => `act-${counter++}`;

export function guessEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const { words, emoji } of EMOJI_KEYWORDS) {
    if (words.some(w => lower.includes(w))) return emoji;
  }
  return "📌";
}

export function makeActivity(preset: ActivityPreset): Activity {
  return {
    id: makeId(),
    name: preset.name,
    emoji: preset.emoji,
    days: preset.defaultDays,
    startTime: preset.defaultStart,
    endTime: preset.defaultEnd,
    expanded: false,
    custom: false,
  };
}

export function makeCustomActivity(): Activity {
  return {
    id: makeId(),
    name: "",
    emoji: "⭐",
    days: [] as Day[],
    startTime: "08:00",
    endTime: "09:00",
    expanded: true,
    custom: true,
  };
}
