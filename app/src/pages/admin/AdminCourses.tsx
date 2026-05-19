import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { courseAPI, userAPI } from '@/services/api';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'beginner',
    price: 49.99,
    thumbnail: '/images/course-1.jpg',
    instructorId: ''
  });

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

  const fetchInstructors = async () => {
    try {
      const data = await userAPI.getUsers({ role: 'instructor', limit: 100 });
      setInstructors(data.users || []);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      return toast.error('Please fill in all required fields');
    }

    setIsSubmitting(true);
    try {
      const course = await courseAPI.create(newCourse);
      if (course) {
        toast.success('Course created successfully');
        setIsAddingCourse(false);
        setNewCourse({
          title: '',
          description: '',
          level: 'beginner',
          price: 49.99,
          thumbnail: '/images/course-1.jpg',
          instructorId: ''
        });
        await fetchCourses();
      }
    } catch (error: any) {
      console.error('Create course error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.[0]?.msg 
        || error.message 
        || 'Failed to create course';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
            <DialogTrigger asChild>
              <Button className="bg-[#D91A1A] hover:bg-[#D91A1A]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#F8F8F0] sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Create New Course</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input 
                    id="title" 
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="e.g. French for Business" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input 
                    id="desc" 
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    placeholder="Short description of the course" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level</Label>
                    <select 
                      id="level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructor">Assign Instructor (Optional)</Label>
                  <select 
                    id="instructor"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newCourse.instructorId}
                    onChange={(e) => setNewCourse({...newCourse, instructorId: e.target.value})}
                  >
                    <option value="">-- Assign to Myself (Admin) --</option>
                    {instructors.map(instructor => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.firstName} {instructor.lastName} ({instructor.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCourse(false)} disabled={isSubmitting}>Cancel</Button>
                <Button 
                  className="bg-[#D91A1A] hover:bg-[#D91A1A]/90" 
                  onClick={handleAddCourse}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    <td className="px-6 py-4 text-sm font-medium">₦{course.price}</td>
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
