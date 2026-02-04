// Stub i18n for web - not used
export const loadSavedLanguage = async () => 'id';
export const changeLanguage = async (lang: string) => lang;
export const getCurrentLanguage = () => 'id';
export const LANGUAGES = [
  { code: 'id', name: 'Indonesia' },
  { code: 'en', name: 'English' }
];

export const useTranslation = () => ({ 
  t: (key: string) => key, 
  i18n: { 
    language: 'id', 
    changeLanguage: async (lang: string) => lang 
  } 
});

const i18n = { 
  language: 'id',
  changeLanguage: async (lang: string) => lang
};

export default i18n;
