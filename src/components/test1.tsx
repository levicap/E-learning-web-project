import { useState } from 'react';
import { 
  Bell, 
  Book, 
  ChevronDown, 
  Layout, 
  LogOut, 
  Menu, 
  Moon, 
  Plus, 
  Search, 
  Sun, 
  Users,
  Presentation,
  GraduationCap,
  BarChart3,
  Settings,
  MessageSquare,
  Calendar,
  HelpCircle,
  FileVideo,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Gauge,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  image: string;
  progress: number;
  lessons: Lesson[];
  category: string;
  price: number;
}

function Test() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Advanced Web Development',
      description: 'Master modern web technologies and frameworks',
      instructor: 'Sarah Johnson',
      students: 234,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
      progress: 75,
      category: 'Development',
      price: 99.99,
      lessons: [
        { id: 'l1', title: 'Introduction to Modern Web', videoUrl: '', duration: '15:30' },
        { id: 'l2', title: 'React Fundamentals', videoUrl: '', duration: '25:45' }
      ]
    },
    {
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Learn the basics of data analysis and visualization',
      instructor: 'Michael Chen',
      students: 189,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
      progress: 45,
      category: 'Data Science',
      price: 89.99,
      lessons: [
        { id: 'l3', title: 'Python for Data Science', videoUrl: '', duration: '20:15' }
      ]
    },
    {
      id: '3',
      title: 'UX/UI Design Principles',
      description: 'Create beautiful and functional user interfaces',
      instructor: 'Emma Davis',
      students: 156,
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400',
      progress: 90,
      category: 'Design',
      price: 79.99,
      lessons: [
        { id: 'l4', title: 'Design Thinking', videoUrl: '', duration: '18:20' },
        { id: 'l5', title: 'User Research', videoUrl: '', duration: '22:10' }
      ]
    }
  ]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    image: '',
    category: '',
    price: 0,
    lessons: [] as Lesson[]
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    videoUrl: ''
  });

  const notifications = [
    {
      id: 1,
      title: "New Course Published",
      message: "Advanced Machine Learning is now live",
      time: "2 minutes ago",
      type: "success",
      icon: CheckCircle2
    },
    {
      id: 2,
      title: "Upcoming Deadline",
      message: "Assignment submission due in 2 hours",
      time: "1 hour ago",
      type: "warning",
      icon: Clock
    },
    {
      id: 3,
      title: "System Update",
      message: "Platform maintenance scheduled",
      time: "3 hours ago",
      type: "info",
      icon: AlertCircle
    }
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const addCourse = () => {
    const course: Course = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCourse,
      students: 0,
      progress: 0,
      lessons: []
    };
    setCourses([...courses, course]);
    setNewCourse({ title: '', description: '', instructor: '', image: '', category: '', price: 0, lessons: [] });
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const addLesson = (courseId: string) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          lessons: [...course.lessons, {
            id: Math.random().toString(36).substr(2, 9),
            ...newLesson,
            duration: '00:00'
          }]
        };
      }
      return course;
    });
    setCourses(updatedCourses);
    setNewLesson({ title: '', videoUrl: '' });
  };

  return (
    <div className={cn("min-h-screen bg-background", isDarkMode ? 'dark' : '')}>
      {/* Navbar */}
      <nav className="border-b fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span>EduDash Pro</span>
          </div>
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="relative w-96 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses, lessons, or instructors..." className="pl-8" />
            </div>
            <Button size="icon" variant="ghost" onClick={toggleTheme} className="hover:bg-muted">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="relative hover:bg-muted">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <div className="text-sm font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">Stay updated with course activities</div>
                </div>
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          {
                            'bg-green-100 text-green-600': notification.type === 'success',
                            'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                            'bg-blue-100 text-blue-600': notification.type === 'info'
                          }
                        )}>
                          <notification.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button variant="ghost" className="w-full text-xs">View all notifications</Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                    alt="User"
                    className="w-8 h-8 rounded-full ring-2 ring-primary/10"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">Administrator</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform",
          !isSidebarOpen && "-translate-x-full",
          "hidden md:block"
        )}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 transition-all bg-muted/30",
          isSidebarOpen ? "md:ml-64" : ""
        )}>
          <div className="flex flex-col gap-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,579</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +4.5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-xs text-muted-foreground">
                    +12 new this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$48,294</div>
                  <p className="text-xs text-muted-foreground">
                    +15.3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Course Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Course Management</h1>
                <p className="text-muted-foreground">Create and manage your educational content</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course to your learning platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Advanced Web Development"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., Development"
                          value={newCourse.category}
                          onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide a detailed description of the course"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Input
                          id="instructor"
                          placeholder="Instructor's full name"
                          value={newCourse.instructor}
                          onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="99.99"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">Cover Image URL</Label>
                      <Input
                        id="image"
                        placeholder="https://example.com/image.jpg"
                        value={newCourse.image}
                        onChange={(e) => setNewCourse({ ...newCourse, image: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewCourse({ title: '', description: '', instructor: '', image: '', category: '', price: 0, lessons: [] })}>
                      Cancel
                    </Button>
                    <Button onClick={addCourse}>Create Course</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-4 right-4" variant="secondary">
                        {course.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <CardTitle className="mb-2">{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </div>
                      <Badge variant="outline">${course.price}</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {course.students} students
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileVideo className="h-4 w-4" />
                          {course.lessons.length} lessons
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Course Lessons</h4>
                      <div className="space-y-2">
                        {course.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileVideo className="h-4 w-4" />
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <Badge variant="outline">{lesson.duration}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mb-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Lesson</DialogTitle>
                          <DialogDescription>
                            Add a new lesson to {course.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="lesson-title">Lesson Title</Label>
                            <Input
                              id="lesson-title"
                              value={newLesson.title}
                              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="video">Video File</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Drag and drop your video file here, or click to browse
                              </p>
                              <Input
                                id="video"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setNewLesson({ ...newLesson, videoUrl: URL.createObjectURL(e.target.files[0]) });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => addLesson(course.id)}>Add Lesson</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Edit Course</Button>
                      <Button variant="destructive" onClick={() => deleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Layout className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            Featured Courses
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Users className="h-4 w-4 mr-2" />
            Students
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Presentation className="h-4 w-4 mr-2" />
            Live Sessions
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussions
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Zap className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>
      <Separator />
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Support
        </h2>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help Center
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Test;

