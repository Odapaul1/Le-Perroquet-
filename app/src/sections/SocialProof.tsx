import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { users } from '@/data/courses';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function SocialProof() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [rotationOffset, setRotationOffset] = useState(0);
  const isDragging = useRef(false);

  useEffect(() => {
    let animationFrameId: number;

    function animate() {
      if (!isDragging.current) {
        setRotationOffset(prev => prev + 0.15);
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setRotationOffset(prev => prev + e.movementX * 0.3);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const totalItems = users.length;
  const radius = 220;

  useGSAP(() => {
    gsap.fromTo(
      '.social-title',
      { y: 30, opacity: 0 },
      {
        y: 0,
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
      className="py-24 md:py-32 bg-[#1A1A1A] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="social-title font-serif text-3xl md:text-4xl text-[#F8F8F0] mb-16">
          {t('social.title')}
        </h2>

        {/* Orbital Avatar System */}
        <div
          className="relative w-full h-[350px] md:h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {users.map((user, index) => {
            const angle = ((360 / totalItems) * index + rotationOffset) * (Math.PI / 180);
            const x = Math.sin(angle) * radius;
            const y = Math.cos(angle) * 50;
            const normalizedAngle = ((360 / totalItems) * index + rotationOffset) % 360;
            const isFront = normalizedAngle > 270 || normalizedAngle < 90;
            const scale = isFront ? 1.15 : 0.85;
            const opacity = isFront ? 1 : 0.5;

            return (
              <div
                key={user.id}
                className="absolute transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  zIndex: isFront ? 10 : 1,
                  opacity,
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#F8F8F0]/30 object-cover shadow-lg"
                    draggable={false}
                  />
                  <span className={`text-xs text-[#F8F8F0]/70 font-medium whitespace-nowrap transition-opacity duration-300 ${isFront ? 'opacity-100' : 'opacity-0'}`}>
                    {user.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="font-serif text-5xl md:text-6xl text-[#F8F8F0]/10 font-bold">100K+</p>
            </div>
          </div>
        </div>

        <p className="text-[#F8F8F0]/40 text-sm mt-8">
          {t('hero.learners')} • {t('hero.rating')}: 4.9/5
        </p>
      </div>
    </section>
  );
}
