import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: t('nav.catalog'), href: '/library' },
    { label: t('nav.methodology'), href: '/#methodology' },
    { label: t('nav.tutor'), href: '/dashboard?tutor=true' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHome
          ? 'bg-transparent'
          : 'bg-[#F8F8F0]/90 backdrop-blur-md border-b border-[#1A1A1A]/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#D91A1A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-serif text-sm font-bold">F</span>
          </div>
          <span className={`font-serif text-lg font-medium ${isHome ? 'text-[#F8F8F0]' : 'text-[#1A1A1A]'}`}>
            Français Authentique
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors duration-300 hover:text-[#D91A1A] ${
                isHome ? 'text-[#F8F8F0]/80' : 'text-[#1A1A1A]/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <Link
            to="/dashboard"
            className="hidden md:block btn-primary text-sm"
          >
            {t('nav.start')}
          </Link>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className={`w-5 h-5 ${isHome ? 'text-[#F8F8F0]' : 'text-[#1A1A1A]'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${isHome ? 'text-[#F8F8F0]' : 'text-[#1A1A1A]'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F8F8F0]/95 backdrop-blur-lg border-t border-[#1A1A1A]/5 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block py-3 text-[#1A1A1A] font-medium border-b border-[#1A1A1A]/5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="block mt-4 btn-primary text-center"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.start')}
          </Link>
        </div>
      )}
    </nav>
  );
}
