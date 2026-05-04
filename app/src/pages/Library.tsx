import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { courses } from '@/data/courses';
import { Link, useNavigate } from 'react-router';
import { paymentAPI, enrollmentAPI } from '@/services/api';
import {
  Search,
  Clock,
  Play,
  Filter,
  CreditCard,
  Loader2,
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
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setEnrollingId(courseId);
    try {
      // Initialize payment
      const paymentData = await paymentAPI.initialize(courseId);
      
      if (paymentData.skipPayment) {
        // Direct enrollment if payment is disabled
        await enrollmentAPI.enroll(courseId);
        toast.success('Successfully enrolled!');
        navigate('/dashboard');
      } else if (paymentData.authorization_url) {
        // Redirect to Paystack (or mock)
        window.location.href = paymentData.authorization_url;
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to initialize enrollment. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = activeFilter === 'all' || course.level === activeFilter;
    const matchesSearch = searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.titleFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [activeFilter, searchQuery]);

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
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative aspect-square rounded-sm overflow-hidden bg-[#1A1A1A] cursor-pointer"
                onClick={() => navigate(`/lesson/${course.id}`)}
              >
                <img
                  src={course.image}
                  alt={language === 'en' ? course.title : course.titleFr}
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
                    $49.99
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-[#F8F8F0]/60 text-xs uppercase tracking-wider mb-1 block">
                    {language === 'en' ? course.category : course.categoryFr}
                  </span>
                  <h3 className="font-serif text-xl text-[#F8F8F0] mb-2 leading-tight">
                    {language === 'en' ? course.title : course.titleFr}
                  </h3>
                  <div className="flex items-center gap-3 text-[#F8F8F0]/50 text-xs mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration} {t('library.duration')}
                    </span>
                    <span>{course.totalLessons} {t('dashboard.completed').toLowerCase()}</span>
                  </div>

                  <button
                    onClick={(e) => handleEnroll(course.id, e)}
                    disabled={enrollingId === course.id}
                    className="w-full py-2 bg-[#D91A1A] text-white rounded-sm text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#b81616] transition-colors disabled:bg-gray-500"
                  >
                    {enrollingId === course.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {enrollingId === course.id ? 'Processing...' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
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
