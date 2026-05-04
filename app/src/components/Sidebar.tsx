import { Link, useLocation } from 'react-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { NotificationSystem } from './NotificationSystem';
import { gamificationAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Library,
  Settings,
  LogOut,
  Flame,
  Star,
  Users,
  Video,
  FileText,
  Plus,
  Pen,
  BarChart3,
  Trophy,
} from 'lucide-react';

export function Sidebar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [gamification, setGamification] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'learner') {
      const fetchStatus = async () => {
        try {
          const status = await gamificationAPI.getStatus();
          setGamification(status);
        } catch (error) {
          console.error('Failed to fetch gamification in sidebar:', error);
        }
      };
      fetchStatus();
    }
  }, [user]);

  const getNavItems = () => {
    const common = [
      { icon: LayoutDashboard, label: t('nav.dashboard'), href: '/dashboard' },
    ];

    if (user?.role === 'admin') {
      return [
        ...common,
        { icon: Users, label: 'User Management', href: '/admin/users' },
        { icon: BookOpen, label: 'Course Management', href: '/admin/courses' },
        { icon: BarChart3, label: 'Revenue & Stats', href: '/admin/stats' },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...common,
        { icon: Video, label: 'My Courses', href: '/instructor/dashboard' },
        { icon: Plus, label: 'Recorded Sessions', href: '/instructor/sessions' },
        { icon: Pen, label: 'Assignments', href: '/instructor/assignments' },
        { icon: FileText, label: 'Grading Center', href: '/instructor/grading' },
      ];
    }

    // Learner (Default)
    return [
      ...common,
      { icon: BookOpen, label: t('nav.library'), href: '/library' },
      { icon: MessageCircle, label: t('nav.ai_tutor'), href: '/dashboard?tutor=true' },
      { icon: Library, label: t('nav.vocabulary'), href: '/vocabulary' },
    ];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return location.pathname === href.split('?')[0] && location.search === '?' + href.split('?')[1];
    }
    return location.pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#EFEFDC] border-r border-[#1A1A1A]/5 flex flex-col z-40">
      {/* User Profile */}
      <div className="p-6 border-b border-[#1A1A1A]/5">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D91A1A] flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">F</span>
            </div>
            <span className="font-serif text-lg font-medium text-[#1A1A1A]">
              Français Authentique
            </span>
          </Link>
          <NotificationSystem />
        </div>

        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "/images/avatar-1.jpg"}
            alt="User"
            className="w-12 h-12 rounded-full object-cover border-2 border-[#D91A1A]/20"
          />
          <div>
            <p className="font-medium text-[#1A1A1A]">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</p>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1 text-[#D91A1A]">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">12 {t('dashboard.streak')}</span>
              </div>
              {gamification && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Trophy className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Lvl {gamification.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Star className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{gamification.points} XP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user?.role === 'learner' && gamification && (
          <div className="mt-4 p-3 bg-white/50 rounded-sm border border-[#1A1A1A]/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#6B6B6B] uppercase font-bold tracking-wider">Next Level</span>
              <span className="text-[10px] text-[#6B6B6B] font-bold">{gamification.points % 500}/500</span>
            </div>
            <div className="w-full h-1 bg-[#EFEFDC] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D91A1A] transition-all duration-500" 
                style={{ width: `${(gamification.points % 500) / 5}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 mb-1 ${
                active
                  ? 'bg-[#D91A1A]/10 text-[#D91A1A]'
                  : 'text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-[#1A1A1A]/5 space-y-2">
        <div className="px-4 py-2">
          <LanguageToggle />
        </div>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 transition-all duration-300 w-full">
          <Settings className="w-5 h-5" />
          {t('nav.settings')}
        </button>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 transition-all duration-300 w-full"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
