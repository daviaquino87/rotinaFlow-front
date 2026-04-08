import { DraftSchema, type DraftData } from "../utils/validators";
import { STORAGE_KEY } from "../constants";

export function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = DraftSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch { return null; }
}

export function saveDraft(data: DraftData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
