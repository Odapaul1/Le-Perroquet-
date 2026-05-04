import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { assignmentAPI } from '@/services/api';
import { 
  User, 
  ExternalLink,
  Search,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const GradingCenter: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentAPI.getInstructorSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    if (!gradingData.grade) return toast.error('Please provide a grade');
    
    setIsGrading(true);
    try {
      await assignmentAPI.grade(submissionId, gradingData);
      toast.success('Submission graded successfully!');
      setGradingData({ grade: '', feedback: '' });
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Grading Center</h1>
          <p className="text-[#6B6B6B]">Review and grade student assignment submissions.</p>
        </header>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
          <Input 
            placeholder="Search by student or assignment..." 
            className="pl-10 bg-white" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg border border-[#1A1A1A]/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A]/5 text-[#1A1A1A] text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D91A1A] mx-auto" />
                  </td>
                </tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#1A1A1A]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#001B71]/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#001B71]" />
                        </div>
                        <span className="font-medium">{s.user.firstName} {s.user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{s.assignment.title}</td>
                    <td className="px-6 py-4 text-sm text-[#6B6B6B]">
                      {new Date(s.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#D91A1A]">
                      {s.grade || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {s.status === 'graded' ? 'View/Edit Grade' : 'Grade'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-[#F8F8F0]">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">
                              Grade Submission: {s.user.firstName} {s.user.lastName}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6 mt-4">
                            <div className="bg-white p-4 rounded-lg border border-[#1A1A1A]/5">
                              <h4 className="text-sm font-bold text-[#1A1A1A] mb-2">Student's Submission</h4>
                              <p className="text-sm text-[#6B6B6B] whitespace-pre-wrap">{s.textContent}</p>
                              {s.contentUrl && (
                                <Button variant="link" className="px-0 h-auto mt-2 text-[#D91A1A]" onClick={() => window.open(s.contentUrl, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Attached File
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-1 space-y-2">
                                <label className="text-sm font-medium">Grade (0-100)</label>
                                <Input 
                                  placeholder="85"
                                  defaultValue={s.grade}
                                  onChange={e => setGradingData({...gradingData, grade: e.target.value})}
                                />
                              </div>
                              <div className="col-span-3 space-y-2">
                                <label className="text-sm font-medium">Feedback</label>
                                <Textarea 
                                  placeholder="Great work! Focus on your verb conjugations next time."
                                  defaultValue={s.feedback}
                                  onChange={e => setGradingData({...gradingData, feedback: e.target.value})}
                                />
                              </div>
                            </div>

                            <Button 
                              onClick={() => handleGrade(s._id)}
                              disabled={isGrading}
                              className="w-full bg-[#D91A1A] hover:bg-[#D91A1A]/90"
                            >
                              {isGrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GraduationCap className="w-4 h-4 mr-2" />}
                              Submit Grade
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default GradingCenter;
