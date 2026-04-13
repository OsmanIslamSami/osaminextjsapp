import { useLanguage } from './LanguageContext';

export function useTranslation() {
  const { t, direction, language } = useLanguage();
  return { t, direction, language };
}
