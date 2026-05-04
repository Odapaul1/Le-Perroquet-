import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { courseAPI } from '@/services/api';
import { 
  Video, 
  Users, 
  PlusCircle, 
  ChevronRight, 
  Play, 
  FileText,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getAll();
        // In dev, we just filter by instructorId if it exists, or show all for now
        const myCourses = data.filter((c: any) => c.instructorId === user?._id);
        setCourses(myCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchCourses();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#1A1A1A]">Instructor Dashboard</h1>
            <p className="text-[#6B6B6B]">Welcome back, {user?.firstName}. Ready to inspire?</p>
          </div>
          <Button className="bg-[#D91A1A] hover:bg-[#D91A1A]/90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Total Students</CardTitle>
              <Users className="w-4 h-4 text-[#D91A1A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-green-600 font-medium">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Active Courses</CardTitle>
              <Video className="w-4 h-4 text-[#001B71]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-[#6B6B6B]">2 currently in draft</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Pending Grading</CardTitle>
              <FileText className="w-4 h-4 text-[#D4AF37]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-red-600 font-medium">3 assignments overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#1A1A1A]">My Courses</h2>
            <Link to="/instructor/courses" className="text-sm text-[#D91A1A] font-medium hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D91A1A]" />
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course._id} className="bg-white border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1A1A1A]">{course.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-[#6B6B6B] flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          342 students
                        </span>
                        <span className="text-xs text-[#6B6B6B] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last updated 2 days ago
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button size="sm" className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90">
                        View Stats
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-[#1A1A1A]/10">
                <PlusCircle className="w-12 h-12 text-[#1A1A1A]/10 mx-auto mb-4" />
                <p className="text-[#6B6B6B]">You haven't created any courses yet.</p>
                <Button variant="link" className="text-[#D91A1A]">Start creating your first course</Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default InstructorDashboard;
