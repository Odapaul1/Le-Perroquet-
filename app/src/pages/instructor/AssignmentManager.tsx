import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentAPI, courseAPI } from '@/services/api';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Trash2, 
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AssignmentManager: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getAll();
        const myCourses = data.filter((c: any) => c.instructorId === user?._id || user?.role === 'admin');
        setCourses(myCourses);
        if (myCourses.length > 0) setSelectedCourseId(myCourses[0]._id);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssignments();
    }
  }, [selectedCourseId]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentAPI.getByCourse(selectedCourseId);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    setIsCreating(true);
    try {
      await assignmentAPI.create({
        ...formData,
        courseId: selectedCourseId
      });
      toast.success('Assignment created successfully!');
      setFormData({ title: '', description: '', dueDate: '' });
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to create assignment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Assignment Management</h1>
          <p className="text-[#6B6B6B]">Create and manage assignments for your students.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <Card className="lg:col-span-1 bg-white border-[#1A1A1A]/5 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-serif">New Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
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
                  <label className="text-sm font-medium">Assignment Title</label>
                  <Input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., French Essay: My Daily Routine" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description & Instructions</label>
                  <Textarea 
                    required 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide clear instructions for your students..." 
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input 
                    required 
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full bg-[#D91A1A] hover:bg-[#D91A1A]/90"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Assignment
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">Existing Assignments</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#D91A1A]" />
              </div>
            ) : assignments.length > 0 ? (
              assignments.map((assignment) => {
                const isExpired = new Date(assignment.dueDate) < new Date();
                return (
                  <Card key={assignment._id} className="bg-white border-[#1A1A1A]/5 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#001B71]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#001B71]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#1A1A1A]">{assignment.title}</h3>
                        <div className="flex items-center gap-4 text-xs mt-1">
                          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500 font-medium' : 'text-[#6B6B6B]'}`}>
                            <Calendar className="w-3 h-3" /> 
                            Due: {new Date(assignment.dueDate).toLocaleString()}
                          </span>
                          <span className="text-[#6B6B6B]">Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-[#1A1A1A]/10">
                <FileText className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-4" />
                <p className="text-[#6B6B6B]">No assignments found for this course.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignmentManager;
