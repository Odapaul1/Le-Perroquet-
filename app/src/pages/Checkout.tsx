import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { courseAPI, paymentAPI, enrollmentAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Star,
  Shield,
  Loader2,
  CheckCircle,
  ChevronRight,
  Lock,
  CreditCard,
  Users,
  Award,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const data = await courseAPI.getById(courseId);
        setCourse(data);
      } catch (err) {
        toast.error('Could not load course details.');
        navigate('/library');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const handleProceedToPayment = async () => {
    if (!courseId) return;
    setIsProcessing(true);
    try {
      const paymentData = await paymentAPI.initialize(courseId);

      if (paymentData.skipPayment) {
        // Already enrolled or payment disabled — go directly to lesson
        await enrollmentAPI.enroll(courseId).catch(() => {}); // ignore if already enrolled
        toast.success('You are already enrolled! Redirecting...');
        navigate(`/lesson/${courseId}`);
        return;
      }

      if (paymentData.authorization_url) {
        if (paymentData.mock) {
          // SPA navigation for mock mode
          try {
            const url = new URL(paymentData.authorization_url);
            navigate(`${url.pathname}${url.search}`);
          } catch {
            window.location.href = paymentData.authorization_url;
          }
        } else {
          // Real Paystack redirect
          window.location.href = paymentData.authorization_url;
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#D91A1A] animate-spin" />
          <p className="text-[#F8F8F0]/60 text-sm">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const courseTitle = language === 'en' ? course.title : (course.titleFr || course.title);
  const courseDesc = language === 'en' ? course.description : (course.descriptionFr || course.description);

  const benefits = [
    { icon: Zap, text: 'Instant access to all lessons' },
    { icon: Clock, text: `${course.duration} of content` },
    { icon: BookOpen, text: `${course.modules?.length || 0} comprehensive modules` },
    { icon: Award, text: 'Certificate of completion' },
    { icon: Users, text: 'Access to live sessions' },
    { icon: Shield, text: '30-day satisfaction guarantee' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F8F8F0]">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/library"
            className="flex items-center gap-2 text-sm text-[#F8F8F0]/60 hover:text-[#F8F8F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#F8F8F0]/40">
            <Lock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400/80">Secured Checkout</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-[#F8F8F0]/30">
          <span>Library</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#F8F8F0]/60">{courseTitle}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#D91A1A]">Checkout</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* LEFT — Course Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Course Banner */}
          <div className="relative rounded-xl overflow-hidden aspect-video">
            <img
              src={course.thumbnail || course.image}
              alt={courseTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Level + Price overlay */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  course.level === 'beginner'
                    ? 'bg-green-500/90 text-white'
                    : course.level === 'intermediate'
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-[#D91A1A]/90 text-white'
                }`}
              >
                {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
              </span>
            </div>

            {/* Course title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[#F8F8F0]/60 text-xs uppercase tracking-widest mb-1">{course.category}</p>
              <h1 className="font-serif text-2xl text-[#F8F8F0] leading-tight">{courseTitle}</h1>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="font-semibold text-[#F8F8F0] mb-3 text-sm uppercase tracking-wider">About this course</h2>
            <p className="text-[#F8F8F0]/70 text-sm leading-relaxed">{courseDesc}</p>
          </div>

          {/* What you get */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/5">
            <h2 className="font-semibold text-[#F8F8F0] mb-4 text-sm uppercase tracking-wider">What's included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D91A1A]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#D91A1A]" />
                  </div>
                  <span className="text-sm text-[#F8F8F0]/70">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
              <h2 className="font-semibold text-[#F8F8F0] mb-3 text-sm uppercase tracking-wider">Your Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#D91A1A]/20 flex items-center justify-center flex-shrink-0 text-[#D91A1A] font-bold text-xl">
                  {typeof course.instructor === 'string'
                    ? course.instructor[0]?.toUpperCase()
                    : (course.instructor?.firstName?.[0] || 'I')}
                </div>
                <div>
                  <p className="font-medium text-[#F8F8F0]">
                    {typeof course.instructor === 'string'
                      ? course.instructor
                      : `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() || 'Expert Instructor'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 text-amber-400" fill="currentColor" />
                    ))}
                    <span className="text-xs text-[#F8F8F0]/40 ml-1">5.0 Instructor Rating</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Payment Card */}
        <div className="lg:col-span-2 sticky top-20">
          <div className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Price header */}
            <div className="bg-gradient-to-br from-[#D91A1A]/20 to-[#001B71]/20 p-6 border-b border-white/5">
              <div className="flex items-end gap-2 mb-1">
                <span className="font-serif text-5xl font-bold text-[#F8F8F0]">
                  {course.price ? `₦${course.price.toLocaleString()}` : 'Free'}
                </span>
              </div>
              <p className="text-[#F8F8F0]/40 text-xs">One-time payment · Lifetime access</p>
            </div>

            {/* Order summary */}
            <div className="p-6 border-b border-white/5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-[#F8F8F0]/40 mb-3">Order Summary</h3>

              <div className="flex items-start gap-3">
                <img
                  src={course.thumbnail || course.image}
                  alt=""
                  className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F8F8F0] leading-tight">{courseTitle}</p>
                  <p className="text-xs text-[#F8F8F0]/40 mt-0.5">{course.level} · {course.duration}</p>
                </div>
                <span className="text-sm font-semibold text-[#F8F8F0] flex-shrink-0">
                  {course.price ? `₦${course.price.toLocaleString()}` : 'Free'}
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between">
                <span className="text-sm text-[#F8F8F0]/60">Total</span>
                <span className="text-sm font-bold text-[#F8F8F0]">
                  {course.price ? `₦${course.price.toLocaleString()}` : 'Free'}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 space-y-4">
              {/* Enrolled as */}
              {user && (
                <div className="flex items-center gap-2 text-xs text-[#F8F8F0]/40">
                  <div className="w-6 h-6 rounded-full bg-[#D91A1A]/20 flex items-center justify-center text-[#D91A1A] text-xs font-bold">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span>Enrolling as <span className="text-[#F8F8F0]/70">{user.email}</span></span>
                </div>
              )}

              <button
                id="checkout-proceed-btn"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-[#D91A1A] hover:bg-[#b81616] text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D91A1A]/20 hover:shadow-[#D91A1A]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {course.price ? 'Proceed to Payment' : 'Enroll for Free'}
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="space-y-2 pt-1">
                {[
                  'Secure 256-bit SSL encryption',
                  '30-day money-back guarantee',
                  'Instant access after payment',
                ].map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-xs text-[#F8F8F0]/40">{g}</span>
                  </div>
                ))}
              </div>

              {/* Payment logos */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs text-[#F8F8F0]/20 text-center mb-2">We accept</p>
                <div className="flex items-center justify-center gap-3">
                  {['VISA', 'MC', 'Verve', 'Paystack'].map((brand) => (
                    <span
                      key={brand}
                      className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-[#F8F8F0]/30 border border-white/5"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
