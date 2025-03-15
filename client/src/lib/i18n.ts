import { create } from "zustand";
import * as en from "@/locales/en";
import * as fr from "@/locales/fr";
import * as ht from "@/locales/ht";

type Language = "en" | "fr" | "ht";

type Translations = typeof ht;

// Get browser language or fallback to Haitian Creole
function getBrowserLanguage(): Language {
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "fr") return "fr";
  if (browserLang === "en") return "en";
  return "ht"; // Default to Haitian Creole
}

type LanguageState = {
  currentLanguage: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
};

export const useLanguage = create<LanguageState>((set, get) => {
  // Initialize with browser language or default
  const initialLang = getBrowserLanguage();
  
  // Get the appropriate translations
  const getTranslations = (lang: Language): Translations => {
    switch (lang) {
      case "en": return en;
      case "fr": return fr;
      case "ht": return ht;
      default: return ht;
    }
  };
  
  return {
    currentLanguage: initialLang,
    translations: getTranslations(initialLang),
    setLanguage: (lang: Language) => {
      set({ 
        currentLanguage: lang,
        translations: getTranslations(lang)
      });
      // Persist language preference
      localStorage.setItem("nouvel-ayiti-lang", lang);
    },
    t: (key: keyof Translations) => {
      const { translations } = get();
      return translations[key] || key.toString();
    }
  };
});

// Initialize with stored preference, if any
const storedLang = localStorage.getItem("nouvel-ayiti-lang") as Language | null;
if (storedLang && ["en", "fr", "ht"].includes(storedLang)) {
  useLanguage.getState().setLanguage(storedLang);
}

// Format date according to current language
export function formatDate(date: Date | string): string {
  const lang = useLanguage.getState().currentLanguage;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return dateObj.toLocaleDateString(
    lang === "ht" ? "fr-HT" : lang === "fr" ? "fr-FR" : "en-US", 
    options
  );
}
