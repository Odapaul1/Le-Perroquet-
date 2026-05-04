import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { notificationAPI } from '@/services/api';
import { 
  Bell, 
  CheckCircle2, 
  FileText, 
  GraduationCap,
  Circle
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export const NotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications
    const fetchNotifications = async () => {
      try {
        const data = await notificationAPI.getAll();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();

    // Socket.IO for real-time notifications
    socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api', '') || 'http://localhost:5001');
    socketRef.current.emit('join_private', { userId: user._id });

    socketRef.current.on('new_notification', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast(notification.title, {
        description: notification.message,
        action: {
          label: 'View',
          onClick: () => navigate(notification.link)
        }
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'grade': return <GraduationCap className="w-4 h-4 text-green-500" />;
      case 'submission': return <CheckCircle2 className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-[#D91A1A]" />;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#1A1A1A]/70" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D91A1A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F8F8F0]">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border-[#1A1A1A]/5 shadow-xl p-0 overflow-hidden">
        <div className="p-4 bg-[#1A1A1A] text-white flex justify-between items-center">
          <h3 className="text-sm font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] uppercase tracking-widest font-bold hover:text-[#D91A1A] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto bg-[#F8F8F0]/50">
          {notifications.length === 0 ? (
            <div className="p-12 text-center opacity-30">
              <Bell className="w-12 h-12 mx-auto mb-3" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n._id}
                className={`p-4 border-b border-[#1A1A1A]/5 flex gap-3 items-start cursor-pointer transition-colors ${!n.isRead ? 'bg-white' : 'opacity-60'}`}
                onClick={() => {
                  if (!n.isRead) handleMarkAsRead(n._id);
                  navigate(n.link);
                }}
              >
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-bold ${!n.isRead ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>{n.title}</p>
                    {!n.isRead && <Circle className="w-2 h-2 fill-[#D91A1A] text-[#D91A1A]" />}
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">{n.message}</p>
                  <p className="text-[9px] text-[#6B6B6B]/50 uppercase tracking-tighter">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
