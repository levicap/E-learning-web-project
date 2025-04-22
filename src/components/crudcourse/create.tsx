import { useState } from 'react';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from 'lucide-react';
import { useUser } from "@clerk/clerk-react";

// Lesson validation schema
const LessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().min(1, "Lesson description is required"),
  duration: z.number().min(0, "Duration must be a non-negative number"),
  videoLink: z.string().optional().refine(
    (val) => !val || /^(https?:\/\/)/.test(val),
    { message: "Video link must be a valid URL" }
  ),
  videoFile: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
});

// Course validation schema
const CourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  instructor: z.string().min(1, "Instructor is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  image: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
  previewVideo: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
  category: z.string().min(1, "Category is required"),
  lessons: z.array(LessonSchema),
  students: z.array(z.any()).optional(),
  progress: z.array(z.any()).optional(),
});

export const CreateCourseDialog = () => {
  const { user } = useUser();

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    image: null,
    previewVideo: null,
    category: '',
    lessons: [],
    students: [],
    progress: [],
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: 0,
    videoLink: '',
    videoFile: null,
  });

  const [error, setError] = useState('');

  // File input handlers
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0] || null;
    setNewCourse({ ...newCourse, image: file });
  };
  const handlePreviewUpload = (e) => {
    const file = e.target.files?.[0] || null;
    setNewCourse({ ...newCourse, previewVideo: file });
  };
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0] || null;
    setNewLesson({ ...newLesson, videoFile: file });
  };
  const handleVideoLinkChange = (e) => {
    setNewLesson({ ...newLesson, videoLink: e.target.value });
  };

  // Add lesson
  const addLesson = () => {
    const result = LessonSchema.safeParse(newLesson);
    if (!result.success) {
      setError(result.error.errors.map(err => err.message).join(', '));
      return;
    }
    setError('');
    setNewCourse({
      ...newCourse,
      lessons: [...newCourse.lessons, newLesson],
    });
    setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
  };

  // Reset form
  const resetCourseForm = () => {
    setError('');
    setNewCourse({
      title: '',
      description: '',
      instructor: '',
      price: 0,
      image: null,
      previewVideo: null,
      category: '',
      lessons: [],
      students: [],
      progress: [],
    });
    setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
  };

  // Submit course
  const addCourse = async () => {
    let updatedLessons = [...newCourse.lessons];
  
    if (newCourse.previewVideo) {
      updatedLessons = [
        {
          title: "Preview",
          description: "Preview video of the course",
          duration: 0,
          videoLink: '',
          videoFile: newCourse.previewVideo,
        },
        ...newCourse.lessons,
      ];
    }
  
    const result = CourseSchema.safeParse({ ...newCourse, lessons: updatedLessons });
    if (!result.success) {
      setError(result.error.errors.map(err => err.message).join(', '));
      return;
    }
  
    setError('');
    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    formData.append('instructor', newCourse.instructor);
    formData.append('price', String(newCourse.price));
    formData.append('category', newCourse.category);
    formData.append('students', JSON.stringify(newCourse.students));
    formData.append('progress', JSON.stringify(newCourse.progress));
    if (newCourse.image) formData.append('image', newCourse.image);
    if (newCourse.previewVideo) formData.append('previewVideo', newCourse.previewVideo);
  
    const lessonsForJSON = updatedLessons.map(({ videoFile, ...rest }) => rest);
    formData.append('lessons', JSON.stringify(lessonsForJSON));
    updatedLessons.forEach((lesson, idx) => {
      if (lesson.videoFile) formData.append(`lessonVideo${idx}`, lesson.videoFile);
    });
  
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'x-clerk-user-id': user?.id || '' },
        body: formData,
      });
      if (!res.ok) throw new Error('Server error');
      resetCourseForm();
    } catch {
      setError('Error creating course. Please try again later.');
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl sm:max-w-2xl overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to your learning platform</DialogDescription>
        </DialogHeader>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid gap-4 py-4">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              />
            </div>
          </div>

          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={newCourse.price === 0 ? '' : newCourse.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewCourse({ ...newCourse, price: val === '' ? 0 : parseFloat(val) });
                }}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="image">Cover Image</Label>
              <Input id="image" type="file" onChange={handleImageUpload} />
              {newCourse.image && (
                <img
                  src={URL.createObjectURL(newCourse.image)}
                  alt="Cover"
                  className="mt-2 w-full h-auto"
                />
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="previewVideo">Preview Video (optional)</Label>
            <Input id="previewVideo" type="file" accept="video/*" onChange={handlePreviewUpload} />
            {newCourse.previewVideo && <div>Selected Preview: {newCourse.previewVideo.name}</div>}
          </div>

          {/* Lessons */}
          <div className="mt-4">
            <Label>Add Lesson</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Lesson Title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              />
              <Input
                placeholder="Duration (min)"
                type="number"
                value={newLesson.duration === 0 ? '' : newLesson.duration}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewLesson({ ...newLesson, duration: val === '' ? 0 : parseFloat(val) });
                }}
              />
            </div>
            <Textarea
              placeholder="Lesson Description"
              value={newLesson.description}
              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
            />
            <Input placeholder="Video URL" value={newLesson.videoLink} onChange={handleVideoLinkChange} />
            <Input type="file" onChange={handleVideoUpload} />
            {newLesson.videoFile && <div>Selected File: {newLesson.videoFile.name}</div>}
            <Button variant="outline" onClick={addLesson}>Add Lesson</Button>

            <ul className="mt-4 list-disc list-inside">
              {newCourse.lessons.map((lesson, idx) => (
                <li key={idx}>
                  <strong>{lesson.title}</strong> – {lesson.description} ({lesson.duration} min)
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetCourseForm}>Cancel</Button>
          <Button onClick={addCourse}>Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
