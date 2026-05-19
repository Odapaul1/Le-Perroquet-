import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { vocabItems } from '@/data/courses';
import {
  Search,
  Volume2,
  CheckCircle,
  Circle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import gsap from 'gsap';

type FilterStatus = 'all' | 'learning' | 'mastered' | 'review';

export default function Vocabulary() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = vocabItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchesSearch = searchQuery === '' ||
      item.french.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.english.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredForFlashcards = activeFilter === 'all' ? vocabItems : vocabItems.filter(v => v.status === activeFilter);

  useEffect(() => {
    if (gridRef.current && !showFlashcards) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, [activeFilter, searchQuery, showFlashcards]);

  const playAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9; // Slightly slower for better learning
      window.speechSynthesis.speak(utterance);
    }
  };

  const statusConfig = {
    mastered: { color: 'text-green-600', bg: 'bg-green-50', label: t('vocab.mastered') },
    learning: { color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', label: t('vocab.learning') },
    review: { color: 'text-[#D91A1A]', bg: 'bg-[#D91A1A]/10', label: t('vocab.review') },
  };

  if (showFlashcards) {
    const current = filteredForFlashcards[flashcardIndex];
    if (!current) return null;

    return (
      <div className="min-h-screen bg-[#F8F8F0]">
        <Sidebar />
        <main className="ml-[280px] min-h-screen flex flex-col">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between">
            <h1 className="font-serif text-3xl text-[#1A1A1A]">{t('vocab.flashcards')}</h1>
            <button
              onClick={() => setShowFlashcards(false)}
              className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#D91A1A] transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">{t('common.close')}</span>
            </button>
          </div>

          {/* Progress */}
          <div className="px-8 mb-8">
            <div className="flex items-center justify-between text-sm text-[#6B6B6B] mb-2">
              <span>{flashcardIndex + 1} / {filteredForFlashcards.length}</span>
              <span>{Math.round(((flashcardIndex + 1) / filteredForFlashcards.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-[#EFEFDC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#001B71] rounded-full transition-all duration-300"
                style={{ width: `${((flashcardIndex + 1) / filteredForFlashcards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-full max-w-lg">
              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="relative aspect-[3/2] cursor-pointer perspective-1000"
              >
                <div
                  className={`absolute inset-0 bg-white rounded-sm border border-[#1A1A1A]/5 shadow-lg flex flex-col items-center justify-center p-8 transition-all duration-500 ${
                    flashcardFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'
                  }`}
                >
                  <span className={`text-xs font-medium uppercase tracking-wider mb-4 ${statusConfig[current.status].color}`}>
                    {statusConfig[current.status].label}
                  </span>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-serif text-4xl text-[#1A1A1A]">{current.french}</h2>
                    <button 
                      onClick={(e) => playAudio(current.french, e)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Volume2 className="w-6 h-6 text-[#D91A1A]" />
                    </button>
                  </div>
                  <p className="text-[#6B6B6B] text-sm font-mono">{current.pronunciation}</p>
                  <p className="text-[#6B6B6B]/60 text-xs mt-6">{language === 'en' ? 'Click to reveal' : 'Cliquez pour révéler'}</p>
                </div>

                <div
                  className={`absolute inset-0 bg-[#1A1A1A] rounded-sm shadow-lg flex flex-col items-center justify-center p-8 transition-all duration-500 ${
                    flashcardFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'
                  }`}
                >
                  <h2 className="font-serif text-3xl text-[#F8F8F0] mb-4">{current.english}</h2>
                  <p className="text-[#F8F8F0]/60 text-sm italic text-center leading-relaxed">
                    "{current.example}"
                  </p>
                  <p className="text-[#F8F8F0]/40 text-xs mt-2">
                    {current.exampleTranslation}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setFlashcardIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={flashcardIndex === 0}
                  className="w-12 h-12 rounded-full bg-white border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#EFEFDC] transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
                </button>

                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setTimeout(() => setFlashcardIndex(prev => Math.min(filteredForFlashcards.length - 1, prev + 1)), 200);
                  }}
                  disabled={flashcardIndex === filteredForFlashcards.length - 1}
                  className="px-6 py-3 bg-[#D91A1A] text-white rounded-sm font-medium hover:bg-[#b81616] transition-colors disabled:opacity-30"
                >
                  {language === 'en' ? 'Next' : 'Suivant'}
                </button>

                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setFlashcardIndex(prev => Math.min(filteredForFlashcards.length - 1, prev + 1));
                  }}
                  disabled={flashcardIndex === filteredForFlashcards.length - 1}
                  className="w-12 h-12 rounded-full bg-white border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#EFEFDC] transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5 text-[#1A1A1A]" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        <div className="px-8 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-[#1A1A1A] mb-1">{t('vocab.title')}</h1>
              <p className="text-[#6B6B6B]">{filtered.length} {language === 'en' ? 'words' : 'mots'}</p>
            </div>
            <button
              onClick={() => setShowFlashcards(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#001B71] text-white rounded-sm text-sm font-medium hover:bg-[#00155a] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('vocab.flashcards')}
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('vocab.search')}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1A1A1A]/10 rounded-sm text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B]/50 focus:outline-none focus:border-[#D91A1A]/30"
              />
            </div>
            {(['all', 'learning', 'mastered', 'review'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === status
                    ? 'bg-[#D91A1A] text-white'
                    : 'bg-white text-[#1A1A1A]/70 hover:bg-[#EFEFDC] border border-[#1A1A1A]/10'
                }`}
              >
                {t(`vocab.${status}`)}
              </button>
            ))}
          </div>

          {/* Vocab Grid */}
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const status = statusConfig[item.status];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-sm border border-[#1A1A1A]/5 p-5 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-xl text-[#1A1A1A]">{item.french}</h3>
                        <button 
                          onClick={(e) => playAudio(item.french, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Volume2 className="w-4 h-4 text-[#6B6B6B] hover:text-[#D91A1A]" />
                        </button>
                      </div>
                      <p className="text-[#6B6B6B] text-sm font-mono">{item.pronunciation}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="border-t border-[#1A1A1A]/5 pt-3">
                    <p className="text-[#1A1A1A] font-medium text-sm mb-1">{item.english}</p>
                    <p className="text-[#6B6B6B] text-xs italic">"{item.example}"</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {item.status === 'learning' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-sm text-xs font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('vocab.mastered')}
                      </button>
                    )}
                    {item.status === 'mastered' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D91A1A]/10 text-[#D91A1A] rounded-sm text-xs font-medium hover:bg-[#D91A1A]/20 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('vocab.review')}
                      </button>
                    )}
                    {item.status === 'review' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-sm text-xs font-medium hover:bg-[#D4AF37]/20 transition-colors">
                        <Circle className="w-3.5 h-3.5" />
                        {t('vocab.learning')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#6B6B6B]">
                {language === 'en' ? 'No vocabulary words found.' : 'Aucun mot de vocabulaire trouvé.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
