/**
 * Trust Agent Mobile - Internationalization Engine
 *
 * Auto-detects device language on first launch using expo-localization.
 * Persists preference in AsyncStorage. Manual override always takes priority.
 * Same 33-locale support as marketplace and desktop.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

export const SUPPORTED_LOCALES = [
  "en", "es", "fr", "de", "it", "pt", "nl", "pl", "ar", "zh", "ja", "ko",
  "hi", "tr", "ru", "uk", "sv", "da", "no", "cs", "hu", "ro", "el", "th",
  "vi", "id", "ms", "tl", "sw", "he", "bn", "ta", "pa",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: SupportedLocale[] = ["ar", "he"];

export const LOCALE_META: Record<SupportedLocale, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  es: { name: "Spanish", nativeName: "Espa\u00F1ol", flag: "\u{1F1EA}\u{1F1F8}" },
  fr: { name: "French", nativeName: "Fran\u00E7ais", flag: "\u{1F1EB}\u{1F1F7}" },
  de: { name: "German", nativeName: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  it: { name: "Italian", nativeName: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  pt: { name: "Portuguese", nativeName: "Portugu\u00EAs", flag: "\u{1F1E7}\u{1F1F7}" },
  nl: { name: "Dutch", nativeName: "Nederlands", flag: "\u{1F1F3}\u{1F1F1}" },
  pl: { name: "Polish", nativeName: "Polski", flag: "\u{1F1F5}\u{1F1F1}" },
  ar: { name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  zh: { name: "Chinese", nativeName: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  ja: { name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  ko: { name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
  hi: { name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
  tr: { name: "Turkish", nativeName: "T\u00FCrk\u00E7e", flag: "\u{1F1F9}\u{1F1F7}" },
  ru: { name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  uk: { name: "Ukrainian", nativeName: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", flag: "\u{1F1FA}\u{1F1E6}" },
  sv: { name: "Swedish", nativeName: "Svenska", flag: "\u{1F1F8}\u{1F1EA}" },
  da: { name: "Danish", nativeName: "Dansk", flag: "\u{1F1E9}\u{1F1F0}" },
  no: { name: "Norwegian", nativeName: "Norsk", flag: "\u{1F1F3}\u{1F1F4}" },
  cs: { name: "Czech", nativeName: "\u010Ce\u0161tina", flag: "\u{1F1E8}\u{1F1FF}" },
  hu: { name: "Hungarian", nativeName: "Magyar", flag: "\u{1F1ED}\u{1F1FA}" },
  ro: { name: "Romanian", nativeName: "Rom\u00E2n\u0103", flag: "\u{1F1F7}\u{1F1F4}" },
  el: { name: "Greek", nativeName: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", flag: "\u{1F1EC}\u{1F1F7}" },
  th: { name: "Thai", nativeName: "\u0E44\u0E17\u0E22", flag: "\u{1F1F9}\u{1F1ED}" },
  vi: { name: "Vietnamese", nativeName: "Ti\u1EBFng Vi\u1EC7t", flag: "\u{1F1FB}\u{1F1F3}" },
  id: { name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  ms: { name: "Malay", nativeName: "Bahasa Melayu", flag: "\u{1F1F2}\u{1F1FE}" },
  tl: { name: "Filipino", nativeName: "Tagalog", flag: "\u{1F1F5}\u{1F1ED}" },
  sw: { name: "Swahili", nativeName: "Kiswahili", flag: "\u{1F1F0}\u{1F1EA}" },
  he: { name: "Hebrew", nativeName: "\u05E2\u05D1\u05E8\u05D9\u05EA", flag: "\u{1F1EE}\u{1F1F1}" },
  bn: { name: "Bengali", nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE", flag: "\u{1F1E7}\u{1F1E9}" },
  ta: { name: "Tamil", nativeName: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", flag: "\u{1F1EE}\u{1F1F3}" },
  pa: { name: "Punjabi", nativeName: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", flag: "\u{1F1EE}\u{1F1F3}" },
};

/* ---------------------------------------------------------------------------
 * Constants for AsyncStorage keys
 * --------------------------------------------------------------------------- */

const AS_LOCALE_KEY = "ta-mobile-locale";
const AS_MANUAL_KEY = "ta-mobile-locale-manual";

/* ---------------------------------------------------------------------------
 * Device locale to supported locale mapping
 * --------------------------------------------------------------------------- */

const LOCALE_MAP: Record<string, SupportedLocale> = {
  en: "en", es: "es", fr: "fr", de: "de", it: "it", pt: "pt", nl: "nl",
  pl: "pl", ar: "ar", zh: "zh", ja: "ja", ko: "ko", hi: "hi", tr: "tr",
  ru: "ru", uk: "uk", sv: "sv", da: "da", no: "no", nb: "no", nn: "no",
  cs: "cs", hu: "hu", ro: "ro", el: "el", th: "th", vi: "vi", id: "id",
  ms: "ms", tl: "tl", fil: "tl", sw: "sw", he: "he", iw: "he",
  bn: "bn", ta: "ta", pa: "pa",
  "en-US": "en", "en-GB": "en", "en-AU": "en", "en-CA": "en",
  "es-MX": "es", "es-AR": "es", "es-CO": "es", "es-419": "es",
  "fr-FR": "fr", "fr-CA": "fr", "fr-BE": "fr", "fr-CH": "fr",
  "de-AT": "de", "de-CH": "de",
  "pt-BR": "pt", "pt-PT": "pt",
  "zh-CN": "zh", "zh-TW": "zh", "zh-HK": "zh", "zh-Hans": "zh", "zh-Hant": "zh",
  "ar-SA": "ar", "ar-EG": "ar", "ar-AE": "ar", "ar-MA": "ar",
  "nl-BE": "nl",
};

/* ---------------------------------------------------------------------------
 * Internal state
 * --------------------------------------------------------------------------- */

type TranslationDict = Record<string, unknown>;

let currentLocale: SupportedLocale = "en";
let wasAutoDetected = false;
const loadedTranslations: Partial<Record<SupportedLocale, TranslationDict>> = {};
const listeners: Array<(locale: SupportedLocale) => void> = [];

/* ---------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------- */

function isSupportedLocale(code: string): code is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(code);
}

function mapDeviceLocale(tag: string): SupportedLocale | undefined {
  const mapped = LOCALE_MAP[tag];
  if (mapped) return mapped;
  const base = tag.split("-")[0].toLowerCase();
  const baseMapped = LOCALE_MAP[base];
  if (baseMapped) return baseMapped;
  if (isSupportedLocale(base)) return base;
  return undefined;
}

function resolveKey(dict: TranslationDict, key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return params[key] != null ? String(params[key]) : `{{${key}}}`;
  });
}

/* ---------------------------------------------------------------------------
 * Translation loader - bundled JSON locale files
 * --------------------------------------------------------------------------- */

// Mobile translations are loaded from bundled JSON files.
// For React Native, we use require() since dynamic import is not available.
const localeLoaders: Partial<Record<SupportedLocale, () => TranslationDict>> = {};

// Register a locale loader (call from app initialization)
export function registerLocaleLoader(locale: SupportedLocale, loader: () => TranslationDict): void {
  localeLoaders[locale] = loader;
}

async function loadTranslations(locale: SupportedLocale): Promise<TranslationDict> {
  if (loadedTranslations[locale]) return loadedTranslations[locale]!;

  const loader = localeLoaders[locale];
  if (loader) {
    try {
      const dict = loader();
      loadedTranslations[locale] = dict;
      return dict;
    } catch {
      // fall through to English
    }
  }

  if (locale !== "en") {
    console.warn(`[i18n] Locale "${locale}" not found, falling back to English`);
    return loadTranslations("en");
  }

  console.error("[i18n] English locale file missing");
  return {};
}

/* ---------------------------------------------------------------------------
 * Public API
 * --------------------------------------------------------------------------- */

/**
 * Detect the best locale. Uses expo-localization getLocales() if available,
 * otherwise falls back to stored preference or English.
 */
export async function detectLocale(): Promise<SupportedLocale> {
  // 1. Returning user - stored manual preference
  try {
    const isManual = await AsyncStorage.getItem(AS_MANUAL_KEY);
    const stored = await AsyncStorage.getItem(AS_LOCALE_KEY);
    if (isManual === "true" && stored && isSupportedLocale(stored)) {
      return stored as SupportedLocale;
    }

    // 2. Returning user - stored auto-detected preference
    if (stored && isSupportedLocale(stored)) {
      wasAutoDetected = true;
      return stored as SupportedLocale;
    }
  } catch {
    // AsyncStorage not available, continue to device detection
  }

  // 3. First launch - detect from device locale via expo-localization
  try {
    // Dynamic import so the module is not required at build time if missing
    const { getLocales } = require("expo-localization");
    const deviceLocales = getLocales();
    if (deviceLocales && deviceLocales.length > 0) {
      for (const deviceLocale of deviceLocales) {
        const tag = deviceLocale.languageTag || deviceLocale.languageCode;
        if (tag) {
          const mapped = mapDeviceLocale(tag);
          if (mapped) {
            wasAutoDetected = true;
            return mapped;
          }
        }
      }
    }
  } catch {
    // expo-localization not available, try basic RN approach
    try {
      const { Platform, NativeModules } = require("react-native");
      const deviceLang =
        Platform.OS === "ios"
          ? NativeModules.SettingsManager?.settings?.AppleLocale ||
            NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
          : NativeModules.I18nManager?.localeIdentifier;
      if (deviceLang) {
        const mapped = mapDeviceLocale(deviceLang.replace("_", "-"));
        if (mapped) {
          wasAutoDetected = true;
          return mapped;
        }
      }
    } catch {
      // Fallback to English
    }
  }

  return "en";
}

export function getLocale(): SupportedLocale {
  return currentLocale;
}

export async function setLocale(locale: SupportedLocale): Promise<void> {
  if (!isSupportedLocale(locale)) {
    console.warn(`[i18n] Unsupported locale "${locale}", ignoring`);
    return;
  }
  await loadTranslations(locale);
  currentLocale = locale;

  // Persist to AsyncStorage
  try {
    await AsyncStorage.setItem(AS_LOCALE_KEY, locale);
  } catch {}

  // Apply RTL for Arabic and Hebrew
  const shouldBeRTL = RTL_LOCALES.includes(locale);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }

  listeners.forEach((fn) => fn(locale));
}

/**
 * Set locale via manual user action (LanguageSwitcher).
 * Marks the preference as manual so auto-detection is disabled for future launches.
 */
export async function setLocaleManual(locale: SupportedLocale): Promise<void> {
  wasAutoDetected = false;
  try {
    await AsyncStorage.setItem(AS_MANUAL_KEY, "true");
  } catch {}
  await setLocale(locale);
}

/** Initialize i18n - detects device locale and loads translations. Call once at app start. */
export async function initI18n(): Promise<SupportedLocale> {
  const detected = await detectLocale();
  await setLocale(detected);
  return detected;
}

/** Whether the current locale was auto-detected from the device (first launch). */
export function getWasAutoDetected(): boolean {
  return wasAutoDetected;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = loadedTranslations[currentLocale];
  if (dict) {
    const value = resolveKey(dict, key);
    if (value) return interpolate(value, params);
  }

  if (currentLocale !== "en") {
    const enDict = loadedTranslations.en;
    if (enDict) {
      const value = resolveKey(enDict, key);
      if (value) return interpolate(value, params);
    }
  }

  return key;
}

export function onLocaleChange(fn: (locale: SupportedLocale) => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function isRTL(): boolean {
  return RTL_LOCALES.includes(currentLocale);
}
