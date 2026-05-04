import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.catalog': 'Lesson Catalog',
    'nav.methodology': 'Methodology',
    'nav.tutor': 'Tutor',
    'nav.pricing': 'Pricing',
    'nav.signin': 'Sign In',
    'nav.start': 'Start Learning',
    'nav.dashboard': 'Dashboard',
    'nav.library': 'Lesson Library',
    'nav.ai_tutor': 'AI Tutor',
    'nav.vocabulary': 'Vocabulary',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Hero
    'hero.title': 'Master French, speak with soul.',
    'hero.subtitle': 'Immerse yourself in authentic French through cinematic scenarios, AI-powered conversations, and cultural mastery.',
    'hero.play': 'Watch Trailer',
    'hero.learners': 'Active Learners',
    'hero.lessons': 'Video Lessons',
    'hero.rating': 'Average Rating',

    // Methodology
    'method.title': 'Learn through immersion',
    'method.subtitle': 'Our methodology combines real-world scenarios, native pronunciation, and living culture to create an authentic learning experience that goes beyond textbooks.',
    'method.pillar1.title': 'Real Scenarios',
    'method.pillar1.desc': 'Learn French through everyday situations — ordering at a cafe, navigating the metro, making friends at a party. Every lesson places you in an authentic context.',
    'method.pillar2.title': 'Native Pronunciation',
    'method.pillar2.desc': 'Train your ear and tongue with audio recorded by native speakers from across the francophone world. From Parisian chic to Quebecois charm.',
    'method.pillar3.title': 'Living Culture',
    'method.pillar3.desc': 'Language is culture. Explore French art, cinema, cuisine, and history woven into every lesson. Understand not just the words, but the soul behind them.',

    // Social Proof
    'social.title': 'Joined by passionate learners worldwide',

    // Home
    'home.why_choose': 'Why Choose Us',
    'home.comprehensive': 'A comprehensive approach that combines technology, culture, and pedagogy.',
    'home.popular': 'Popular Courses',
    'home.start_journey': 'Start your journey with our most loved lessons',
    'home.footer_desc': 'Master French through immersive, scenario-based learning. Speak with confidence, live with passion.',
    'home.footer_learn': 'Learn',
    'home.footer_community': 'Community',
    'home.footer_support': 'Support',
    'home.rights': 'All rights reserved.',

    // Auth
    'auth.login_title': 'Sign in to your account',
    'auth.login_subtitle': 'Or create a new account',
    'auth.login_desc': 'Enter your email and password to access your account',
    'auth.create_account': 'create a new account',
    'auth.already_have_account': 'Already have an account? Sign in',
    'auth.forgot_password': 'Forgot your password?',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.i_want_to': 'I want to:',
    'auth.sign_in': 'Sign In',
    'auth.signing_in': 'Signing In...',
    'auth.register': 'Register',
    'auth.registering': 'Registering...',
    'auth.register_title': 'Create your account',
    'auth.register_subtitle': 'Start your French learning journey today',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.continue': 'Continue Learning',
    'dashboard.progress': 'Your Progress',
    'dashboard.streak': 'Day Streak',
    'dashboard.xp': 'XP Points',
    'dashboard.completed': 'Lessons Completed',
    'dashboard.recommended': 'Recommended for You',
    'dashboard.recent': 'Recently Viewed',
    'dashboard.achievements': 'Achievements',

    // Lesson Library
    'library.title': 'Lesson Library',
    'library.search': 'Search lessons...',
    'library.all': 'All Levels',
    'library.beginner': 'Beginner',
    'library.intermediate': 'Intermediate',
    'library.advanced': 'Advanced',
    'library.grammar': 'Grammar',
    'library.duration': 'min',
    'library.start': 'Start Lesson',

    // Lesson Player
    'lesson.transcript': 'Transcript',
    'lesson.quiz': 'Quiz',
    'lesson.tutor': 'AI Tutor',
    'lesson.complete': 'Mark Complete',
    'lesson.download': 'Download Transcript',
    'lesson.next': 'Next Lesson',
    'lesson.prev': 'Previous Lesson',

    // AI Tutor
    'tutor.placeholder': 'Ask me anything in French or English...',
    'tutor.send': 'Send',
    'tutor.practice': 'Practice Conversation',
    'tutor.typing': 'AI is thinking...',
    'tutor.greeting': 'Bonjour! I\'m your AI French tutor. I can help you practice conversation, explain grammar, or translate phrases. What would you like to work on today?',

    // Vocabulary
    'vocab.title': 'My Vocabulary',
    'vocab.search': 'Search words...',
    'vocab.all': 'All Words',
    'vocab.mastered': 'Mastered',
    'vocab.learning': 'Learning',
    'vocab.review': 'Review',
    'vocab.add': 'Add Word',
    'vocab.flashcards': 'Flashcards',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.en': 'EN',
    'common.fr': 'FR',
    'common.language': 'Language',
  },
  fr: {
    // Navigation
    'nav.catalog': 'Catalogue de Cours',
    'nav.methodology': 'Méthodologie',
    'nav.tutor': 'Tuteur',
    'nav.pricing': 'Tarifs',
    'nav.signin': 'Connexion',
    'nav.start': 'Commencer',
    'nav.dashboard': 'Tableau de Bord',
    'nav.library': 'Bibliothèque',
    'nav.ai_tutor': 'Tuteur IA',
    'nav.vocabulary': 'Vocabulaire',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',

    // Hero
    'hero.title': 'Maîtrisez le français, parlez avec âme.',
    'hero.subtitle': "Plongez dans le Le' Perroque à travers des scénarios cinématiques, des conversations IA et une maîtrise culturelle.",
    'hero.play': 'Voir la Bande-annonce',
    'hero.learners': 'Apprenants Actifs',
    'hero.lessons': 'Leçons Vidéo',
    'hero.rating': 'Note Moyenne',

    // Methodology
    'method.title': 'Apprenez par l\'immersion',
    'method.subtitle': 'Notre méthodologie combine des scénarios réels, la prononciation native et la culture vivante pour créer une expérience d\'apprentissage authentique qui va au-delà des manuels.',
    'method.pillar1.title': 'Scénarios Réels',
    'method.pillar1.desc': 'Apprenez le français à travers des situations quotidiennes — commander au café, naviguer dans le métro, se faire des amis lors d\'une soirée. Chaque leçon vous place dans un contexte authentique.',
    'method.pillar2.title': 'Prononciation Native',
    'method.pillar2.desc': 'Entraînez votre oreille et votre langue avec des enregistrements de locuteurs natifs à travers le monde francophone. Du chic parisien au charme québécois.',
    'method.pillar3.title': 'Culture Vivante',
    'method.pillar3.desc': 'La langue est la culture. Explorez l\'art, le cinéma, la cuisine et l\'histoire français tissés dans chaque leçon. Comprenez non seulement les mots, mais l\'âme derrière eux.',

    // Social Proof
    'social.title': 'Rejoint par des apprenants passionnés du monde entier',

    // Home
    'home.why_choose': 'Pourquoi Nous Choisir',
    'home.comprehensive': 'Une approche complète qui combine technologie, culture et pédagogie.',
    'home.popular': 'Cours Populaires',
    'home.start_journey': 'Commencez votre voyage avec nos leçons préférées',
    'home.footer_desc': 'Maîtrisez le français par un apprentissage immersif basé sur des scénarios. Parlez avec assurance, vivez avec passion.',
    'home.footer_learn': 'Apprendre',
    'home.footer_community': 'Communauté',
    'home.footer_support': 'Support',
    'home.rights': 'Tous droits réservés.',

    // Auth
    'auth.login_title': 'Connectez-vous à votre compte',
    'auth.login_subtitle': 'Ou créez un nouveau compte',
    'auth.login_desc': 'Entrez votre email et votre mot de passe pour accéder à votre compte',
    'auth.create_account': 'créer un nouveau compte',
    'auth.already_have_account': 'Vous avez déjà un compte ? Connectez-vous',
    'auth.forgot_password': 'Mot de passe oublié ?',
    'auth.email': 'Adresse email',
    'auth.password': 'Mot de passe',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.i_want_to': 'Je veux :',
    'auth.sign_in': 'Se connecter',
    'auth.signing_in': 'Connexion...',
    'auth.register': 'S\'inscrire',
    'auth.registering': 'Inscription...',
    'auth.register_title': 'Créez votre compte',
    'auth.register_subtitle': 'Commencez votre voyage d\'apprentissage du français aujourd\'hui',

    // Dashboard
    'dashboard.welcome': 'Bon retour',
    'dashboard.continue': 'Continuer l\'Apprentissage',
    'dashboard.progress': 'Votre Progression',
    'dashboard.streak': 'Jours Consécutifs',
    'dashboard.xp': 'Points XP',
    'dashboard.completed': 'Leçons Terminées',
    'dashboard.recommended': 'Recommandé pour Vous',
    'dashboard.recent': 'Récemment Consultés',
    'dashboard.achievements': 'Réalisations',

    // Lesson Library
    'library.title': 'Bibliothèque de Cours',
    'library.search': 'Rechercher des leçons...',
    'library.all': 'Tous Niveaux',
    'library.beginner': 'Débutant',
    'library.intermediate': 'Intermédiaire',
    'library.advanced': 'Avancé',
    'library.grammar': 'Grammaire',
    'library.duration': 'min',
    'library.start': 'Commencer',

    // Lesson Player
    'lesson.transcript': 'Transcription',
    'lesson.quiz': 'Quiz',
    'lesson.tutor': 'Tuteur IA',
    'lesson.complete': 'Marquer comme Terminé',
    'lesson.download': 'Télécharger la Transcription',
    'lesson.next': 'Leçon Suivante',
    'lesson.prev': 'Leçon Précédente',

    // AI Tutor
    'tutor.placeholder': 'Posez-moi une question en français ou en anglais...',
    'tutor.send': 'Envoyer',
    'tutor.practice': 'Pratiquer la Conversation',
    'tutor.typing': 'L\'IA réfléchit...',
    'tutor.greeting': 'Bonjour! Je suis votre tuteur de français IA. Je peux vous aider à pratiquer la conversation, expliquer la grammaire ou traduire des phrases. Sur quoi aimeriez-vous travailler aujourd\'hui?',

    // Vocabulary
    'vocab.title': 'Mon Vocabulaire',
    'vocab.search': 'Rechercher des mots...',
    'vocab.all': 'Tous les Mots',
    'vocab.mastered': 'Maîtrisé',
    'vocab.learning': 'En Apprentissage',
    'vocab.review': 'Réviser',
    'vocab.add': 'Ajouter',
    'vocab.flashcards': 'Cartes Mémoire',

    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.continue': 'Continuer',
    'common.back': 'Retour',
    'common.close': 'Fermer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.en': 'EN',
    'common.fr': 'FR',
    'common.language': 'Langue',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'fr') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'en' ? 'fr' : 'en');
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
