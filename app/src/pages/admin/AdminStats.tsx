import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { analyticsAPI } from '@/services/api';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsAPI.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#F8F8F0]">
        <Sidebar />
        <main className="flex-1 ml-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D91A1A]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F8F0]">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-[#1A1A1A]">Platform Analytics</h1>
          <p className="text-[#6B6B6B]">Comprehensive overview of growth, revenue, and engagement.</p>
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats?.overview.totalRevenue}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +14.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Active Learners</CardTitle>
              <Users className="w-4 h-4 text-[#001B71]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.totalUsers}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +8.1% new registrations
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Course Enrollments</CardTitle>
              <BookOpen className="w-4 h-4 text-[#D91A1A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.overview.totalEnrollments}</div>
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <ArrowDownRight className="w-3 h-3" /> -2.4% vs last week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6B6B6B]">Avg. Progress</CardTitle>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.progressStats.average}%</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +5% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart Mockup */}
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-end justify-between gap-2 pt-4">
                {stats?.revenueHistory.map((item: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-[#001B71] rounded-t-sm transition-all duration-1000"
                      style={{ height: `${(item.amount / 1500) * 100}%` }}
                    />
                    <span className="text-[10px] text-[#6B6B6B] uppercase font-bold">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Distribution Mockup */}
          <Card className="bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Learner Progress Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pt-4">
                {stats?.progressStats.distribution.map((item: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Progress: {item.name}</span>
                      <span className="text-[#6B6B6B]">{item.count} Learners</span>
                    </div>
                    <div className="w-full h-2 bg-[#F8F8F0] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D91A1A]" 
                        style={{ width: `${(item.count / stats.overview.totalEnrollments) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enrollments by Course */}
          <Card className="lg:col-span-2 bg-white border-[#1A1A1A]/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Enrollment Trends by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.enrollmentsByCourse.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#1A1A1A]/5 hover:bg-[#F8F8F0] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#D91A1A]/10 flex items-center justify-center text-[#D91A1A] font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="font-medium text-sm">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold">{c.count} Students</span>
                      <div className="w-24 h-1.5 bg-[#001B71]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#001B71]" style={{ width: `${(c.count / stats.overview.totalEnrollments) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminStats;
