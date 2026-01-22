import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { I18nManager } from 'react-native';

// Import translation files
import id from './locales/id.json';
import ar from './locales/ar.json';
import en from './locales/en.json';

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'app_language';

// Supported languages configuration
export const LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Resources for i18next
const resources = {
    id: { translation: id },
    ar: { translation: ar },
    en: { translation: en },
};

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'id', // Default language
        fallbackLng: 'id',
        compatibilityJSON: 'v3', // Required for React Native
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false, // Disable suspense for React Native
        },
    });

/**
 * Load saved language preference from SecureStore
 */
export const loadSavedLanguage = async (): Promise<LanguageCode> => {
    try {
        const savedLang = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        if (savedLang && LANGUAGES.some(lang => lang.code === savedLang)) {
            return savedLang as LanguageCode;
        }
    } catch (error) {
        console.error('Failed to load saved language:', error);
    }
    return 'id'; // Default to Indonesian
};

/**
 * Change the application language
 * @param langCode - Language code ('id', 'ar', 'en')
 */
export const changeLanguage = async (langCode: LanguageCode): Promise<void> => {
    try {
        // Update i18next
        await i18n.changeLanguage(langCode);

        // Save language preference
        await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, langCode);

        // Handle RTL for Arabic
        const language = LANGUAGES.find(lang => lang.code === langCode);
        if (language) {
            const isRTL = language.rtl;
            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);
                // Note: App restart required for RTL changes to take full effect
            }
        }
    } catch (error) {
        console.error('Failed to change language:', error);
        throw error;
    }
};

/**
 * Get current language info
 */
export const getCurrentLanguage = () => {
    const currentLang = i18n.language as LanguageCode;
    return LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0];
};

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
    return getCurrentLanguage().rtl;
};

export default i18n;
