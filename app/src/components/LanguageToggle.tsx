import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium transition-all duration-300 hover:bg-white/20"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-mono text-xs">{language === 'en' ? t('common.fr') : t('common.en')}</span>
    </button>
  );
}
