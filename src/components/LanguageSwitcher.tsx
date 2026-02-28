import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${
          language === 'en'
            ? 'bg-blue-500 text-white'
            : 'text-blue-200 hover:bg-white/10'
        }`}
      >
        <Globe className="w-4 h-4" />
        EN
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5 ${
          language === 'ar'
            ? 'bg-blue-500 text-white'
            : 'text-blue-200 hover:bg-white/10'
        }`}
      >
        <Globe className="w-4 h-4" />
        AR
      </button>
    </div>
  );
}
