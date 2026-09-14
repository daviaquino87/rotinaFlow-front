import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonPt from "./locales/pt/common.json";
import commonEn from "./locales/en/common.json";
import landingPt from "./locales/pt/landing.json";
import landingEn from "./locales/en/landing.json";
import legalPt from "./locales/pt/legal.json";
import legalEn from "./locales/en/legal.json";
import schedulePt from "./locales/pt/schedule.json";
import scheduleEn from "./locales/en/schedule.json";
import proposalsPt from "./locales/pt/proposals.json";
import proposalsEn from "./locales/en/proposals.json";
import templatesPt from "./locales/pt/templates.json";
import templatesEn from "./locales/en/templates.json";
import creditsPt from "./locales/pt/credits.json";
import creditsEn from "./locales/en/credits.json";

export const LANGUAGE_STORAGE_KEY = "rotinaflow_language";

export const SUPPORTED_LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
] as const;

export const defaultNS = "common";

export const resources = {
  pt: {
    common: commonPt,
    landing: landingPt,
    legal: legalPt,
    schedule: schedulePt,
    proposals: proposalsPt,
    templates: templatesPt,
    credits: creditsPt,
  },
  en: {
    common: commonEn,
    landing: landingEn,
    legal: legalEn,
    schedule: scheduleEn,
    proposals: proposalsEn,
    templates: templatesEn,
    credits: creditsEn,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pt",
    defaultNS,
    ns: Object.keys(resources.pt),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

export default i18n;
