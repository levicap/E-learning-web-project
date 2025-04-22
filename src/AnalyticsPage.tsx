import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis
} from 'recharts';
import {
  AlertCircle, BookOpen, DollarSign, Award,
  BarChart2, PieChartIcon, Activity, Target, Clock, Calendar,
  ArrowUpRight, ArrowDownRight, Brain, Zap,
  GraduationCap, Timer, Users
} from 'lucide-react';

// Chart Colors and Gradients
const chartColors = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  tertiary: '#ffc658',
  quaternary: '#ff7c43',
  success: '#4CAF50',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#29B6F6'
};

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

// Custom Chart Components
const CustomXAxis = ({ dataKey, ...props }: { dataKey?: string; [key: string]: any }) => (
  <XAxis
    dataKey={dataKey}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
    {...props}
  />
);

const CustomYAxis = ({ tickFormatter, ...props }: { tickFormatter?: (value: any) => string; [key: string]: any }) => (
  <YAxis
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
    tickFormatter={tickFormatter || ((value) => `$${value.toLocaleString()}`)}
    {...props}
  />
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
      <p className="text-gray-600 mb-2">{label}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-sm" style={{ color: item.color }}>
          {item.name}: {typeof item.value === 'number' ?
            (item.name.toLowerCase().includes('revenue') ? `$${item.value.toLocaleString()}` : item.value.toLocaleString())
            : item.value}
        </p>
      ))}
    </div>
  );
};

// Helper Functions
const formatDate = (date: Date | string) => format(new Date(date), 'MMM d, yyyy');
const calculateGrowth = (current: number, previous: number) => (previous ? ((current - previous) / previous) * 100 : 0);
const TrendIndicator = ({ value, previousValue, prefix = '', suffix = '' }: { value: number; previousValue: number; prefix?: string; suffix?: string }) => {
  const trendUp = value >= previousValue;
  const percentage = calculateGrowth(value, previousValue);
  return (
    <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
      {trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      <span>{prefix}{Math.abs(percentage).toFixed(1)}{suffix}%</span>
    </div>
  );
};

// Interfaces
interface Stats {
  totalCourses: number;
  totalRevenue: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  instructorCount: number;
}

interface EnrollmentStats {
  totalStudents: number;
  totalCourseEnrollments: number;
  totalSessionEnrollments: number;
  avgCoursesPerStudent: number;
  avgSessionsPerStudent: number;
}

interface CourseEnrollmentPriceStats {
  totalCoursesWithEnrollments: number;
  totalEnrollments: number;
  avgEnrollmentsPerCourse: number;
  maxEnrollments: number;
  minEnrollments: number;
  totalRevenue: number;
  avgCoursePrice: number;
  minCoursePrice: number;
  maxCoursePrice: number;
}

interface InstructorStat {
  instructorName: string;
  courseCount: number;
  totalRevenue: number;
  avgPrice: number;
}

interface CurrentUser {
  role: string;
}

interface LearningMetrics {
  completionRate: number;
  previousCompletionRate: number;
  avgEngagementScore: number;
  previousEngagementScore: number;
  avgAssignmentScore: number;
  previousAssignmentScore: number;
  studentSatisfaction: number;
  previousStudentSatisfaction: number;
}

interface TimeMetric {
  date: string;
  enrollments: number;
  revenue: number;
  engagement: number;
}

const AnalyticsPage = () => {
  const { isLoaded, userId, getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [courseEnrollmentPriceStats, setCourseEnrollmentPriceStats] = useState<CourseEnrollmentPriceStats | null>(null);
  const [instructorStats, setInstructorStats] = useState<InstructorStat[]>([]);
  const [learningAnalytics, setLearningAnalytics] = useState<LearningMetrics | null>(null);
  const [timeBasedMetrics, setTimeBasedMetrics] = useState<TimeMetric[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch token and current user info from Clerk
  useEffect(() => {
    if (!isLoaded || !userId) return;
    const fetchUserInfo = async () => {
      try {
        const token = await getToken();
        setToken(token);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/clerk/${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch user info');
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUserInfo();
  }, [isLoaded, userId, getToken]);

  // Build headers for API calls
  const authHeaders = useMemo(() => {
    if (!token || !userId) return {};
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-clerk-user-id': userId
    };
  }, [token, userId]);

  // Fetch course stats
  useEffect(() => {
    if (!token || !userId || !currentUser) return;
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/stats`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch course statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, userId, currentUser, authHeaders]);

  // Fetch enrollment stats
  useEffect(() => {
    if (!token || !userId || !currentUser) return;
    const fetchEnrollmentStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/enrollment-stats`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch enrollment statistics');
        }
        const data = await response.json();
        setEnrollmentStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchEnrollmentStats();
  }, [token, userId, currentUser, authHeaders]);

  // Fetch course enrollment price stats
  useEffect(() => {
    if (!token || !userId || !currentUser) return;
    const fetchCourseEnrollmentPriceStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/course-enrollment-price-stats`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch course enrollment price statistics');
        }
        const data = await response.json();
        setCourseEnrollmentPriceStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCourseEnrollmentPriceStats();
  }, [token, userId, currentUser, authHeaders]);

  // Fetch instructor stats (for admin)
  useEffect(() => {
    if (!token || !userId || !currentUser || currentUser.role !== 'admin') return;
    const fetchInstructorStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/instructor-stats`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch instructor statistics');
        }
        const data = await response.json();
        setInstructorStats(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchInstructorStats();
  }, [token, userId, currentUser, authHeaders]);

  // Fetch learning analytics
  useEffect(() => {
    if (!token || !userId || !currentUser) return;
    const fetchLearningAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/learning-analytics`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch learning analytics');
        }
        const data = await response.json();
        setLearningAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchLearningAnalytics();
  }, [token, userId, currentUser, authHeaders]);

  // Fetch time-based statistics (weekly trends)
  useEffect(() => {
    if (!token || !userId || !currentUser) return;
    const fetchTimeBasedStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/time-based-stats`, { headers: authHeaders });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch time-based stats');
        }
        const data = await response.json();
        // Format the date string for display
        const formatted = data.map((item: any) => ({ ...item, date: format(new Date(item.date), 'MMM dd') }));
        setTimeBasedMetrics(formatted);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTimeBasedStats();
  }, [token, userId, currentUser, authHeaders]);

  // Data transformations for charts
  const revenueData = useMemo(() => {
    if (!instructorStats) return [];
    return instructorStats.map(ins => ({
      name: ins.instructorName,
      revenue: ins.totalRevenue,
      courses: ins.courseCount,
      avgPrice: ins.avgPrice
    }));
  }, [instructorStats]);

  const enrollmentData = useMemo(() => {
    if (!enrollmentStats) return [];
    return [
      { name: 'Course Enrollments', value: enrollmentStats.totalCourseEnrollments },
      { name: 'Session Enrollments', value: enrollmentStats.totalSessionEnrollments }
    ];
  }, [enrollmentStats]);

  const performanceData = useMemo(() => {
    if (!courseEnrollmentPriceStats) return [];
    return [
      { subject: 'Enrollments', A: courseEnrollmentPriceStats.avgEnrollmentsPerCourse, fullMark: courseEnrollmentPriceStats.maxEnrollments },
      { subject: 'Revenue', A: courseEnrollmentPriceStats.totalRevenue / 1000, fullMark: courseEnrollmentPriceStats.totalRevenue / 500 },
      { subject: 'Price', A: courseEnrollmentPriceStats.avgCoursePrice, fullMark: courseEnrollmentPriceStats.maxCoursePrice }
    ];
  }, [courseEnrollmentPriceStats]);

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 p-4">
        {Array(4).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen mt-20">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">Last updated: {format(new Date(), 'PPpp')}</span>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-4 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Enrollments
            </TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="instructors" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Instructors
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <BookOpen className="h-5 w-5" />
                      Total Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">{stats?.totalCourses}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <DollarSign className="h-5 w-5" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">${stats?.totalRevenue?.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Users className="h-5 w-5" />
                      Total Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900">{enrollmentStats?.totalStudents?.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <Target className="h-5 w-5" />
                      Avg. Course Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900">${stats?.avgPrice}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Weekly Trends
                    </CardTitle>
                    <CardDescription>Last 7 days performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeBasedMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <CustomXAxis dataKey="date" />
                          <CustomYAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="enrollments" stroke={chartColors.primary} name="Enrollments" />
                          <Line type="monotone" dataKey="revenue" stroke={chartColors.secondary} name="Revenue" />
                          <Line type="monotone" dataKey="engagement" stroke={chartColors.tertiary} name="Engagement Score" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={performanceData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                          <Radar name="Performance" dataKey="A" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {learningAnalytics && (
                      <>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">Course Completion Rate</p>
                            <TrendIndicator value={learningAnalytics.completionRate} previousValue={learningAnalytics.previousCompletionRate} />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{learningAnalytics.completionRate}%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">Engagement Score</p>
                            <TrendIndicator value={learningAnalytics.avgEngagementScore} previousValue={learningAnalytics.previousEngagementScore} />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{learningAnalytics.avgEngagementScore}/5.0</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">Assignment Score</p>
                            <TrendIndicator value={learningAnalytics.avgAssignmentScore} previousValue={learningAnalytics.previousAssignmentScore} />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{learningAnalytics.avgAssignmentScore}%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">Student Satisfaction</p>
                            <TrendIndicator value={learningAnalytics.studentSatisfaction} previousValue={learningAnalytics.previousStudentSatisfaction} />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{learningAnalytics.studentSatisfaction}/5.0</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Monthly Activity
                  </CardTitle>
                  <CardDescription>Detailed monthly performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeBasedMetrics}>
                        <defs>
                          <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.tertiary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={chartColors.tertiary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <CustomXAxis dataKey="date" />
                        <CustomYAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="enrollments" stroke={chartColors.primary} fillOpacity={1} fill="url(#colorEnrollments)" name="Enrollments" />
                        <Area type="monotone" dataKey="revenue" stroke={chartColors.secondary} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                        <Area type="monotone" dataKey="activeUsers" stroke={chartColors.tertiary} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Course Price Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Min Price', value: stats?.minPrice || 0 },
                        { name: 'Avg Price', value: stats?.avgPrice || 0 },
                        { name: 'Max Price', value: stats?.maxPrice || 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <CustomXAxis dataKey="name" />
                        <CustomYAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="value" fill={chartColors.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    Enrollment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={enrollmentData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill={chartColors.primary} dataKey="value">
                          {enrollmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enrollments">
            <div className="grid gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Enrollment Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg. Courses per Student</p>
                      <p className="text-2xl font-bold text-gray-900">{enrollmentStats?.avgCoursesPerStudent}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg. Sessions per Student</p>
                      <p className="text-2xl font-bold text-gray-900">{enrollmentStats?.avgSessionsPerStudent}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Enrollments</p>
                      <p className="text-2xl font-bold text-gray-900">{courseEnrollmentPriceStats?.totalEnrollments?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Course Completion</span>
                        <span className="text-sm font-medium">{learningAnalytics ? learningAnalytics.completionRate : '--'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${learningAnalytics ? learningAnalytics.completionRate : 0}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assignment Completion</span>
                        <span className="text-sm font-medium">{learningAnalytics ? learningAnalytics.avgAssignmentScore : '--'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${learningAnalytics ? learningAnalytics.avgAssignmentScore : 0}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Time Spent Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeBasedMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <CustomXAxis dataKey="date" />
                          <CustomYAxis tickFormatter={(value) => `${value}h`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="engagement" fill={chartColors.info} name="Hours Spent" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {currentUser?.role === 'admin' && (
            <TabsContent value="instructors">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {instructorStats.map((ins, index) => (
                  <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {ins.instructorName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Courses Taught</p>
                          <p className="text-2xl font-bold text-gray-900">{ins.courseCount}</p>
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">${ins.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Average Course Price</p>
                          <p className="text-2xl font-bold text-blue-600">${ins.avgPrice}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default AnalyticsPage;
