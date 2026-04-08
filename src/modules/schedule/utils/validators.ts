import { z } from "zod";

const DaySchema = z.enum(["seg", "ter", "qua", "qui", "sex", "sab", "dom"]);

const ActivitySchema = z.object({
  id: z.string().max(32),
  name: z.string().max(100),
  emoji: z.string().max(10),
  days: z.array(DaySchema).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  expanded: z.boolean(),
  custom: z.boolean(),
});

export const DraftSchema = z.object({
  currentActs: z.array(ActivitySchema).max(50),
  newActs: z.array(ActivitySchema).max(50),
  isDynamic: z.boolean(),
  goals: z.string().max(2000),
});

export type DraftData = z.infer<typeof DraftSchema>;
