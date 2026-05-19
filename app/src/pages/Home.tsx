import { Navigation } from '@/components/Navigation';
import { Hero } from '@/sections/Hero';
import { Methodology } from '@/sections/Methodology';
import { SocialProof } from '@/sections/SocialProof';
import { Link, useNavigate } from 'react-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BookOpen, MessageCircle, Award, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { enrollmentAPI, courseAPI } from '@/services/api';

function Features() {
  const { language, t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: 'Immersive Video Lessons',
      titleFr: 'Leçons Vidéo Immersives',
      desc: 'Cinematic scenarios filmed in real French locations. Learn by watching, listening, and doing.',
      descFr: 'Scénarios cinématiques filmés dans de vrais lieux français. Apprenez en regardant, écoutant et faisant.',
    },
    {
      icon: MessageCircle,
      title: 'AI Conversation Partner',
      titleFr: 'Partenaire de Conversation IA',
      desc: 'Practice real-time French conversations with our AI tutor. Get instant feedback on pronunciation and grammar.',
      descFr: 'Pratiquez des conversations en français en temps réel avec notre tuteur IA. Recevez des retours instantanés.',
    },
    {
      icon: Award,
      title: 'Cultural Certification',
      titleFr: 'Certification Culturelle',
      desc: 'Earn certificates recognized by employers. From DELF preparation to business French mastery.',
      descFr: 'Obtenez des certificats reconnus par les employeurs. De la préparation au DELF à la maîtrise du français des affaires.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Learning Path',
      titleFr: 'Parcours d\'Apprentissage Personnalisé',
      desc: 'Our AI adapts to your pace, strengths, and goals. Every lesson is tailored just for you.',
      descFr: 'Notre IA s\'adapte à votre rythme, vos forces et vos objectifs. Chaque leçon est adaptée pour vous.',
    },
  ];

  return (
    <section className="py-24 bg-[#F8F8F0]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
            {t('home.why_choose')}
          </h2>
          <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto">
            {t('home.comprehensive')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group bg-white rounded-sm p-6 border border-[#1A1A1A]/5 hover:border-[#D91A1A]/20 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full bg-[#D91A1A]/10 flex items-center justify-center mb-4 group-hover:bg-[#D91A1A]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#D91A1A]" />
                </div>
                <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">
                  {language === 'en' ? feature.title : feature.titleFr}
                </h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed">
                  {language === 'en' ? feature.desc : feature.descFr}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PreviewCourses() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userEnrollments, setUserEnrollments] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseAPI.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (user) {
        try {
          const enrollments = await enrollmentAPI.getMyEnrollments();
          setUserEnrollments(enrollments.map((e: any) => e.courseId?._id || e.courseId));
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
        }
      }
    };
    fetchEnrollments();
  }, [user]);

  return (
    <section className="py-24 bg-[#EFEFDC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
              {t('home.popular')}
            </h2>
            <p className="text-[#6B6B6B] text-lg">
              {t('home.start_journey')}
            </p>
          </div>
          <Link
            to="/library"
            className="hidden md:flex items-center gap-2 text-[#D91A1A] font-medium hover:gap-3 transition-all"
          >
            {t('nav.library')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-[#D91A1A] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course._id || course.id}
                onClick={() => {
                  const courseId = course._id || course.id;
                  if (userEnrollments.includes(courseId)) {
                    navigate(`/lesson/${courseId}`);
                  } else {
                    navigate('/library');
                  }
                }}
                className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer"
              >
                <img
                  src={course.thumbnail || course.image}
                  alt={language === 'en' ? course.title : (course.titleFr || course.title)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${
                    course.level === 'beginner'
                      ? 'bg-green-500/80 text-white'
                      : course.level === 'intermediate'
                      ? 'bg-[#D4AF37]/80 text-white'
                      : 'bg-[#D91A1A]/80 text-white'
                  }`}>
                    {t(`library.${course.level}`)}
                  </span>
                  <h3 className="font-serif text-xl text-[#F8F8F0] mb-1">
                    {language === 'en' ? course.title : (course.titleFr || course.title)}
                  </h3>
                  <p className="text-[#F8F8F0]/60 text-sm">
                    {course.duration} {t('library.duration')} • {course.modules?.length || 0} {t('library.modules') || 'Modules'}
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#D91A1A] flex items-center justify-center shadow-lg">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#1A1A1A] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#D91A1A] flex items-center justify-center">
                <span className="text-white font-serif text-sm font-bold">F</span>
              </div>
              <span className="font-serif text-lg text-[#F8F8F0]">Français Authentique</span>
            </div>
            <p className="text-[#F8F8F0]/50 text-sm leading-relaxed">
              {t('home.footer_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-[#F8F8F0] mb-4">{t('home.footer_learn')}</h4>
            <ul className="space-y-2 text-sm text-[#F8F8F0]/50">
              <li><Link to="/library" className="hover:text-[#D91A1A] transition-colors">{t('nav.library')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#D91A1A] transition-colors">{t('nav.dashboard')}</Link></li>
              <li><Link to="/vocabulary" className="hover:text-[#D91A1A] transition-colors">{t('nav.vocabulary')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#F8F8F0] mb-4">{t('home.footer_community')}</h4>
            <ul className="space-y-2 text-sm text-[#F8F8F0]/50">
              <li>{language === 'en' ? 'Student Forum' : 'Forum Étudiant'}</li>
              <li>{language === 'en' ? 'Success Stories' : 'Témoignages'}</li>
              <li>{language === 'en' ? 'Events' : 'Événements'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#F8F8F0] mb-4">{t('home.footer_support')}</h4>
            <ul className="space-y-2 text-sm text-[#F8F8F0]/50">
              <li>{language === 'en' ? 'Help Center' : 'Centre d\'Aide'}</li>
              <li>{language === 'en' ? 'Contact Us' : 'Contactez-Nous'}</li>
              <li>{language === 'en' ? 'Privacy Policy' : 'Politique de Confidentialité'}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#F8F8F0]/10 pt-8 text-center text-[#F8F8F0]/30 text-sm">
          © 2025 Français Authentique. {t('home.rights')}
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      <Navigation />
      <Hero />
      <Methodology />
      <Features />
      <PreviewCourses />
      <SocialProof />
      <Footer />
    </div>
  );
}
