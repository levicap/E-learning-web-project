import { useState } from 'react';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from 'lucide-react';

// Define a Zod schema for lessons
const LessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().min(1, "Lesson description is required"),
  duration: z.number().min(0, "Duration must be a non-negative number"),
  // Allow videoLink to be empty or a valid URL (must start with http or https if provided)
  videoLink: z.string().optional().refine(
    (val) => !val || /^(https?:\/\/)/.test(val),
    { message: "Video link must be a valid URL" }
  ),
  // Use preprocess to convert non-File values (like null) to undefined so that the schema handles it correctly.
  videoFile: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File).optional()
  ),
});

// Define a Zod schema for courses
const CourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  instructor: z.string().min(1, "Instructor is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  // Preprocess the image to ensure that only a File passes validation
  image: z.preprocess(
    (val) => (val instanceof File ? val : undefined),
    z.instanceof(File, { message: "Cover image is required" })
  ),
  category: z.string().min(1, "Category is required"),
  lessons: z.array(LessonSchema),
  students: z.array(z.any()).optional(),
  progress: z.array(z.any()).optional(),
});

const CreateCourseDialog = () => {
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    image: null,
    category: '',
    lessons: [],
    students: [],
    progress: [],
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: 0,           // Duration in minutes
    videoLink: '',
    videoFile: null,
  });

  const [error, setError] = useState('');

  // Handle image upload for course cover
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCourse({ ...newCourse, image: file });
    }
  };

  // Handle video upload for lesson
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLesson({ ...newLesson, videoFile: file });
    }
  };

  // Add lesson to the course with Zod validation
  const addLesson = () => {
    // Validate newLesson data
    const lessonResult = LessonSchema.safeParse(newLesson);
    if (!lessonResult.success) {
      const lessonErrors = lessonResult.error.errors.map(err => err.message).join(", ");
      setError(lessonErrors);
      return;
    }
    
    // Clear any previous error before adding
    setError('');
    setNewCourse({
      ...newCourse,
      lessons: [...newCourse.lessons, { ...newLesson }],
    });
    setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
  };

  // Reset the course form
  const resetCourseForm = () => {
    setNewCourse({
      title: '',
      description: '',
      instructor: '',
      price: 0,
      image: null,
      category: '',
      lessons: [],
      students: [],
      progress: [],
    });
    setNewLesson({ title: '', description: '', duration: 0, videoLink: '', videoFile: null });
    setError('');
  };

  // Create course and send to API with Zod validation
  const addCourse = () => {
    // Validate the course data using Zod
    const courseResult = CourseSchema.safeParse(newCourse);
    if (!courseResult.success) {
      const courseErrors = courseResult.error.errors.map(err => err.message).join(", ");
      setError(courseErrors);
      return;
    }

    // Clear any error if validation passes
    setError('');

    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('description', newCourse.description);
    formData.append('instructor', newCourse.instructor);
    formData.append('price', newCourse.price.toString());
    formData.append('category', newCourse.category);
    formData.append('students', JSON.stringify(newCourse.students));
    formData.append('progress', JSON.stringify(newCourse.progress));

    if (newCourse.image) {
      formData.append('image', newCourse.image);
    }

    // Remove videoFile from lessons before stringifying
    const lessonsForJSON = newCourse.lessons.map(({ videoFile, ...lessonData }) => lessonData);
    formData.append('lessons', JSON.stringify(lessonsForJSON));

    // Append each lesson's video file if available using keys "lessonVideo0", "lessonVideo1", etc.
    newCourse.lessons.forEach((lesson, index) => {
      if (lesson.videoFile) {
        formData.append(`lessonVideo${index}`, lesson.videoFile);
      }
    });

    fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Course created:', data);
        resetCourseForm();
      })
      .catch((error) => {
        console.error('Error creating course:', error);
        setError('Error creating course. Please try again later.');
      });
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
          {/* Course Basic Fields */}
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
            <Label htmlFor="image">Cover Image</Label>
            <Input
              id="image"
              type="file"
              onChange={handleImageUpload}
            />
            {newCourse.image && (
              <img
                src={URL.createObjectURL(newCourse.image)}
                alt="Course Cover"
                className="mt-2 w-full h-auto"
              />
            )}
          </div>

          {/* Lessons Section */}
          <div className="grid gap-4 mt-4">
            <Label>Add Lesson</Label>
            <div className="grid gap-2">
              <Input
                placeholder="Lesson Title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              />
              <Textarea
                placeholder="Lesson Description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              />
              <Input
                placeholder="Video URL (YouTube/Vimeo)"
                value={newLesson.videoLink}
                onChange={(e) => setNewLesson({ ...newLesson, videoLink: e.target.value })}
              />
              <Input
                id="videoFile"
                type="file"
                onChange={handleVideoUpload}
              />
              {newLesson.videoFile && (
                <div>
                  <strong>Selected Video: </strong>
                  {newLesson.videoFile.name}
                </div>
              )}
              {/* Input for lesson duration */}
              <Input
                placeholder="Duration (minutes)"
                type="number"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({ ...newLesson, duration: parseFloat(e.target.value) })}
              />
            </div>
            <Button variant="outline" onClick={addLesson}>
              Add Lesson
            </Button>

            {/* Display added lessons */}
            <ul className="mt-4">
              {newCourse.lessons.map((lesson, index) => (
                <li key={index}>
                  <strong>{lesson.title}</strong> - {lesson.description}
                  {lesson.duration !== undefined && (
                    <div>Duration: {lesson.duration} minutes</div>
                  )}
                  {lesson.videoLink && (
                    <div>
                      Video: <a href={lesson.videoLink} target="_blank" rel="noopener noreferrer">{lesson.videoLink}</a>
                    </div>
                  )}
                  {lesson.videoFile && <div>Video File: {lesson.videoFile.name}</div>}
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
