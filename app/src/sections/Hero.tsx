import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Users, Video, Star } from 'lucide-react';
import gsap from 'gsap';

export function Hero() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );
      gsap.fromTo(
        statsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.8 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Users, value: '100K+', label: t('hero.learners') },
    { icon: Video, value: '500+', label: t('hero.lessons') },
    { icon: Star, value: '4.9', label: t('hero.rating') },
  ];

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl">
          <h1
            ref={titleRef}
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#F8F8F0] leading-[1.1] tracking-tight mb-6"
          >
            {t('hero.title')}
          </h1>
          <p className="text-[#F8F8F0]/70 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Play Button */}
          <button className="group flex items-center gap-4 mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#F8F8F0]/40 flex items-center justify-center transition-all duration-500 group-hover:border-[#D91A1A] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(217,26,26,0.3)]">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-[#F8F8F0] ml-1 transition-colors group-hover:text-[#D91A1A]" fill="currentColor" />
            </div>
            <span className="text-[#F8F8F0]/80 text-sm font-medium tracking-wide uppercase">
              {t('hero.play')}
            </span>
          </button>
        </div>

        {/* Stats Bar */}
        <div
          ref={statsRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-5 flex items-center justify-around">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D91A1A]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#D91A1A]" />
                  </div>
                  <div>
                    <p className="text-[#F8F8F0] font-serif text-lg font-semibold">{stat.value}</p>
                    <p className="text-[#F8F8F0]/60 text-xs">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
