import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { courseAPI } from '@/services/api';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#1A1A1A]">Course Management</h1>
            <p className="text-[#6B6B6B]">Manage and monitor all courses across the platform.</p>
          </div>
          <Button className="bg-[#D91A1A] hover:bg-[#D91A1A]/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </header>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Courses Table (Card List for simplicity) */}
        <div className="bg-white rounded-lg border border-[#1A1A1A]/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A]/5 text-[#1A1A1A] text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Instructor</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D91A1A] mx-auto" />
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-[#1A1A1A]/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-[#1A1A1A]">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6B6B6B] text-sm">
                      {course.instructorName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-[#001B71]/10 text-[#001B71] text-[10px] font-bold uppercase">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">${course.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Published
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="View"><Eye className="w-4 h-4 text-[#6B6B6B]" /></Button>
                        <Button variant="ghost" size="icon" title="Edit"><Edit className="w-4 h-4 text-[#6B6B6B]" /></Button>
                        <Button variant="ghost" size="icon" title="Delete"><Trash2 className="w-4 h-4 text-[#D91A1A]" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B6B6B]">
                    No courses found matching your search.
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

export default AdminCourses;
