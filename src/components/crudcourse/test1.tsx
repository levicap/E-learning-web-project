import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import {
  Bell,
  Book,
  Pencil,
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
import { z } from 'zod';

// Import Clerk hook
import { useUser } from '@clerk/clerk-react';
// Adapted shadcn toast imports
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

//
// TypeScript Interfaces
//
interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  price: number;
  image: string;
  lessons: Lesson[];
  students: number;
  progress: number;
}

//
// Zod Schemas for Validation
//
const EditCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  imageFile: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
});

const EditLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  duration: z.number().nonnegative("Duration must be non-negative"),
  videoFile: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
  videoUrl: z
    .string()
    .optional()
    .refine((val) => !val || /^(https?:\/\/)/.test(val), { message: "Invalid URL" }),
});

const AddLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  duration: z.number().nonnegative("Duration must be non-negative"),
  videoLink: z
    .string()
    .optional()
    .refine((val) => !val || /^(https?:\/\/)/.test(val), { message: "Invalid URL" }),
  videoFile: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
});

//
// Main Component
//
function Test() {
  // Retrieve Clerk user data
  const { user } = useUser();
  console.log('Clerk user:', user);

  // Retrieve toast method from shadcn toast hook
  const { toast } = useToast();

  // Memoize headers so they update only when user changes
  const authHeaders = useMemo(() => {
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user?.id || '',
    };
  }, [user]);

  // --- Global States ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  // New state for teacher's enrolled students count
  const [teacherEnrolledCount, setTeacherEnrolledCount] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Course Editing State ---
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseData, setEditCourseData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    imageFile: null as File | null,
  });
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState<boolean>(false);
  const [editCourseError, setEditCourseError] = useState<string>('');

  // --- Lesson Editing State ---
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonData, setEditLessonData] = useState({
    title: '',
    description: '',
    duration: 0,
    videoUrl: '',
    videoFile: null as File | null,
  });
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState<boolean>(false);
  const [editLessonError, setEditLessonError] = useState<string>('');

  // --- Add Lesson State ---
  const [addLessonDialogOpen, setAddLessonDialogOpen] = useState<boolean>(false);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    description: '',
    duration: 0,
    videoLink: '',
    videoFile: null as File | null,
  });
  const [currentCourseForLesson, setCurrentCourseForLesson] = useState<Course | null>(null);
  const [addLessonError, setAddLessonError] = useState<string>('');

  // --- Delete Confirmation State ---
  const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchTotalStats();
      fetchTeacherEnrolledCount();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses with headers:', authHeaders);
      const response = await fetch('http://localhost:5000/api/courses', {
        headers: authHeaders,
      });
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      toast({ title: "Error fetching courses", variant: "destructive" });
    }
  };

  const fetchTotalStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses/total', {
        headers: authHeaders,
      });
      const data = await response.json();
      setTotalCourses(data.totalCourses);
      setTotalRevenue(data.totalRevenue);
    } catch (err) {
      console.error('Error fetching total stats:', err);
      toast({ title: "Error fetching stats", variant: "destructive" });
    }
  };

  // New function to fetch teacher enrolled students count
  const fetchTeacherEnrolledCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses/totlaenrolledstudents', {
        headers: authHeaders,
      });
      const data = await response.json();
      setTeacherEnrolledCount(data.totalEnrolled);
    } catch (err) {
      console.error('Error fetching enrolled count:', err);
      toast({ title: "Error fetching enrolled students count", variant: "destructive" });
    }
  };

  // --- Delete Course Handlers ---
  const openDeleteCourseDialog = (course: Course) => {
    setCourseToDelete(course);
    setDeleteCourseDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseToDelete._id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.ok) {
        setCourses(courses.filter(c => c._id !== courseToDelete._id));
        setDeleteCourseDialogOpen(false);
        setCourseToDelete(null);
        toast({ title: "Course deleted", description: "Course deleted successfully", variant: "default" });
      } else {
        toast({ title: "Error deleting course", variant: "destructive" });
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      toast({ title: "Error deleting course", variant: "destructive" });
    }
  };

  // --- Course Editing Handlers ---
  const openEditCourseDialog = (course: Course) => {
    setEditingCourse(course);
    setEditCourseData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      imageFile: null,
    });
    setEditCourseError('');
    setEditCourseDialogOpen(true);
  };

  const handleEditCourseChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditCourseData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleCourseImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditCourseData(prev => ({ ...prev, imageFile: file }));
  };

  const updateCourse = async () => {
    if (!editingCourse) return;
    try {
      const parsedData = EditCourseSchema.parse(editCourseData);
      const formData = new FormData();
      formData.append('title', parsedData.title);
      formData.append('description', parsedData.description);
      formData.append('category', parsedData.category);
      formData.append('price', parsedData.price.toString());
      if (parsedData.imageFile) {
        formData.append('image', parsedData.imageFile);
      }
      const res = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
        method: 'PUT',
        headers: {
          // Do not include Content-Type when sending FormData
          'x-clerk-user-id': user?.id || '',
        },
        body: formData,
      });
      const updatedCourse = await res.json();
      setCourses(prev => prev.map(c => c._id === updatedCourse._id ? updatedCourse : c));
      setEditCourseDialogOpen(false);
      setEditingCourse(null);
      toast({ title: "Course updated", description: "Course updated successfully", variant: "default" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.map(e => e.message).join(", ");
        setEditCourseError(errorMessage);
        toast({ title: errorMessage, variant: "destructive" });
      } else {
        setEditCourseError("Error updating course");
        toast({ title: "Error updating course", variant: "destructive" });
      }
    }
  };

  // --- Lesson Editing Handlers ---
  const openEditLessonDialog = (course: Course, lesson: Lesson) => {
    setEditingCourse(course);
    setEditingLesson(lesson);
    setEditLessonData({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      videoFile: null,
    });
    setEditLessonError('');
    setEditLessonDialogOpen(true);
  };

  const handleEditLessonChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditLessonData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseFloat(value) : value,
    }));
  };

  const handleLessonVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditLessonData(prev => ({ ...prev, videoFile: file }));
  };

  const updateLesson = async () => {
    if (!editingCourse || !editingLesson) return;
    try {
      const parsedData = EditLessonSchema.parse(editLessonData);
      const formData = new FormData();
      formData.append('title', parsedData.title);
      formData.append('description', parsedData.description || '');
      formData.append('duration', parsedData.duration.toString());
      if (parsedData.videoFile) {
        formData.append('video', parsedData.videoFile);
      } else {
        formData.append('videoUrl', parsedData.videoUrl || '');
      }
      const res = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}/lessons/${editingLesson._id}`, {
        method: 'PUT',
        headers: {
          'x-clerk-user-id': user?.id || '',
        },
        body: formData,
      });
      const updatedLesson = await res.json();
      setCourses(prev => prev.map(course => {
        if (course._id === editingCourse._id) {
          return {
            ...course,
            lessons: course.lessons.map(lesson =>
              lesson._id === editingLesson._id ? updatedLesson : lesson
            ),
          };
        }
        return course;
      }));
      setEditLessonDialogOpen(false);
      setEditingLesson(null);
      toast({ title: "Lesson updated", description: "Lesson updated successfully", variant: "default" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.map(e => e.message).join(", ");
        setEditLessonError(errorMessage);
        toast({ title: errorMessage, variant: "destructive" });
      } else {
        setEditLessonError("Error updating lesson");
        toast({ title: "Error updating lesson", variant: "destructive" });
      }
    }
  };

  // --- Add Lesson Handlers ---
  const openAddLessonDialog = (course: Course) => {
    setCurrentCourseForLesson(course);
    setNewLessonData({
      title: '',
      description: '',
      duration: 0,
      videoLink: '',
      videoFile: null,
    });
    setAddLessonError('');
    setAddLessonDialogOpen(true);
  };

  const handleNewLessonChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLessonData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseFloat(value) : value,
    }));
  };

  const handleNewLessonVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewLessonData(prev => ({ ...prev, videoFile: file }));
  };

  const addLessonToCourse = async () => {
    if (!currentCourseForLesson) return;
    try {
      const parsedData = AddLessonSchema.parse(newLessonData);
      const formData = new FormData();
      formData.append('title', parsedData.title);
      formData.append('description', parsedData.description || '');
      formData.append('duration', parsedData.duration.toString());
      if (parsedData.videoFile) {
        formData.append('video', parsedData.videoFile);
      } else if (parsedData.videoLink) {
        formData.append('videoLink', parsedData.videoLink);
      }
      const res = await fetch(`http://localhost:5000/api/courses/${currentCourseForLesson._id}/lessons`, {
        method: 'POST',
        headers: {
          'x-clerk-user-id': user?.id || '',
        },
        body: formData,
      });
      const data = await res.json();
      setCourses(prev =>
        prev.map(course =>
          course._id === currentCourseForLesson._id
            ? { ...course, lessons: [...course.lessons, data.lesson] }
            : course
        )
      );
      setAddLessonDialogOpen(false);
      setCurrentCourseForLesson(null);
      toast({ title: "Lesson added", description: "Lesson added successfully", variant: "default" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.errors.map(e => e.message).join(", ");
        setAddLessonError(errorMessage);
        toast({ title: errorMessage, variant: "destructive" });
      } else {
        setAddLessonError("Error adding lesson");
        toast({ title: "Error adding lesson", variant: "destructive" });
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn("min-h-screen bg-background", isDarkMode ? 'dark' : '')}>
      {/* Toaster for shadcn toast notifications */}
      <Toaster />
      {/* Navbar could be added here */}
      <div className="flex pt-16">
        {/** Removed Sidebar layout */}
        <main className="flex-1 p-6 transition-all bg-muted/30">
          <div className="flex flex-col gap-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {/* Display the teacher enrolled count fetched from the API */}
                  <div className="text-2xl font-bold">{teacherEnrolledCount}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">+12 new this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">+15.3% from last month</p>
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
              {courses.map(course => (
                <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        {course.lessons.map(lesson => (
                          <div key={lesson._id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileVideo className="h-4 w-4" />
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{lesson.duration} min</Badge>
                              <Button variant="outline" size="icon" onClick={() => openEditLessonDialog(course, lesson)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => openEditCourseDialog(course)}>
                        <Pencil className="h-4 w-4 mr-3" />
                        Edit Course
                      </Button>
                      <Button variant="destructive" onClick={() => openDeleteCourseDialog(course)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => openAddLessonDialog(course)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={deleteCourseDialogOpen} onOpenChange={setDeleteCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCourseDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteCourse}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={editCourseDialogOpen} onOpenChange={setEditCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update details for the course.</DialogDescription>
          </DialogHeader>
          {editCourseError && <p className="text-red-500 mb-2">{editCourseError}</p>}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" name="title" value={editCourseData.title} onChange={handleEditCourseChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" name="description" value={editCourseData.description} onChange={handleEditCourseChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" name="category" value={editCourseData.category} onChange={handleEditCourseChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input id="edit-price" name="price" type="number" value={editCourseData.price || ''} onChange={handleEditCourseChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Course Image (optional)</Label>
              <Input id="edit-image" type="file" name="image" onChange={handleCourseImageChange} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={editLessonDialogOpen} onOpenChange={setEditLessonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update lesson details.</DialogDescription>
          </DialogHeader>
          {editLessonError && <p className="text-red-500 mb-2">{editLessonError}</p>}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-lesson-title">Title</Label>
              <Input id="edit-lesson-title" name="title" value={editLessonData.title} onChange={handleEditLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lesson-description">Description</Label>
              <Textarea id="edit-lesson-description" name="description" value={editLessonData.description} onChange={handleEditLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lesson-duration">Duration (minutes)</Label>
              <Input id="edit-lesson-duration" name="duration" type="number" value={editLessonData.duration || ''} onChange={handleEditLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lesson-video">Upload New Video (optional)</Label>
              <Input id="edit-lesson-video" type="file" name="video" onChange={handleLessonVideoChange} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateLesson}>Save Lesson Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={addLessonDialogOpen} onOpenChange={setAddLessonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>Add a new lesson to the course.</DialogDescription>
          </DialogHeader>
          {addLessonError && <p className="text-red-500 mb-2">{addLessonError}</p>}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-lesson-title">Title</Label>
              <Input id="new-lesson-title" name="title" value={newLessonData.title} onChange={handleNewLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-lesson-description">Description</Label>
              <Textarea id="new-lesson-description" name="description" value={newLessonData.description} onChange={handleNewLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-lesson-duration">Duration (minutes)</Label>
              <Input id="new-lesson-duration" name="duration" type="number" value={newLessonData.duration || ''} onChange={handleNewLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-lesson-videoLink">Video URL (optional)</Label>
              <Input id="new-lesson-videoLink" name="videoLink" value={newLessonData.videoLink} onChange={handleNewLessonChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-lesson-video">Upload Video (optional)</Label>
              <Input id="new-lesson-video" type="file" name="video" onChange={handleNewLessonVideoChange} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addLessonToCourse}>Add Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Test;
