import type { Activity, Day } from "../types";

const ALL_DAYS_ORDER: Day[] = ["seg","ter","qua","qui","sex","sab","dom"];
const DAY_LABELS: Record<Day, string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta",
  qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo"
};

function formatDayList(days: Day[]): string {
  const sorted = ALL_DAYS_ORDER.filter(d => days.includes(d));
  if (sorted.length === 7) return "todos os dias";
  if (JSON.stringify(sorted) === JSON.stringify(["seg","ter","qua","qui","sex"])) return "dias úteis";
  if (JSON.stringify(sorted) === JSON.stringify(["sab","dom"])) return "fim de semana";
  return sorted.map(d => DAY_LABELS[d]).join(", ");
}

export function buildSchedulePrompt(
  current: Activity[],
  newActs: Activity[],
  dynamic: boolean,
  goals: string,
): string {
  const currentLines = current
    .filter(a => a.days.length > 0)
    .map(a => `  - ${a.emoji} ${a.name}: ${formatDayList(a.days)}, das ${a.startTime} às ${a.endTime}`)
    .join("\n");

  let newSection = "";
  if (dynamic) {
    newSection = `\nModo de geração: DINÂMICO — a IA deve sugerir as melhores atividades extras para otimizar minha semana.`;
    if (goals.trim()) newSection += `\nMeus objetivos e preferências: ${goals.trim()}`;
  } else {
    const newLines = newActs
      .filter(a => a.days.length > 0)
      .map(a => `  - ${a.emoji} ${a.name}: ${formatDayList(a.days)}, das ${a.startTime} às ${a.endTime}`)
      .join("\n");
    newSection = `\nAtividades que quero incluir na minha nova rotina:\n${newLines || "  (nenhuma especificada)"}`;
    if (goals.trim()) newSection += `\nObservações adicionais: ${goals.trim()}`;
  }

  return `Olá! Aqui estão as informações sobre minha rotina:\n\nRotina ATUAL (já faço regularmente):\n${currentLines}${newSection}\n\nCom base nisso, por favor crie uma proposta de agenda semanal completa, organizada e equilibrada para mim, encaixando as atividades existentes e as novas de forma harmoniosa.`;
}
