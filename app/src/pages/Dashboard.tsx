import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { enrollmentAPI, gamificationAPI } from '@/services/api';
import { Certificate } from '@/components/Certificate';
import GamificationStats from '@/components/gamification/GamificationStats';
import Leaderboard from '@/components/gamification/Leaderboard';
import { courses, achievements, type ChatMessage } from '@/data/courses';
import {
  Flame,
  Star,
  BookOpen,
  Trophy,
  Play,
  Clock,
  ChevronRight,
  Send,
  Sparkles,
  User,
  Download,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ChatSystem } from '@/components/ChatSystem';

function ProgressCard({ icon: Icon, label, value, color }: { icon: typeof Flame; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-sm p-5 border border-[#1A1A1A]/5 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-serif font-semibold text-[#1A1A1A]">{value}</p>
      <p className="text-[#6B6B6B] text-sm">{label}</p>
    </div>
  );
}

function MyCourses() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await enrollmentAPI.getMyEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (isLoading) return <div className="py-12 text-center">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#1A1A1A]">My Courses</h2>
      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((e) => (
            <div key={e._id} className="bg-white rounded-sm border border-[#1A1A1A]/5 overflow-hidden">
              <div className="relative h-32">
                <img src={e.course?.thumbnail || '/images/course-1.jpg'} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-serif text-lg text-[#F8F8F0]">{e.course?.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B6B6B]">{e.progress}% {t('dashboard.progress')}</span>
                  {e.status === 'completed' && (
                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-[#EFEFDC] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#001B71] rounded-full transition-all duration-500"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/lesson/${e.courseId}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#D91A1A] text-white rounded-sm text-sm font-medium hover:bg-[#b81616] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" fill="white" />
                    {e.status === 'completed' ? 'Review' : 'Continue'}
                  </Link>
                  {e.status === 'completed' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="px-3 py-2 border border-[#1A1A1A]/10 rounded-sm hover:bg-[#1A1A1A]/5 transition-colors">
                          <Download className="w-4 h-4 text-[#1A1A1A]" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#F8F8F0]">
                        <Certificate 
                          userName={`${user?.firstName} ${user?.lastName}`}
                          courseTitle={e.course?.title}
                          completionDate={new Date(e.completedAt).toLocaleDateString()}
                          certificateId={`CERT-${e._id}`}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-dashed border-[#1A1A1A]/20 p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-4" />
          <p className="text-[#6B6B6B] mb-6">You are not enrolled in any courses yet.</p>
          <Link 
            to="/library" 
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1A1A1A] text-white rounded-sm font-medium hover:bg-[#333] transition-colors"
          >
            Explore Library
          </Link>
        </div>
      )}
    </div>
  );
}

function AITutorPanel() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: t('tutor.greeting'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Excellent question! In French, we use the subjunctive mood to express doubt, possibility, or emotion. Let me explain...",
        "Très bien! Your pronunciation is improving. Remember to nasalize the 'on' sound in 'bonjour'. Try saying it with me:",
        "That's a common mistake! The verb 'être' is irregular. Here's the conjugation: je suis, tu es, il/elle est...",
        "Great effort! In formal French, you'd say 'Comment allez-vous?' but with friends, 'Ça va?' is perfectly fine.",
      ];
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-sm border border-[#1A1A1A]/5 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-[#1A1A1A]/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#D91A1A] flex items-center justify-center pulse-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-[#1A1A1A] text-sm">{t('nav.ai_tutor')}</p>
          <p className="text-xs text-[#6B6B6B]">{isTyping ? t('tutor.typing') : 'Online'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'ai' ? 'bg-[#D91A1A]' : 'bg-[#EFEFDC]'
            }`}>
              {msg.role === 'ai' ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-[#1A1A1A]" />
              )}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'ai'
                ? 'bg-[#EFEFDC] text-[#1A1A1A]'
                : 'bg-[#D91A1A] text-white'
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1A1A1A]/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('tutor.placeholder')}
            className="flex-1 px-4 py-2.5 bg-[#EFEFDC] rounded-sm text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B]/50 focus:outline-none focus:ring-2 focus:ring-[#D91A1A]/20"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 bg-[#D91A1A] rounded-sm flex items-center justify-center hover:bg-[#b81616] transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AchievementsSection() {
  const { language, t } = useLanguage();
  const icons: Record<string, typeof Trophy> = {
    Footprints: BookOpen,
    Flame: Flame,
    BookOpen: BookOpen,
    Award: Trophy,
    MessageCircle: Star,
  };

  return (
    <div className="bg-white rounded-sm border border-[#1A1A1A]/5 p-6">
      <h3 className="font-serif text-xl text-[#1A1A1A] mb-4">{t('dashboard.achievements')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((ach) => {
          const Icon = icons[ach.icon] || Trophy;
          return (
            <div
              key={ach.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                ach.unlocked
                  ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5'
                  : 'border-[#1A1A1A]/5 bg-[#EFEFDC]/50 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ach.unlocked ? 'bg-[#D4AF37]' : 'bg-[#1A1A1A]/10'
              }`}>
                <Icon className={`w-5 h-5 ${ach.unlocked ? 'text-white' : 'text-[#1A1A1A]/30'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {language === 'en' ? ach.title : ach.titleFr}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  {language === 'en' ? ach.description : ach.descriptionFr}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const showTutor = searchParams.get('tutor') === 'true';
  const mainRef = useRef<HTMLDivElement>(null);

  const [gamificationStatus, setGamificationStatus] = useState<any>(null);
  const [loadingGamification, setLoadingGamification] = useState(true);

  useEffect(() => {
    const fetchGamificationStatus = async () => {
      try {
        const status = await gamificationAPI.getStatus();
        setGamificationStatus(status);
      } catch (error) {
        console.error('Failed to fetch gamification status:', error);
      } finally {
        setLoadingGamification(false);
      }
    };
    fetchGamificationStatus();
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        <div ref={mainRef} className="p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-[#1A1A1A] mb-1">
              {t('dashboard.welcome')}, {user?.firstName}
            </h1>
            <p className="text-[#6B6B6B]">
              {language === 'en' ? 'Here is your learning progress today' : 'Voici votre progression d\'apprentissage aujourd\'hui'}
            </p>
          </div>

          {/* Gamification Stats */}
          {!loadingGamification && gamificationStatus && (
            <div className="mb-8">
              <GamificationStats 
                points={gamificationStatus.points} 
                level={gamificationStatus.level} 
                achievements={gamificationStatus.achievements}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              {showTutor ? <AITutorPanel /> : <MyCourses />}
              {/* Achievements */}
              <AchievementsSection />
            </div>
            
            <div className="space-y-6">
              {/* Leaderboard */}
              <Leaderboard />

              {/* Recommended */}
              <div className="bg-white rounded-sm border border-[#1A1A1A]/5 p-6">
                <h3 className="font-serif text-xl text-[#1A1A1A] mb-4">{t('dashboard.recommended')}</h3>
                <div className="space-y-3">
                  {courses.slice(1, 4).map((course) => (
                    <Link
                      key={course.id}
                      to={`/lesson/${course.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#EFEFDC] transition-colors group"
                    >
                      <img src={course.image} alt="" className="w-16 h-12 rounded-sm object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">
                          {language === 'en' ? course.title : course.titleFr}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration} {t('library.duration')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                            course.level === 'intermediate' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' :
                            'bg-[#D91A1A]/10 text-[#D91A1A]'
                          }`}>
                            {t(`library.${course.level}`)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D91A1A] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ChatSystem />
    </div>
  );
}
