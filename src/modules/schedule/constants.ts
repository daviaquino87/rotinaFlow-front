import type { Day, ActivityPreset } from "./types";

export const ALL_DAYS: { id: Day; label: string; abbr: string }[] = [
  { id: "seg", label: "Segunda", abbr: "Seg" },
  { id: "ter", label: "Terça",   abbr: "Ter" },
  { id: "qua", label: "Quarta",  abbr: "Qua" },
  { id: "qui", label: "Quinta",  abbr: "Qui" },
  { id: "sex", label: "Sexta",   abbr: "Sex" },
  { id: "sab", label: "Sábado",  abbr: "Sáb" },
  { id: "dom", label: "Domingo", abbr: "Dom" },
];

export const CURRENT_PRESETS: ActivityPreset[] = [
  { name: "Trabalho",            emoji: "💼", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "09:00", defaultEnd: "18:00" },
  { name: "Academia",            emoji: "🏋️", defaultDays: ["seg","qua","sex"],              defaultStart: "07:00", defaultEnd: "08:00" },
  { name: "Estudos",             emoji: "📚", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "19:00", defaultEnd: "21:00" },
  { name: "Almoço",              emoji: "🍽️", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "12:00", defaultEnd: "13:00" },
  { name: "Sono",                emoji: "😴", defaultDays: ["seg","ter","qua","qui","sex","sab","dom"], defaultStart: "23:00", defaultEnd: "07:00" },
  { name: "Meditação",           emoji: "🧘", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "06:30", defaultEnd: "07:00" },
  { name: "Caminhada / Corrida", emoji: "🏃", defaultDays: ["seg","qua","sex"],              defaultStart: "06:00", defaultEnd: "07:00" },
  { name: "Afazeres Domésticos", emoji: "🏠", defaultDays: ["sab"],                          defaultStart: "09:00", defaultEnd: "11:00" },
  { name: "Compras",             emoji: "🛒", defaultDays: ["sab"],                           defaultStart: "10:00", defaultEnd: "11:00" },
  { name: "Família / Social",    emoji: "👨‍👩‍👧", defaultDays: ["sab","dom"],               defaultStart: "15:00", defaultEnd: "18:00" },
  { name: "Lazer / Hobbies",    emoji: "🎮", defaultDays: ["sab","dom"],                    defaultStart: "20:00", defaultEnd: "22:00" },
  { name: "Igreja / Culto",      emoji: "🙏", defaultDays: ["dom"],                           defaultStart: "09:00", defaultEnd: "11:00" },
];

export const NEW_PRESETS: ActivityPreset[] = [
  { name: "Leitura",             emoji: "📖", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "21:00", defaultEnd: "22:00" },
  { name: "Idiomas",             emoji: "🗣️", defaultDays: ["seg","qua","sex"],             defaultStart: "07:00", defaultEnd: "07:30" },
  { name: "Musculação",          emoji: "💪", defaultDays: ["seg","qua","sex"],              defaultStart: "06:00", defaultEnd: "07:00" },
  { name: "Natação",             emoji: "🏊", defaultDays: ["ter","qui"],                    defaultStart: "07:00", defaultEnd: "08:00" },
  { name: "Yoga",                emoji: "🧘", defaultDays: ["ter","qui","sab"],              defaultStart: "07:00", defaultEnd: "08:00" },
  { name: "Dieta / Nutrição",    emoji: "🥗", defaultDays: ["seg","ter","qua","qui","sex","sab","dom"], defaultStart: "07:30", defaultEnd: "08:00" },
  { name: "Curso Online",        emoji: "💻", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "20:00", defaultEnd: "21:00" },
  { name: "Arte / Criatividade", emoji: "🎨", defaultDays: ["sab","dom"],                   defaultStart: "10:00", defaultEnd: "12:00" },
  { name: "Instrumento Musical", emoji: "🎸", defaultDays: ["ter","qui","sab"],              defaultStart: "19:00", defaultEnd: "20:00" },
  { name: "Tempo com a família", emoji: "👨‍👩‍👧", defaultDays: ["sab","dom"],               defaultStart: "14:00", defaultEnd: "17:00" },
  { name: "Voluntariado",        emoji: "🤝", defaultDays: ["sab"],                          defaultStart: "09:00", defaultEnd: "12:00" },
  { name: "Journaling",          emoji: "📓", defaultDays: ["seg","ter","qua","qui","sex"], defaultStart: "22:00", defaultEnd: "22:30" },
];

export const EMOJI_KEYWORDS: { words: string[]; emoji: string }[] = [
  { words: ["trabalho","reunião","meeting","work","escritório","office","job"], emoji: "💼" },
  { words: ["academia","gym","musculação","treino","crossfit","pilates"], emoji: "🏋️" },
  { words: ["estudo","curso","aula","escola","faculdade","universidade"], emoji: "📚" },
  { words: ["almoço","lunch","refeição","jantar","café","ceia"], emoji: "🍽️" },
  { words: ["dormir","sono","sleep","nap","descanso"], emoji: "😴" },
  { words: ["meditação","meditar","mindfulness","meditation"], emoji: "🧘" },
  { words: ["caminhada","corrida","run","walk","jogging"], emoji: "🏃" },
  { words: ["limpeza","casa","faxina","doméstico","domestic"], emoji: "🏠" },
  { words: ["compras","mercado","supermercado","shopping"], emoji: "🛒" },
  { words: ["família","filho","filha","marido","esposa","namorado","namorada","family"], emoji: "👨‍👩‍👧" },
  { words: ["lazer","games","jogo","hobby","diversão"], emoji: "🎮" },
  { words: ["igreja","culto","missa","religião","oração"], emoji: "🙏" },
  { words: ["leitura","livro","ler","book","read"], emoji: "📖" },
  { words: ["idioma","inglês","espanhol","francês","language"], emoji: "🗣️" },
  { words: ["natação","nadar","swim","pool"], emoji: "🏊" },
  { words: ["yoga"], emoji: "🧘" },
  { words: ["dieta","nutrição","nutri","nutrition","diet"], emoji: "🥗" },
  { words: ["música","violão","guitarra","piano","instrumento"], emoji: "🎸" },
  { words: ["arte","pintura","desenho","artesanato","creative"], emoji: "🎨" },
  { words: ["voluntário","voluntariado","volunteer"], emoji: "🤝" },
  { words: ["journal","diário","anotação","nota"], emoji: "📓" },
  { words: ["médico","consulta","dentista","saúde","health","doctor"], emoji: "🏥" },
  { words: ["transporte","ônibus","metrô","trem","commute"], emoji: "🚌" },
];

export const GENERATION_COST = 2;
export const STORAGE_KEY = "rotinaflow_form_draft";
