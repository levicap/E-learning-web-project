import { useState, useEffect } from 'react';
import { 
  Bell, 
  Book, 
  ChevronDown, 
  GraduationCap, 
  LogOut, 
  Layout, 
  Menu, 
  Moon, 
  Plus, 
  Search, 
  Sun, 
  Users,
  Presentation,
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
import CreateCourseDialog from './create';
import SidebarContent from './sidebar';

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
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
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Lesson dialog state for adding a lesson to a course
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: 0,
    videoLink: '',
    videoFile: null as File | null,
  });

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/total');
        const data = await response.json();
        setTotalCourses(data.totalCourses);
        setTotalRevenue(data.totalRevenue);
      } catch (error) {
        console.error('Error fetching total:', error);
      }
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  // Function to add a lesson to an existing course via API
  const addLessonToCourse = (courseId: string) => {
    // Validate lesson fields
    if (!newLesson.title || !newLesson.description) {
      alert('Please fill in lesson title and description.');
      return;
    }
    const formData = new FormData();
    formData.append('title', newLesson.title);
    formData.append('description', newLesson.description);
    formData.append('duration', newLesson.duration.toString());
    formData.append('videoLink', newLesson.videoLink);
    if (newLesson.videoFile) {
      formData.append('video', newLesson.videoFile);
    }

    fetch(`http://localhost:5000/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Lesson added:', data);
        // Update the course in local state by adding the new lesson
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.id === courseId
              ? { ...course, lessons: [...course.lessons, data.lesson] }
              : course
          )
        );
        // Reset lesson state
        setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
      })
      .catch(err => console.error('Error adding lesson:', err));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn("min-h-screen bg-background", isDarkMode ? 'dark' : '')}>
      {/* Navbar */}
      <nav className="border-b fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform",
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
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
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
                  <div className="text-2xl font-bold">${totalRevenue}</div>
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
              <CreateCourseDialog />
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={`http://localhost:5000${course.image}`}
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
                        {course.lessons.map((lesson, index) => (
                          <div key={lesson._id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileVideo className="h-4 w-4" />
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <Badge variant="outline">{lesson.duration} min</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Add Lesson Dialog for this course */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mb-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
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
                            <Label htmlFor="lesson-description">Lesson Description</Label>
                            <Textarea
                              id="lesson-description"
                              value={newLesson.description}
                              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                            <Input
                              id="lesson-duration"
                              type="number"
                              placeholder="e.g., 15"
                              value={newLesson.duration || ''}
                              onChange={(e) => setNewLesson({ ...newLesson, duration: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="videoLink">Video URL (optional)</Label>
                            <Input
                              id="videoLink"
                              placeholder="e.g., https://youtube.com/..."
                              value={newLesson.videoLink}
                              onChange={(e) => setNewLesson({ ...newLesson, videoLink: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="videoFile">Upload Video (optional)</Label>
                            <Input
                              id="videoFile"
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setNewLesson({ ...newLesson, videoFile: file });
                                }
                              }}
                            />
                            {newLesson.videoFile && (
                              <div>
                                <strong>Selected Video: </strong>
                                {newLesson.videoFile.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              // Call the API to add the lesson to the course
                              const formData = new FormData();
                              formData.append('title', newLesson.title);
                              formData.append('description', newLesson.description);
                              formData.append('duration', newLesson.duration ? newLesson.duration.toString() : '0');
                              formData.append('videoLink', newLesson.videoLink);
                              if (newLesson.videoFile) {
                                formData.append('video', newLesson.videoFile);
                              }
                              fetch(`http://localhost:5000/api/courses/${course._id}/lessons`, {
                                method: 'POST',
                                body: formData,
                              })
                                .then((response) => response.json())
                                .then((data) => {
                                  console.log('Lesson added:', data);
                                  // Update the courses state with the new lesson added
                                  setCourses((prevCourses) =>
                                    prevCourses.map((c) =>
                                      c.id === course._id ? { ...c, lessons: [...c.lessons, data.lesson] } : c
                                    )
                                  );
                                  // Reset newLesson state
                                  setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
                                })
                                .catch((err) => {
                                  console.error('Error adding lesson:', err);
                                });
                            }}
                          >
                            Add Lesson
                          </Button>
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

export default Test;
