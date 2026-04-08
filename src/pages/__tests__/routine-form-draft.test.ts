import { describe, it, expect } from "vitest";
import { DraftSchema } from "../routine-form";

const validActivity = {
  id: "act-1",
  name: "Academia",
  emoji: "🏋️",
  days: ["seg", "qua", "sex"],
  startTime: "07:00",
  endTime: "08:00",
  expanded: false,
  custom: false,
};

const validDraft = {
  currentActs: [validActivity],
  newActs: [],
  isDynamic: false,
  goals: "Quero melhorar minha saúde.",
};

// ─── Valid drafts ─────────────────────────────────────────────────────────────

describe("DraftSchema - valid inputs", () => {
  it("parses a complete valid draft", () => {
    const result = DraftSchema.safeParse(validDraft);
    expect(result.success).toBe(true);
  });

  it("allows empty activity lists", () => {
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [], newActs: [] });
    expect(result.success).toBe(true);
  });

  it("allows dynamic mode", () => {
    const result = DraftSchema.safeParse({ ...validDraft, isDynamic: true });
    expect(result.success).toBe(true);
  });

  it("allows all valid day values", () => {
    const act = { ...validActivity, days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(true);
  });

  it("allows goals up to 2000 characters", () => {
    const result = DraftSchema.safeParse({ ...validDraft, goals: "a".repeat(2000) });
    expect(result.success).toBe(true);
  });
});

// ─── Invalid / malicious drafts ───────────────────────────────────────────────

describe("DraftSchema - rejects malicious or malformed input", () => {
  it("rejects invalid day values", () => {
    const act = { ...validActivity, days: ["monday", "tuesday"] };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });

  it("rejects activity name longer than 100 chars", () => {
    const act = { ...validActivity, name: "x".repeat(101) };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });

  it("rejects goals longer than 2000 chars", () => {
    const result = DraftSchema.safeParse({ ...validDraft, goals: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rejects more than 50 activities in currentActs", () => {
    const acts = Array.from({ length: 51 }, (_, i) => ({ ...validActivity, id: `act-${i}` }));
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: acts });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const act = { ...validActivity, startTime: "7am", endTime: "8am" };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time with injection attempt", () => {
    const act = { ...validActivity, startTime: "'; DROP TABLE activities; --" };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean expanded field", () => {
    const act = { ...validActivity, expanded: "true" };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });

  it("rejects null draft", () => {
    expect(DraftSchema.safeParse(null).success).toBe(false);
  });

  it("rejects completely arbitrary JSON", () => {
    const malicious = { __proto__: { isAdmin: true }, evil: "<script>alert(1)</script>" };
    expect(DraftSchema.safeParse(malicious).success).toBe(false);
  });

  it("rejects emoji field longer than 10 chars", () => {
    const act = { ...validActivity, emoji: "🏋️".repeat(5) };
    const result = DraftSchema.safeParse({ ...validDraft, currentActs: [act] });
    expect(result.success).toBe(false);
  });
});
