export interface Course {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'grammar';
  duration: number;
  image: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: string;
  categoryFr: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  titleFr: string;
  duration: number;
  completed: boolean;
  videoUrl?: string;
}

export interface VocabItem {
  id: string;
  french: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  status: 'learning' | 'mastered' | 'review';
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionFr: string;
  options: string[];
  optionsFr: string[];
  correctIndex: number;
  explanation: string;
  explanationFr: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const courses: Course[] = [
  {
    id: 'c1',
    title: 'French Café Conversations',
    titleFr: 'Conversations au Café Français',
    description: 'Master everyday interactions at French cafes, from ordering coffee to making small talk with locals.',
    descriptionFr: 'Maîtrisez les interactions quotidiennes dans les cafés français, de la commande du café aux conversations avec les locaux.',
    level: 'beginner',
    duration: 45,
    image: '/images/course-1.jpg',
    progress: 65,
    totalLessons: 8,
    completedLessons: 5,
    category: 'Conversation',
    categoryFr: 'Conversation',
  },
  {
    id: 'c2',
    title: 'Wine & Culture of Bordeaux',
    titleFr: 'Le Vin et la Culture de Bordeaux',
    description: 'Explore the rich wine culture of Bordeaux while learning sophisticated French vocabulary and expressions.',
    descriptionFr: 'Explorez la riche culture du vin de Bordeaux tout en apprenant un vocabulaire et des expressions français sophistiqués.',
    level: 'intermediate',
    duration: 60,
    image: '/images/course-2.jpg',
    progress: 30,
    totalLessons: 10,
    completedLessons: 3,
    category: 'Culture',
    categoryFr: 'Culture',
  },
  {
    id: 'c3',
    title: 'Market Bargaining & Shopping',
    titleFr: 'Marchandage et Courses au Marché',
    description: 'Learn to navigate French markets with confidence, from asking prices to bargaining like a local.',
    descriptionFr: 'Apprenez à naviguer dans les marchés français avec assurance, du prix aux marchandages comme un local.',
    level: 'beginner',
    duration: 35,
    image: '/images/course-3.jpg',
    progress: 0,
    totalLessons: 6,
    completedLessons: 0,
    category: 'Practical',
    categoryFr: 'Pratique',
  },
  {
    id: 'c4',
    title: 'Romantic Parisian Expressions',
    titleFr: 'Expressions Parisiennes Romantiques',
    description: 'Discover the poetic side of French with romantic phrases, love letters, and Parisian courtship language.',
    descriptionFr: 'Découvrez le côté poétique du français avec des phrases romantiques, des lettres d\'amour et le langage de séduction parisien.',
    level: 'advanced',
    duration: 50,
    image: '/images/course-4.jpg',
    progress: 10,
    totalLessons: 7,
    completedLessons: 1,
    category: 'Expressions',
    categoryFr: 'Expressions',
  },
  {
    id: 'c5',
    title: 'Business French Essentials',
    titleFr: 'Français des Affaires Essentiel',
    description: 'Professional French for the workplace — meetings, emails, presentations, and networking.',
    descriptionFr: 'Français professionnel pour le milieu de travail — réunions, e-mails, présentations et réseautage.',
    level: 'intermediate',
    duration: 55,
    image: '/images/course-1.jpg',
    progress: 0,
    totalLessons: 9,
    completedLessons: 0,
    category: 'Business',
    categoryFr: 'Affaires',
  },
  {
    id: 'c6',
    title: 'Advanced Grammar Mastery',
    titleFr: 'Maîtrise Avancée de la Grammaire',
    description: 'Conquer subjunctive, conditional, and complex tenses with clear explanations and exercises.',
    descriptionFr: 'Maîtrisez le subjonctif, le conditionnel et les temps complexes avec des explications claires et des exercices.',
    level: 'advanced',
    duration: 70,
    image: '/images/pillar-3.jpg',
    progress: 0,
    totalLessons: 12,
    completedLessons: 0,
    category: 'Grammar',
    categoryFr: 'Grammaire',
  },
];

export const lessons: Lesson[] = [
  { id: 'l1', courseId: 'c1', title: 'Ordering Coffee', titleFr: 'Commander un Café', duration: 8, completed: true },
  { id: 'l2', courseId: 'c1', title: 'Asking for the Menu', titleFr: 'Demander le Menu', duration: 6, completed: true },
  { id: 'l3', courseId: 'c1', title: 'Small Talk with the Barista', titleFr: 'Discuter avec le Barista', duration: 10, completed: true },
  { id: 'l4', courseId: 'c1', title: 'Paying the Bill', titleFr: 'Payer l\'Addition', duration: 5, completed: true },
  { id: 'l5', courseId: 'c1', title: 'Complimenting the Pastry', titleFr: 'Complimenter la Pâtisserie', duration: 7, completed: true },
  { id: 'l6', courseId: 'c1', title: 'Asking for Recommendations', titleFr: 'Demander des Recommandations', duration: 9, completed: false },
  { id: 'l7', courseId: 'c1', title: 'Describing Your Preferences', titleFr: 'Décrire Vos Préférences', duration: 8, completed: false },
  { id: 'l8', courseId: 'c1', title: 'Saying Goodbye', titleFr: 'Dire Au Revoir', duration: 4, completed: false },
];

export const vocabItems: VocabItem[] = [
  { id: 'v1', french: 'bonjour', english: 'hello/good morning', pronunciation: 'bon-zhoor', example: 'Bonjour, comment allez-vous?', exampleTranslation: 'Hello, how are you?', status: 'mastered', category: 'greetings' },
  { id: 'v2', french: 'merci', english: 'thank you', pronunciation: 'mare-see', example: 'Merci beaucoup pour votre aide.', exampleTranslation: 'Thank you very much for your help.', status: 'mastered', category: 'courtesy' },
  { id: 'v3', french: 'croissant', english: 'croissant', pronunciation: 'kwa-son', example: 'Je voudrais un croissant au beurre.', exampleTranslation: 'I would like a butter croissant.', status: 'learning', category: 'food' },
  { id: 'v4', french: 'fromage', english: 'cheese', pronunciation: 'fro-mazh', example: 'Le fromage français est délicieux.', exampleTranslation: 'French cheese is delicious.', status: 'learning', category: 'food' },
  { id: 'v5', french: 'baguette', english: 'baguette (bread)', pronunciation: 'ba-get', example: 'Une baguette tradition, s\'il vous plaît.', exampleTranslation: 'A traditional baguette, please.', status: 'mastered', category: 'food' },
  { id: 'v6', french: 'vin', english: 'wine', pronunciation: 'van', example: 'Un verre de vin rouge, merci.', exampleTranslation: 'A glass of red wine, thank you.', status: 'learning', category: 'drinks' },
  { id: 'v7', french: 'café', english: 'coffee/cafe', pronunciation: 'ka-fay', example: 'Le café est trop fort pour moi.', exampleTranslation: 'The coffee is too strong for me.', status: 'mastered', category: 'drinks' },
  { id: 'v8', french: 'pardon', english: 'excuse me/sorry', pronunciation: 'par-don', example: 'Pardon, où est la gare?', exampleTranslation: 'Excuse me, where is the train station?', status: 'learning', category: 'courtesy' },
  { id: 'v9', french: 'magnifique', english: 'magnificent/beautiful', pronunciation: 'man-yee-feek', example: 'Cette vue est magnifique!', exampleTranslation: 'This view is magnificent!', status: 'review', category: 'adjectives' },
  { id: 'v10', french: 'délicieux', english: 'delicious', pronunciation: 'day-lee-syuh', example: 'Ce plat est absolument délicieux.', exampleTranslation: 'This dish is absolutely delicious.', status: 'learning', category: 'adjectives' },
  { id: 'v11', french: 'rendez-vous', english: 'appointment/date', pronunciation: 'ron-day-voo', example: 'J\'ai un rendez-vous chez le médecin.', exampleTranslation: 'I have a doctor\'s appointment.', status: 'review', category: 'nouns' },
  { id: 'v12', french: 'joie de vivre', english: 'joy of living', pronunciation: 'zhwa duh veev-ruh', example: 'Les Français ont un certain joie de vivre.', exampleTranslation: 'The French have a certain joy of living.', status: 'learning', category: 'expressions' },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'How do you say "Hello" in French?',
    questionFr: 'Comment dit-on "Bonjour" en anglais?',
    options: ['Bonjour', 'Au revoir', 'Merci', 'S\'il vous plaît'],
    optionsFr: ['Hello', 'Goodbye', 'Thank you', 'Please'],
    correctIndex: 0,
    explanation: '"Bonjour" is the standard French greeting used throughout the day.',
    explanationFr: '"Bonjour" est la salutation française standard utilisée tout au long de la journée.',
  },
  {
    id: 'q2',
    question: 'What does "Je voudrais" mean?',
    questionFr: 'Que signifie "Je voudrais"?',
    options: ['I want', 'I would like', 'I have', 'I need'],
    optionsFr: ['Je veux', 'Je voudrais', 'J\'ai', 'J\'ai besoin'],
    correctIndex: 1,
    explanation: '"Je voudrais" is the conditional form of "vouloir" (to want) and is the polite way to express a wish.',
    explanationFr: '"Je voudrais" est la forme conditionnelle de "vouloir" et est la façon polie d\'exprimer un souhait.',
  },
  {
    id: 'q3',
    question: 'Which phrase means "Thank you very much"?',
    questionFr: 'Quelle phrase signifie "Merci beaucoup"?',
    options: ['Merci', 'Merci beaucoup', 'De rien', 'Je vous en prie'],
    optionsFr: ['Thank you', 'Thank you very much', 'You\'re welcome', 'You\'re welcome (formal)'],
    correctIndex: 1,
    explanation: '"Merci beaucoup" literally translates to "thank you very much" and is commonly used.',
    explanationFr: '"Merci beaucoup" se traduit littéralement par "thank you very much" et est couramment utilisé.',
  },
  {
    id: 'q4',
    question: 'How do you ask for the bill in a French cafe?',
    questionFr: 'Comment demande-t-on l\'addition dans un café français?',
    options: ['Le menu, s\'il vous plaît', 'L\'addition, s\'il vous plaît', 'Un café, s\'il vous plaît', 'L\'eau, s\'il vous plaît'],
    optionsFr: ['The menu, please', 'The bill, please', 'A coffee, please', 'Water, please'],
    correctIndex: 1,
    explanation: '"L\'addition" means "the bill" and is what you ask for when ready to pay.',
    explanationFr: '"L\'addition" signifie "la note" et c\'est ce que vous demandez quand vous êtes prêt à payer.',
  },
];

export const users = [
  { id: 1, name: 'Sarah M.', image: '/images/avatar-1.jpg' },
  { id: 2, name: 'James L.', image: '/images/avatar-2.jpg' },
  { id: 3, name: 'Yuki T.', image: '/images/avatar-3.jpg' },
  { id: 4, name: 'Marcus J.', image: '/images/avatar-4.jpg' },
  { id: 5, name: 'Elena R.', image: '/images/avatar-5.jpg' },
  { id: 6, name: 'Oliver K.', image: '/images/avatar-6.jpg' },
  { id: 7, name: 'Aisha B.', image: '/images/avatar-1.jpg' },
  { id: 8, name: 'Lucas P.', image: '/images/avatar-4.jpg' },
];

export const achievements = [
  { id: 'a1', title: 'First Steps', titleFr: 'Premiers Pas', description: 'Complete your first lesson', descriptionFr: 'Terminez votre première leçon', icon: 'Footprints', unlocked: true },
  { id: 'a2', title: 'Streak Starter', titleFr: 'Début de Série', description: 'Maintain a 3-day streak', descriptionFr: 'Maintenez une série de 3 jours', icon: 'Flame', unlocked: true },
  { id: 'a3', title: 'Vocabulary Builder', titleFr: 'Bâtisseur de Vocabulaire', description: 'Learn 50 words', descriptionFr: 'Apprenez 50 mots', icon: 'BookOpen', unlocked: false },
  { id: 'a4', title: 'Grammar Guru', titleFr: 'Gourou de la Grammaire', description: 'Complete 10 grammar exercises', descriptionFr: 'Terminez 10 exercices de grammaire', icon: 'Award', unlocked: false },
  { id: 'a5', title: 'Conversation Pro', titleFr: 'Pro de la Conversation', description: 'Have 5 AI tutor conversations', descriptionFr: 'Ayez 5 conversations avec le tuteur IA', icon: 'MessageCircle', unlocked: false },
];
