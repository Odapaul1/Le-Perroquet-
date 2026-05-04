import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, X, Users, User, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  fromUserId?: string; // For DMs
  fromUserName?: string; // For DMs
}

interface ChatSystemProps {
  courseId?: string;
  courseTitle?: string;
  recipientId?: string;
  recipientName?: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ 
  courseId, 
  courseTitle, 
  recipientId, 
  recipientName 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO server
    socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api', '') || 'http://localhost:5001');

    if (courseId) {
      socketRef.current.emit('join_course', { courseId, userId: user._id });
      
      socketRef.current.on('receive_course_message', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    socketRef.current.emit('join_private', { userId: user._id });

    socketRef.current.on('receive_private_message', (msg: ChatMessage) => {
      // If we are in a DM with this specific user, or we are the sender
      if (msg.fromUserId === recipientId || msg.fromUserId === user._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, courseId, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !socketRef.current) return;

    if (recipientId) {
      // Private Message
      socketRef.current.emit('send_private_message', {
        toUserId: recipientId,
        fromUserId: user._id,
        fromUserName: `${user.firstName} ${user.lastName}`,
        message: input
      });
    } else if (courseId) {
      // Course Group Message
      socketRef.current.emit('send_course_message', {
        courseId,
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        message: input
      });
    }

    setInput('');
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D91A1A] hover:bg-[#b81616] shadow-2xl z-50 flex items-center justify-center p-0"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed right-6 bottom-6 w-80 shadow-2xl z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[450px]'}`}>
      <CardHeader className="p-3 border-b border-[#1A1A1A]/5 bg-[#1A1A1A] text-white rounded-t-lg flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {recipientId ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          <CardTitle className="text-sm font-medium">
            {recipientName || courseTitle || 'Course Chat'}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-[calc(100%-56px)]">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F8F0]/50"
            >
              {messages.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.userId === user?._id || msg.fromUserId === user?._id ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-[#6B6B6B] mb-0.5 px-1">
                      {msg.fromUserName || msg.userName}
                    </span>
                    <div className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                      msg.userId === user?._id || msg.fromUserId === user?._id
                        ? 'bg-[#D91A1A] text-white rounded-br-none' 
                        : 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 rounded-bl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1A1A1A]/5 bg-white">
              <div className="flex gap-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="h-9 text-xs"
                />
                <Button type="submit" size="icon" className="h-9 w-9 bg-[#D91A1A] hover:bg-[#b81616]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
};
