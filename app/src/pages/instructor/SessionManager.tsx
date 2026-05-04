import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { sessionAPI, courseAPI } from '@/services/api';
import { 
  Video, 
  Upload, 
  Trash2, 
  PlayCircle,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SessionManager: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Mock default
    duration: '00:00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await courseAPI.getAll();
        const myCourses = courseData.filter((c: any) => c.instructorId === user?._id || user?.role === 'admin');
        setCourses(myCourses);
        if (myCourses.length > 0) setSelectedCourseId(myCourses[0]._id);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSessions();
    }
  }, [selectedCourseId]);

  const fetchSessions = async () => {
    try {
      const data = await sessionAPI.getByCourse(selectedCourseId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    setIsUploading(true);
    try {
      await sessionAPI.upload({
        ...formData,
        courseId: selectedCourseId
      });
      toast.success('Session uploaded successfully!');
      setFormData({ title: '', description: '', videoUrl: formData.videoUrl, duration: '00:00' });
      fetchSessions();
    } catch (error) {
      toast.error('Failed to upload session');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionAPI.delete(id);
      toast.success('Session deleted');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Recorded Sessions</h1>
          <p className="text-[#6B6B6B]">Manage your course recordings and live session replays.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <Card className="lg:col-span-1 bg-white border-[#1A1A1A]/5 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Upload New Session</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Course</label>
                  <select 
                    className="w-full p-2 rounded-md border border-[#1A1A1A]/10 bg-white"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Title</label>
                  <Input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Live Q&A - Week 1" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video URL (S3/Mock)</label>
                  <Input 
                    required 
                    value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Input 
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                      placeholder="45:00" 
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-[#D91A1A] hover:bg-[#D91A1A]/90"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Publish Session
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Session List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">Course Recordings</h2>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <Card key={session._id} className="bg-white border-[#1A1A1A]/5 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D91A1A]/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 text-[#D91A1A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1A1A1A]">{session.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-[#6B6B6B] mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
                        <span>Published: {new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-[#D91A1A] hover:bg-[#D91A1A]/5" onClick={() => handleDelete(session._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(session.videoUrl, '_blank')}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-[#1A1A1A]/10">
                <Video className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-4" />
                <p className="text-[#6B6B6B]">No recorded sessions found for this course.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionManager;
