import { useLanguage } from './LanguageContext';

export function useTranslation() {
  const { t, direction } = useLanguage();
  return { t, direction };
}
