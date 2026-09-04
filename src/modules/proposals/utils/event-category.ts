import type { ScheduleEvent } from "@/api-client";

export interface Category {
  label: string;
  color: string;
  bg: string;
  textColor: string;
}

export function getCategory(event: ScheduleEvent): Category {
  const t = event.title.toLowerCase();
  if (/trabalho|reunião|meeting|foco|bloco|office|job|project/.test(t))
    return { label: "Trabalho",    color: "#3B82F6", bg: "#DBEAFE", textColor: "#1D4ED8" };
  if (/academia|corrida|yoga|saúde|exercício|gym|treino|despertar|natação|musculação|caminhada/.test(t))
    return { label: "Saúde",       color: "#10B981", bg: "#D1FAE5", textColor: "#065F46" };
  if (/almoço|jantar|refeição|café|lanche|alimentação|lunch|dinner|breakfast/.test(t))
    return { label: "Refeição",    color: "#F59E0B", bg: "#FEF3C7", textColor: "#92400E" };
  if (/estudo|idioma|leitura|curso|aprender|habit|journal|anotação|meditação|mindful/.test(t))
    return { label: "Novo Hábito", color: "#06B6D4", bg: "#CFFAFE", textColor: "#0E7490" };
  if (/lazer|hobby|game|música|arte|cinema|lúdic|família|social|amigo/.test(t))
    return { label: "Lazer",       color: "#8B5CF6", bg: "#EDE9FE", textColor: "#5B21B6" };
  return { label: "Geral", color: event.color || "#6366F1", bg: "#E0E7FF", textColor: "#3730A3" };
}

export function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function eventDuration(ev: ScheduleEvent): number {
  const start = parseMinutes(ev.startTime);
  let end = parseMinutes(ev.endTime);
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}
