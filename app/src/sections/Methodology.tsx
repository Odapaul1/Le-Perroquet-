import { useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    image: '/images/pillar-1.jpg',
    titleKey: 'method.pillar1.title',
    descKey: 'method.pillar1.desc',
  },
  {
    image: '/images/pillar-2.jpg',
    titleKey: 'method.pillar2.title',
    descKey: 'method.pillar2.desc',
  },
  {
    image: '/images/pillar-3.jpg',
    titleKey: 'method.pillar3.title',
    descKey: 'method.pillar3.desc',
  },
];

export function Methodology() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      '.method-text',
      { x: -40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="methodology"
      className="py-24 md:py-32 bg-[#F8F8F0]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="method-text">
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] leading-tight mb-6">
              {t('method.title')}
            </h2>
            <p className="text-[#6B6B6B] text-lg leading-relaxed">
              {t('method.subtitle')}
            </p>
          </div>

          {/* Right: Accordion */}
          <div
            className="flex gap-4 h-[400px] cursor-pointer"
            onMouseLeave={() => setActiveIndex(null)}
          >
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-sm transition-all duration-700 ease-smooth ${
                  activeIndex === null
                    ? 'flex-1'
                    : activeIndex === index
                    ? 'flex-[4]'
                    : 'flex-[0.5]'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-smooth"
                  style={{
                    backgroundImage: `url(${pillar.image})`,
                    transform: activeIndex === index ? 'scale(1)' : 'scale(1.1)',
                  }}
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Animated Border */}
                <div
                  className={`absolute top-8 bottom-8 left-0 w-px bg-white/30 transition-transform duration-700 ease-smooth origin-center ${
                    activeIndex === index ? 'scale-y-100' : 'scale-y-0'
                  }`}
                />

                {/* Content */}
                <div className="absolute bottom-8 left-8 right-8 z-10 text-[#F8F8F0]" style={{ mixBlendMode: 'difference' }}>
                  <h3
                    className={`font-serif text-2xl md:text-3xl transition-opacity duration-400 ${
                      activeIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {t(pillar.titleKey)}
                  </h3>
                  <p
                    className={`font-sans text-sm mt-2 transition-all duration-700 ease-smooth ${
                      activeIndex === index
                        ? 'opacity-100 max-h-[200px]'
                        : 'opacity-0 max-h-0'
                    } overflow-hidden`}
                  >
                    {t(pillar.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
