import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { sessionAPI, assignmentAPI, courseAPI, enrollmentAPI } from '@/services/api';
import { courses, lessons, quizQuestions, type ChatMessage } from '@/data/courses';
import { 
  Play,
  Pause,
  CheckCircle,
  Download,
  MessageCircle,
  FileText,
  HelpCircle,
  ChevronLeft,
  Send,
  Sparkles,
  User,
  Check,
  X,
  Star,
  Clock,
  Video,
  Pen,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import gsap from 'gsap';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChatSystem } from '@/components/ChatSystem';

type TabType = 'transcript' | 'quiz' | 'tutor' | 'recordings' | 'assignments';

const transcriptData = [
  { time: '00:00', french: 'Bonjour et bienvenue dans notre cours sur les conversations au café.', english: 'Hello and welcome to our course on cafe conversations.' },
  { time: '00:08', french: 'Aujourd\'hui, nous allons apprendre comment commander un café en France.', english: 'Today, we will learn how to order coffee in France.' },
  { time: '00:15', french: 'En France, le café est une partie très importante de la culture.', english: 'In France, coffee is a very important part of the culture.' },
  { time: '00:22', french: 'Quand vous entrez dans un café, vous pouvez dire "Bonjour" au serveur.', english: 'When you enter a cafe, you can say "Hello" to the server.' },
  { time: '00:30', french: 'Pour commander, vous pouvez dire : "Je voudrais un café, s\'il vous plaît."', english: 'To order, you can say: "I would like a coffee, please."' },
  { time: '00:38', french: 'Il existe plusieurs types de café en France.', english: 'There are several types of coffee in France.' },
  { time: '00:44', french: 'Un "expresso" est un café court et fort.', english: 'An "expresso" is a short, strong coffee.' },
  { time: '00:50', french: 'Un "café allongé" est un expresso avec plus d\'eau.', english: 'A "café allongé" is an expresso with more water.' },
  { time: '00:58', french: 'Un "café crème" est un café avec du lait.', english: 'A "café crème" is a coffee with milk.' },
  { time: '01:05', french: 'N\'oubliez pas de dire "Merci" et "Au revoir" en partant!', english: 'Don\'t forget to say "Thank you" and "Goodbye" when leaving!' },
];

export default function Lesson() {
  const { courseId } = useParams<{ courseId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'ai', content: t('tutor.greeting'), timestamp: new Date() },
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [recordedSessions, setRecordedSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionData, setSubmissionData] = useState({ textContent: '', contentUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const courseFromData = courses.find(c => c.id === courseId);
  const [dbCourse, setDbCourse] = useState<any>(null);
  const course = courseFromData || dbCourse;
  
  // Extract lessons from course modules if available, otherwise use static lessons
  const courseLessons = course?.modules 
    ? course.modules.flatMap((m: any) => m.subModules || []).flatMap((sm: any) => sm.topics || [])
    : lessons.filter(l => l.courseId === (courseId || course?.id));
    
  const currentLesson = courseLessons[currentLessonIndex] || courseLessons[0] || { title: 'No Lessons Found', titleFr: 'Aucune leçon trouvée', duration: 0 };

  useEffect(() => {
    const checkEnrollment = async () => {
      // ── Step 1: Fetch course + verify enrollment ──────────────────
      // This block is the only one that should redirect on failure.
      try {
        if (!courseFromData && courseId) {
          const fetchedCourse = await courseAPI.getById(courseId);
          setDbCourse(fetchedCourse);
        }

        const enrollments = await enrollmentAPI.getMyEnrollments();
        const currentEnrollment = enrollments.find((e: any) => {
          const enrolledCourseId = (e.courseId?._id || e.courseId)?.toString();
          const currentCourseId = courseId?.toString();
          return enrolledCourseId === currentCourseId;
        });

        if (!currentEnrollment) {
          toast.error('You must be enrolled to access this course.');
          navigate('/library');
          return;
        }

        setIsEnrolled(true);
        setEnrollmentId(currentEnrollment._id);
      } catch (error) {
        console.error('Failed to verify enrollment:', error);
        setIsEnrolled(false);
        navigate('/library');
        return;
      }

      // ── Step 2: Load supplementary data (non-critical) ───────────
      // Sessions/assignments failing must NEVER redirect the learner.
      try {
        const [sessionsData, assignmentsData] = await Promise.all([
          sessionAPI.getByCourse(courseId!),
          assignmentAPI.getByCourse(courseId!),
        ]);
        setRecordedSessions(sessionsData ?? []);
        setAssignments(assignmentsData ?? []);
      } catch (error) {
        console.warn('Could not load sessions/assignments (non-critical):', error);
        setRecordedSessions([]);
        setAssignments([]);
      }
    };
    checkEnrollment();
  }, [courseId]);

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionData.textContent.trim()) return toast.error('Please provide some content');
    
    setIsSubmitting(true);
    try {
      await assignmentAPI.submit(assignmentId, submissionData);
      toast.success('Assignment submitted successfully!');
      setSubmissionData({ textContent: '', contentUrl: '' });
      // Refresh assignments
      const updated = await assignmentAPI.getByCourse(courseId || course.id);
      setAssignments(updated);
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  const handleCompleteLesson = async () => {
    if (!enrollmentId || !currentLesson) return;
    try {
      await enrollmentAPI.updateProgress(enrollmentId, currentLesson._id || currentLesson.id);
      setCompleted(true);
      toast.success('Lesson marked as completed!');
    } catch (error) {
      console.error('Failed to update progress', error);
      toast.error('Failed to mark lesson as completed');
    }
  };

  const handleQuizAnswer = (questionId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const correctAnswers = quizQuestions.filter(q => quizAnswers[q.id] === q.correctIndex).length;

  const handleTutorSend = () => {
    if (!tutorInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: tutorInput,
      timestamp: new Date(),
    };
    setTutorMessages(prev => [...prev, userMsg]);
    setTutorInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Excellent question! Let me explain that grammar point in detail...",
        "Très bien! Your understanding is improving. Keep practicing!",
        "That's a great observation. In French, we typically say...",
        "You're on the right track! Here's a helpful tip...",
      ];
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setTutorMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: 'transcript', label: t('lesson.transcript'), icon: FileText },
    { id: 'quiz', label: t('lesson.quiz'), icon: HelpCircle },
    { id: 'tutor', label: t('lesson.tutor'), icon: MessageCircle },
    { id: 'recordings', label: 'Sessions', icon: Video },
    { id: 'assignments', label: 'Tasks', icon: Pen },
  ];

  if (isEnrolled === null || !course) {
    return (
      <div className="min-h-screen bg-[#F8F8F0] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D91A1A] animate-spin" />
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main ref={pageRef} className="ml-[280px] min-h-screen">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#1A1A1A]/5 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/library" className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-lg text-[#1A1A1A]">
                {language === 'en' ? currentLesson.title : currentLesson.titleFr}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <Clock className="w-3 h-3" />
                <span>{currentLesson.duration} {t('library.duration')}</span>
                <span className="mx-1">•</span>
                <span>
                  {course.completedLessons !== undefined ? course.completedLessons : 0}/
                  {course.totalLessons !== undefined ? course.totalLessons : courseLessons.length} 
                  {' '}{t('dashboard.completed').toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('lesson.download')}</span>
            </button>
            <button
              onClick={handleCompleteLesson}
              disabled={completed}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                completed
                  ? 'bg-green-500 text-white cursor-not-allowed opacity-80'
                  : 'bg-[#D91A1A] text-white hover:bg-[#b81616]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {completed ? (language === 'en' ? 'Completed' : 'Terminé') : t('lesson.complete')}
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Left: Video Player */}
          <div className="flex-1">
            <div className="aspect-video bg-[#1A1A1A] relative flex items-center justify-center group">
              {(currentLesson.videoUrl || currentLesson.contentUrl) ? (
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl || currentLesson.contentUrl}
                  className="w-full h-full object-contain"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-white text-center">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm opacity-50">Video not available</p>
                </div>
              )}
              
              <button
                onClick={togglePlay}
                className={`absolute w-20 h-20 rounded-full bg-[#D91A1A] flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100 scale-90' : 'opacity-100 scale-100'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" fill="white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div 
                  className="h-full bg-[#D91A1A] transition-all duration-300" 
                  style={{ width: isPlaying ? '100%' : '0%', transitionDuration: isPlaying ? `${currentLesson.duration * 60}s` : '0.3s' }} 
                />
              </div>
            </div>

            {/* Course Info Below Video */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-[#EFEFDC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#001B71] rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm text-[#6B6B6B]">{course.progress}%</span>
              </div>

              {/* Lesson List */}
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-3">
                {language === 'en' ? 'Lessons' : 'Leçons'}
              </h3>
              <div className="space-y-2">
                {courseLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLessonIndex(index);
                      setIsPlaying(false);
                      setCompleted(false); // Reset the complete button for the new lesson
                    }}
                    className={`flex items-center gap-4 p-3 rounded-sm cursor-pointer transition-colors ${
                      index === currentLessonIndex ? 'bg-[#D91A1A]/5 border border-[#D91A1A]/20' : 'hover:bg-[#EFEFDC]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      lesson.completed ? 'bg-green-500' : index === currentLessonIndex ? 'bg-[#D91A1A]' : 'bg-[#EFEFDC]'
                    }`}>
                      {lesson.completed ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Play className={`w-3 h-3 ${index === currentLessonIndex ? 'text-white ml-0.5' : 'text-[#6B6B6B] ml-0.5'}`} fill="currentColor" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${index === currentLessonIndex ? 'text-[#D91A1A]' : 'text-[#1A1A1A]'}`}>
                        {language === 'en' ? lesson.title : lesson.titleFr}
                      </p>
                    </div>
                    <span className="text-xs text-[#6B6B6B]">{lesson.duration} {t('library.duration')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Interactive Panel */}
          <div className="w-[420px] border-l border-[#1A1A1A]/5 bg-white flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[#1A1A1A]/5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#D91A1A] text-[#D91A1A]'
                        : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'transcript' && (
                <div className="p-4 space-y-1">
                  {transcriptData.map((line, i) => (
                    <div
                      key={i}
                      className="group flex gap-4 p-3 rounded-sm hover:bg-[#EFEFDC] transition-colors cursor-pointer"
                    >
                      <span className="text-xs text-[#D91A1A] font-mono pt-0.5">{line.time}</span>
                      <div>
                        <p className="text-sm text-[#1A1A1A] mb-1">{line.french}</p>
                        <p className="text-xs text-[#6B6B6B]">{line.english}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="p-4 space-y-6">
                  {!showResult ? (
                    <>
                      {quizQuestions.map((q, qi) => (
                        <div key={q.id} className="border border-[#1A1A1A]/5 rounded-sm p-4">
                          <p className="text-sm font-medium text-[#1A1A1A] mb-3">
                            {qi + 1}. {language === 'en' ? q.question : q.questionFr}
                          </p>
                          <div className="space-y-2">
                            {(language === 'en' ? q.options : q.optionsFr).map((opt, oi) => (
                              <button
                                key={oi}
                                onClick={() => handleQuizAnswer(q.id, oi)}
                                className={`w-full text-left p-3 rounded-sm text-sm transition-all ${
                                  quizAnswers[q.id] === oi
                                    ? 'bg-[#D91A1A]/10 border border-[#D91A1A]/30 text-[#D91A1A]'
                                    : 'bg-[#EFEFDC] hover:bg-[#EFEFDC]/80 text-[#1A1A1A]'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {quizAnswers[q.id] !== undefined && (
                            <div className={`mt-3 p-3 rounded-sm text-xs ${
                              quizAnswers[q.id] === q.correctIndex
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {quizAnswers[q.id] === q.correctIndex ? (
                                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {language === 'en' ? 'Correct!' : 'Correct!'}</span>
                              ) : (
                                <span className="flex items-center gap-1"><X className="w-3 h-3" /> {language === 'en' ? q.explanation : q.explanationFr}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setShowResult(true)}
                        className="w-full py-3 bg-[#D91A1A] text-white rounded-sm font-medium hover:bg-[#b81616] transition-colors"
                      >
                        {language === 'en' ? 'See Results' : 'Voir les Résultats'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-10 h-10 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">
                        {correctAnswers}/{quizQuestions.length}
                      </h3>
                      <p className="text-[#6B6B6B] text-sm mb-6">
                        {correctAnswers === quizQuestions.length
                          ? (language === 'en' ? 'Parfait! All correct!' : 'Parfait! Tout est correct!')
                          : (language === 'en' ? 'Keep practicing!' : 'Continuez à pratiquer!')}
                      </p>
                      <button
                        onClick={() => { setShowResult(false); setQuizAnswers({}); }}
                        className="px-6 py-2 bg-[#EFEFDC] text-[#1A1A1A] rounded-sm text-sm font-medium hover:bg-[#e5e5d0] transition-colors"
                      >
                        {language === 'en' ? 'Try Again' : 'Réessayer'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tutor' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
                    {tutorMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'ai' ? 'bg-[#D91A1A]' : 'bg-[#EFEFDC]'
                        }`}>
                          {msg.role === 'ai' ? (
                            <Sparkles className="w-4 h-4 text-white" />
                          ) : (
                            <User className="w-4 h-4 text-[#1A1A1A]" />
                          )}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          msg.role === 'ai' ? 'bg-[#EFEFDC] text-[#1A1A1A]' : 'bg-[#D91A1A] text-white'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D91A1A] flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#EFEFDC] p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#D91A1A] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-[#D91A1A] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-[#D91A1A] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-[#1A1A1A]/5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tutorInput}
                        onChange={(e) => setTutorInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTutorSend()}
                        placeholder={t('tutor.placeholder')}
                        className="flex-1 px-4 py-2.5 bg-[#EFEFDC] rounded-sm text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B]/50 focus:outline-none focus:ring-2 focus:ring-[#D91A1A]/20"
                      />
                      <button onClick={handleTutorSend} className="w-10 h-10 bg-[#D91A1A] rounded-sm flex items-center justify-center hover:bg-[#b81616] transition-colors">
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recordings' && (
                <div className="p-4 space-y-4">
                  <div className="mb-4">
                    <h4 className="font-serif text-lg text-[#1A1A1A]">Session Replays</h4>
                    <p className="text-xs text-[#6B6B6B]">Watch recorded live sessions and workshops.</p>
                  </div>
                  
                  {recordedSessions.length > 0 ? (
                    <div className="space-y-3">
                      {recordedSessions.map((session) => (
                        <div 
                          key={session._id} 
                          className="group border border-[#1A1A1A]/5 rounded-sm p-4 hover:bg-[#EFEFDC] transition-all cursor-pointer"
                          onClick={() => window.open(session.videoUrl, '_blank')}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D91A1A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D91A1A] transition-colors">
                              <Video className="w-5 h-5 text-[#D91A1A] group-hover:text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#D91A1A]">{session.title}</h5>
                              <p className="text-[10px] text-[#6B6B6B] line-clamp-2 mt-1">{session.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-[#6B6B6B]">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
                                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="text-center py-12">
                       <Video className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-3" />
                       <p className="text-sm text-[#6B6B6B]">No recorded sessions available for this course.</p>
                     </div>
                   )}
                 </div>
               )}

               {activeTab === 'assignments' && (
                 <div className="p-4 space-y-4">
                   <div className="mb-4">
                     <h4 className="font-serif text-lg text-[#1A1A1A]">Assignments</h4>
                     <p className="text-xs text-[#6B6B6B]">Complete these tasks to earn your certificate.</p>
                   </div>

                   {assignments.length > 0 ? (
                     <div className="space-y-4">
                       {assignments.map((assignment) => {
                         const isExpired = new Date(assignment.dueDate) < new Date();
                         const hasSubmitted = assignment.userStatus === 'submitted' || assignment.userStatus === 'graded';
                         
                         return (
                           <div key={assignment._id} className="border border-[#1A1A1A]/5 rounded-sm p-4 bg-white shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                               <h5 className="font-medium text-[#1A1A1A]">{assignment.title}</h5>
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                 assignment.userStatus === 'graded' ? 'bg-green-100 text-green-700' :
                                 assignment.userStatus === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                 isExpired ? 'bg-red-100 text-red-700' : 'bg-[#EFEFDC] text-[#6B6B6B]'
                               }`}>
                                 {assignment.userStatus}
                               </span>
                             </div>
                             <p className="text-xs text-[#6B6B6B] line-clamp-2 mb-3">{assignment.description}</p>
                             
                             <div className="flex items-center justify-between mt-4">
                               <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B]">
                                 <Calendar className="w-3 h-3" />
                                 <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                               </div>

                               {assignment.userStatus === 'graded' ? (
                                 <Dialog>
                                   <DialogTrigger asChild>
                                     <Button variant="link" className="h-auto p-0 text-[#D91A1A] text-xs font-bold">
                                       View Grade: {assignment.userSubmission.grade}%
                                     </Button>
                                   </DialogTrigger>
                                   <DialogContent className="bg-[#F8F8F0]">
                                     <DialogHeader>
                                       <DialogTitle className="font-serif text-2xl">Assignment Result</DialogTitle>
                                     </DialogHeader>
                                     <div className="space-y-4 mt-4">
                                       <div className="bg-white p-4 rounded-lg border border-[#1A1A1A]/5">
                                         <p className="text-sm font-bold text-[#1A1A1A] mb-1">Your Submission</p>
                                         <p className="text-sm text-[#6B6B6B]">{assignment.userSubmission.textContent}</p>
                                       </div>
                                       <div className="bg-[#D91A1A]/5 p-4 rounded-lg border border-[#D91A1A]/10">
                                         <div className="flex justify-between items-center mb-2">
                                           <p className="text-sm font-bold text-[#D91A1A]">Instructor Feedback</p>
                                           <span className="text-lg font-bold text-[#D91A1A]">{assignment.userSubmission.grade}/100</span>
                                         </div>
                                         <p className="text-sm text-[#1A1A1A] italic">"{assignment.userSubmission.feedback}"</p>
                                       </div>
                                     </div>
                                   </DialogContent>
                                 </Dialog>
                               ) : hasSubmitted ? (
                                 <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> Submitted
                                 </span>
                               ) : isExpired ? (
                                 <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                   <X className="w-3 h-3" /> Expired
                                 </span>
                               ) : (
                                 <Dialog>
                                   <DialogTrigger asChild>
                                     <Button size="sm" className="bg-[#D91A1A] hover:bg-[#b81616] h-8 text-xs">
                                       Submit Task
                                     </Button>
                                   </DialogTrigger>
                                   <DialogContent className="bg-[#F8F8F0]">
                                     <DialogHeader>
                                       <DialogTitle className="font-serif text-2xl">Submit Assignment</DialogTitle>
                                     </DialogHeader>
                                     <div className="space-y-4 mt-4">
                                       <div className="space-y-2">
                                         <label className="text-sm font-medium">{assignment.title}</label>
                                         <Textarea 
                                           placeholder="Type your response here..."
                                           className="min-h-[150px] bg-white"
                                           onChange={(e) => setSubmissionData({ ...submissionData, textContent: e.target.value })}
                                         />
                                       </div>
                                       <div className="space-y-2">
                                         <label className="text-sm font-medium">External Link (optional)</label>
                                         <Input 
                                           placeholder="Link to your Google Doc, video, etc."
                                           className="bg-white"
                                           onChange={(e) => setSubmissionData({ ...submissionData, contentUrl: e.target.value })}
                                         />
                                       </div>
                                       <Button 
                                         className="w-full bg-[#D91A1A] hover:bg-[#b81616]"
                                         onClick={() => handleSubmitAssignment(assignment._id)}
                                         disabled={isSubmitting}
                                       >
                                         {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                         Send Submission
                                       </Button>
                                     </div>
                                   </DialogContent>
                                 </Dialog>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="text-center py-12">
                       <Pen className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-3" />
                       <p className="text-sm text-[#6B6B6B]">No assignments found for this course.</p>
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
      <ChatSystem 
        courseId={courseId || course.id} 
        courseTitle={language === 'en' ? course.title : course.titleFr} 
      />
    </div>
  );
}
