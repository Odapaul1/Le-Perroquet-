import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { courseAPI, enrollmentAPI } from '@/services/api';
import {
  Search,
  Clock,
  Filter,
  CreditCard,
  Loader2,
  Play,
} from 'lucide-react';
import gsap from 'gsap';
import { toast } from 'sonner';

const filters = ['all', 'beginner', 'intermediate', 'advanced', 'grammar'] as const;
type FilterType = typeof filters[number];

export default function Library() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [userEnrollments, setUserEnrollments] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseAPI.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('Failed to load courses. Please try again later.');
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
          setUserEnrollments(enrollments.map((e: any) => (e.courseId?._id || e.courseId)?.toString()));
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
        }
      }
    };
    fetchEnrollments();
  }, [user]);

  const handleEnroll = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    // Navigate to the dedicated checkout page
    navigate(`/checkout/${courseId}`);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = activeFilter === 'all' || course.level === activeFilter;
    const title = language === 'en' ? course.title : (course.titleFr || course.title);
    const description = language === 'en' ? course.description : (course.descriptionFr || course.description);
    
    const matchesSearch = searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (gridRef.current && !isLoading) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [activeFilter, searchQuery, isLoading]);

  return (
    <div className="min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="ml-[280px] min-h-screen">
        {/* Header */}
        <div className="bg-[#1A1A1A] pt-8 pb-12 px-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D91A1A] via-[#001B71] to-[#D4AF37]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#D91A1A]/5 to-transparent" />
          
          <div className="relative max-w-6xl">
            <h1 className="font-serif text-4xl text-[#F8F8F0] mb-6">{t('library.title')}</h1>
            
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F8F8F0]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('library.search')}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-sm text-[#F8F8F0] placeholder:text-[#F8F8F0]/40 focus:outline-none focus:border-[#D91A1A]/50 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-8 max-w-6xl">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Filter className="w-4 h-4 text-[#6B6B6B]" />
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-[#D91A1A] text-white'
                    : 'bg-white text-[#1A1A1A]/70 hover:bg-[#EFEFDC] border border-[#1A1A1A]/10'
                }`}
              >
                {t(`library.${filter}`)}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#D91A1A] animate-spin mb-4" />
              <p className="text-[#6B6B6B]">{t('auth.loading') || 'Loading courses...'}</p>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="group relative aspect-square rounded-sm overflow-hidden bg-[#1A1A1A] cursor-pointer border border-[#1A1A1A]/5 hover:border-[#D91A1A]/20 transition-all duration-500 hover:shadow-2xl"
                  onClick={(e) => {
                    const courseId = (course._id || course.id)?.toString();
                    const isEnrolled = userEnrollments.some(id => id === courseId);
                    if (isEnrolled) {
                      navigate(`/lesson/${courseId}`);
                    } else {
                      handleEnroll(courseId, e);
                    }
                  }}
                >
                  <img
                    src={course.thumbnail || course.image}
                    alt={language === 'en' ? course.title : (course.titleFr || course.title)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      course.level === 'beginner'
                        ? 'bg-green-500/80 text-white'
                        : course.level === 'intermediate'
                        ? 'bg-[#D4AF37]/80 text-white'
                        : course.level === 'advanced'
                        ? 'bg-[#D91A1A]/80 text-white'
                        : 'bg-[#001B71]/80 text-white'
                    }`}>
                      {t(`library.${course.level}`)}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-3 py-1 text-sm font-bold rounded-sm shadow-lg">
                      {course.price ? `₦${course.price}` : 'Free'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-[#F8F8F0]/60 text-xs uppercase tracking-wider mb-1 block">
                      {language === 'en' ? course.category : (course.categoryFr || course.category)}
                    </span>
                    <h3 className="font-serif text-xl text-[#F8F8F0] mb-2 leading-tight">
                      {language === 'en' ? course.title : (course.titleFr || course.title)}
                    </h3>
                    <div className="flex items-center gap-3 text-[#F8F8F0]/50 text-xs mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration} {t('library.duration')}
                      </span>
                      <span>{course.modules?.length || 0} {t('library.modules') || 'Modules'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        const courseId = (course._id || course.id)?.toString();
                        const isEnrolled = userEnrollments.some(id => id === courseId);
                        if (isEnrolled) {
                          e.stopPropagation();
                          navigate(`/lesson/${courseId}`);
                        } else {
                          handleEnroll(courseId, e);
                        }
                      }}
                      className={`w-full py-2 rounded-sm text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        userEnrollments.some(id => id === (course._id || course.id)?.toString())
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-[#D91A1A] hover:bg-[#b81616] text-white'
                      }`}
                    >
                      {userEnrollments.some(id => id === (course._id || course.id)?.toString()) ? (
                        <Play className="w-4 h-4" fill="currentColor" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      {userEnrollments.some(id => id === (course._id || course.id)?.toString())
                        ? 'Start Lesson'
                        : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#6B6B6B] text-lg">
                {language === 'en' ? 'No courses found matching your criteria.' : 'Aucun cours ne correspond à vos critères.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
