import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, GraduationCap, ClipboardList, Code } from 'lucide-react';

// -------------------- Type Definitions --------------------

export type Course = {
  id: string;      // corresponds to _id in your backend
  title: string;   // course title
  image: string;   // relative image URL
};

export type Lesson = {
  id: string;         // corresponds to _id in your backend
  courseId: string;   // the course the lesson belongs to
  title: string;      // lesson title
  description: string;
};

// -------------------- CourseSelection Component --------------------

const CourseSelection = ({
  selectedCourse,
  onSelectCourse,
}: {
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/courses')
      .then((res) => res.json())
      .then((data) => {
        // Assuming data is an array of courses
        const formattedCourses = data.map((course: any) => ({
          id: course._id,
          title: course.title,
          image: course.image,
        }));
        setCourses(formattedCourses);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching courses');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {courses.map((course) => (
        <div
          key={course.id}
          className={p-2 border rounded cursor-pointer ${selectedCourse?.id === course.id ? 'bg-blue-100' : 'hover:bg-gray-100'}}
          onClick={() => onSelectCourse(course)}
        >
          <h3>{course.title}</h3>
        </div>
      ))}
    </div>
  );
};

// -------------------- LessonSelection Component --------------------

const LessonSelection = ({
  courseId,
  selectedLesson,
  onSelectLesson,
}: {
  courseId: string;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(http://localhost:5000/api/courses/${courseId})
      .then((res) => res.json())
      .then((data) => {
        const formattedLessons = data.lessons.map((lesson: any) => ({
          id: lesson._id,
          courseId: courseId,
          title: lesson.title,
          description: lesson.description || '',
        }));
        setLessons(formattedLessons);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching lessons');
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <p>Loading lessons...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className={p-2 border rounded cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-green-100' : 'hover:bg-gray-100'}}
          onClick={() => onSelectLesson(lesson)}
        >
          <h4>{lesson.title}</h4>
        </div>
      ))}
    </div>
  );
};

// -------------------- QuizManager Component --------------------

const QuizManager = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) => {
  const [quiz, setQuiz] = useState({ questions: [] });
  const [error, setError] = useState<string | null>(null);

  const handleQuizSubmit = () => {
    fetch(http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}/quiz, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz }),
    })
      .then((res) => res.json())
      .then(() => {
        alert('Quiz updated successfully');
      })
      .catch((err) => {
        console.error('Error updating quiz:', err);
        setError(err.message);
      });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Quiz Manager</h3>
      <textarea
        className="border rounded p-2 w-full"
        placeholder='Enter quiz JSON data. Example: {"questions": [{"question": "Capital of France?", "options": ["Paris", "London"], "correctAnswer": 0}]}'
        value={JSON.stringify(quiz, null, 2)}
        onChange={(e) => {
          try {
            setQuiz(JSON.parse(e.target.value));
          } catch {
            // ignore parse errors
          }
        }}
        rows={5}
      />
      <button onClick={handleQuizSubmit} className="mt-4 px-4 py-2 bg-primary text-white rounded">
        Submit Quiz
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

// -------------------- AssignmentManager Component --------------------

const AssignmentManager = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Please provide both a title and a file.');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('assignment', file);

    fetch(http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}/assignment, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        alert('Assignment submitted successfully');
        setTitle('');
        setFile(null);
        setError(null);
      })
      .catch((err) => {
        console.error('Error uploading assignment:', err);
        setError(err.message);
      });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Assignment Manager</h3>
      <form onSubmit={handleAssignmentSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Assignment File (PDF, ZIP, RAR)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            accept=".pdf,.zip,.rar"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          Submit Assignment
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

// -------------------- CodeExampleManager Component --------------------

const CodeExampleManager = ({ courseId }: { courseId: string }) => {
  const [codeExamples, setCodeExamples] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(http://localhost:5000/api/courses/${courseId})
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples || []);
      })
      .catch((err) => console.error('Error fetching code examples:', err));
  }, [courseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCodeExample = { title, description, language, code };

    fetch(http://localhost:5000/api/courses/${courseId}/codeExamples, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCodeExample),
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples || []);
        setTitle('');
        setDescription('');
        setLanguage('');
        setCode('');
        setError(null);
      })
      .catch((err) => {
        console.error('Error adding code example:', err);
        setError(err.message);
      });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Code className="w-5 h-5 text-primary" />
        Code Examples
      </h3>
      {codeExamples.length > 0 ? (
        <div className="space-y-4">
          {codeExamples.map((example, index) => (
            <div key={index} className="p-4 border rounded-md">
              <h4 className="font-bold">{example.title}</h4>
              <p className="text-sm text-gray-600">{example.description}</p>
              <pre className="bg-gray-800 text-white p-2 rounded mt-2">
                {example.code}
              </pre>
              <p className="text-xs text-gray-500 mt-1">Language: {example.language}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No code examples available</p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Language</label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            rows={4}
            required
          />
        </div>
        <Button type="submit" className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Code Example
        </Button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

// -------------------- Main Quiz Component --------------------

function Quiz() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Course Selection */}
          <Card className="md:col-span-4">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Course Selection</h2>
              </div>
              <CourseSelection
                selectedCourse={selectedCourse}
                onSelectCourse={(course) => {
                  setSelectedCourse(course);
                  setSelectedLesson(null);
                }}
              />
            </CardContent>
          </Card>

          {/* Lesson Selection and Managers */}
          <div className="md:col-span-8 space-y-6">
            {selectedCourse && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Lesson Selection</h2>
                  </div>
                  <LessonSelection
                    courseId={selectedCourse.id}
                    selectedLesson={selectedLesson}
                    onSelectLesson={setSelectedLesson}
                  />
                </CardContent>
              </Card>
            )}

            {selectedLesson && selectedCourse && (
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="quizzes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="quizzes" className="space-x-2">
                        <ClipboardList className="w-4 h-4" />
                        <span>Quizzes</span>
                      </TabsTrigger>
                      <TabsTrigger value="assignments" className="space-x-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>Assignments</span>
                      </TabsTrigger>
                      <TabsTrigger value="codeexamples" className="space-x-2">
                        <Code className="w-4 h-4" />
                        <span>Code Examples</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="quizzes">
                      <QuizManager 
                        courseId={selectedCourse.id} 
                        lessonId={selectedLesson.id} 
                      />
                    </TabsContent>
                    <TabsContent value="assignments">
                      <AssignmentManager 
                        courseId={selectedCourse.id} 
                        lessonId={selectedLesson.id} 
                      />
                    </TabsContent>
                    <TabsContent value="codeexamples">
                      <CodeExampleManager courseId={selectedCourse.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;