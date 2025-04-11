import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pencil, Trash2, PlusCircle, BookOpen, GraduationCap, ClipboardList, Code } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

// -------------------- Utility Types --------------------
export type Course = {
  _id: string;
  title: string;
  image: string;
  lessons: Lesson[];
  codeExamples?: CodeExample[];
};

export type Lesson = {
  _id: string;
  title: string;
  description: string;
  duration?: number;
  videoUrl?: string;
  quiz?: { questions: QuizQuestion[] };
  assignment?: { title: string; file: string };
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export type CodeExample = {
  _id?: string;
  title: string;
  description?: string;
  language: string;
  code: string;
};

// -------------------- Course Selection --------------------
const CourseSelection = ({
  selectedCourse,
  onSelectCourse,
  authHeaders,
}: {
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
  authHeaders: Record<string, string>;
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/courses', { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error fetching courses');
        setLoading(false);
      });
  }, [authHeaders]);

  if (loading) return <p>Loading courses…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <div
          key={course._id}
          className={`p-3 border rounded cursor-pointer flex items-center justify-between transition-all duration-200 ${
            selectedCourse?._id === course._id ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectCourse(course)}
        >
          <h3 className="font-medium text-lg">{course.title}</h3>
          {course.image && (
            <img
              src={`http://localhost:5000${course.image}`}
              alt={course.title}
              className="w-12 h-12 object-cover rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
};

// -------------------- Lesson Selection --------------------
const LessonSelection = ({
  course,
  selectedLesson,
  onSelectLesson,
}: {
  course: Course;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}) => {
  if (!course.lessons || course.lessons.length === 0) return <p>No lessons available</p>;
  return (
    <div className="space-y-2">
      {course.lessons.map((lesson) => (
        <div
          key={lesson._id}
          className={`p-3 border rounded cursor-pointer transition-all duration-200 ${
            selectedLesson?._id === lesson._id ? 'bg-green-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectLesson(lesson)}
        >
          <h4 className="font-medium text-base">{lesson.title}</h4>
        </div>
      ))}
    </div>
  );
};

// -------------------- Edit Quiz Question Dialog --------------------
const EditQuizQuestionDialog = ({
  open,
  question,
  onSave,
  onCancel,
}: {
  open: boolean;
  question: QuizQuestion;
  onSave: (editedQuestion: QuizQuestion) => void;
  onCancel: () => void;
}) => {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const addOption = () => {
    setEditedQuestion({ ...editedQuestion, options: [...editedQuestion.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = editedQuestion.options.filter((_, i) => i !== index);
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quiz Question</DialogTitle>
          <DialogDescription>
            Update the question text, individual options, and correct answer index.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="text"
            placeholder="Question"
            value={editedQuestion.question}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
            className="border rounded w-full p-3 shadow-sm"
          />
          <div className="space-y-2">
            {editedQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="border rounded flex-1 p-3 shadow-sm"
                />
                <Button variant="destructive" size="sm" onClick={() => removeOption(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addOption} className="mt-2">
              Add Option
            </Button>
          </div>
          <Input
            type="number"
            placeholder="Correct Answer Index"
            value={editedQuestion.correctAnswer}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, correctAnswer: Number(e.target.value) })
            }
            className="border rounded w-full p-3 shadow-sm"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(editedQuestion)}>Save</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -------------------- Delete Confirmation Dialog --------------------
const DeleteConfirmationDialog = ({
  open,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// -------------------- Quiz Manager --------------------
const QuizManager = ({
  courseId,
  lesson,
  refreshLesson,
  authHeaders,
}: {
  courseId: string;
  lesson: Lesson;
  refreshLesson: () => void;
  authHeaders: Record<string, string>;
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(lesson.quiz?.questions || []);
  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    question: '',
    options: ['', ''],
    correctAnswer: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<{ index: number; data: QuizQuestion } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    setQuestions(lesson.quiz?.questions || []);
  }, [lesson.quiz]);

  const handleNewOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addNewOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const removeNewOption = (index: number) => {
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const saveQuiz = () => {
    const quizData = { questions };
    fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/quiz`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify({ quiz: quizData }),
    })
      .then((res) => res.json())
      .then(() => {
        alert('Quiz updated successfully.');
        refreshLesson();
      })
      .catch((err) => {
        console.error('Error updating quiz:', err);
        setError(err.message);
      });
  };

  const addQuestionHandler = () => {
    if (!newQuestion.question.trim() || newQuestion.options.length < 2) {
      setError('Please enter a question and at least two options.');
      return;
    }
    setQuestions([...questions, newQuestion]);
    setNewQuestion({ question: '', options: ['', ''], correctAnswer: 0 });
    setError(null);
  };

  const openEdit = (index: number) => {
    setQuestionToEdit({ index, data: questions[index] });
    setEditDialogOpen(true);
  };

  const handleEditSave = (edited: QuizQuestion) => {
    if (questionToEdit !== null) {
      const updated = [...questions];
      updated[questionToEdit.index] = edited;
      setQuestions(updated);
      setEditDialogOpen(false);
      setQuestionToEdit(null);
    }
  };

  const confirmDelete = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex === null) return;
    fetch(
      `http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/quiz/question/${deleteIndex}`,
      { method: 'DELETE', headers: { ...authHeaders } }
    )
      .then((res) => res.json())
      .then(() => {
        const updated = [...questions];
        updated.splice(deleteIndex, 1);
        setQuestions(updated);
        setDeleteDialogOpen(false);
        setDeleteIndex(null);
      })
      .catch((err) => {
        console.error('Error deleting question:', err);
        setError(err.message);
      });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Quiz Manager</h3>
      {error && <p className="text-red-500">{error}</p>}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="border p-4 rounded flex justify-between items-center shadow-sm bg-white">
              <div>
                <p className="font-medium text-lg">{q.question}</p>
                <div className="mt-2 space-y-1">
                  {q.options.map((opt, idx) => (
                    <p key={idx} className="text-sm text-gray-700">{`Option ${idx + 1}: ${opt}`}</p>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Correct Answer: {q.correctAnswer}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(index)}>
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => confirmDelete(index)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No quiz questions available</p>
      )}
      <div className="mt-6 p-6 border rounded shadow-sm bg-white">
        <h4 className="font-semibold text-lg">Add New Question</h4>
        <Input
          type="text"
          placeholder="Question"
          value={newQuestion.question}
          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
          className="border rounded w-full p-3 mt-3 shadow-sm"
        />
        <div className="mt-4 space-y-3">
          {newQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleNewOptionChange(index, e.target.value)}
                className="border rounded flex-1 p-3 shadow-sm"
              />
              <Button variant="destructive" size="sm" onClick={() => removeNewOption(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addNewOption} className="mt-2">
            Add Option
          </Button>
        </div>
        <Input
          type="number"
          placeholder="Correct Answer Index"
          value={newQuestion.correctAnswer}
          onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })}
          className="border rounded w-full p-3 mt-4 shadow-sm"
        />
        <div className="flex gap-4 mt-6">
          <Button onClick={addQuestionHandler}>Add Question</Button>
          <Button onClick={saveQuiz} variant="outline">
            Save Quiz
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">Remember: Click "Save Quiz" to persist all changes.</p>
      </div>
      {editDialogOpen && questionToEdit && (
        <EditQuizQuestionDialog
          open={editDialogOpen}
          question={questionToEdit.data}
          onSave={handleEditSave}
          onCancel={() => {
            setEditDialogOpen(false);
            setQuestionToEdit(null);
          }}
        />
      )}
      {deleteDialogOpen && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          message="Are you sure you want to delete this question?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setDeleteIndex(null);
          }}
        />
      )}
    </div>
  );
};

// -------------------- Assignment Manager --------------------
const AssignmentManager = ({
  courseId,
  lesson,
  refreshLesson,
  authHeaders,
}: {
  courseId: string;
  lesson: Lesson;
  refreshLesson: () => void;
  authHeaders: Record<string, string>;
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssignmentSubmit = (fd: FormData) => {
    fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assignment`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: fd,
    })
      .then((res) => res.json())
      .then(() => {
        alert('Assignment updated successfully');
        refreshLesson();
        setEditDialogOpen(false);
      })
      .catch((err) => {
        console.error('Error updating assignment:', err);
        setError(err.message);
      });
  };

  const deleteAssignment = () => {
    fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assignment`, {
      method: 'DELETE',
      headers: { ...authHeaders },
    })
      .then((res) => res.json())
      .then(() => {
        alert('Assignment deleted successfully');
        refreshLesson();
      })
      .catch((err) => console.error('Error deleting assignment:', err));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Assignment Manager</h3>
      {lesson.assignment ? (
        <div className="border p-4 rounded mb-4 shadow-sm bg-white">
          <p className="font-medium text-lg">Title: {lesson.assignment.title}</p>
          <a
            href={`http://localhost:5000${lesson.assignment.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2 block"
          >
            View Assignment
          </a>
          <div className="mt-4 flex gap-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="w-5 h-5 mr-1" />
              Edit Assignment
            </Button>
            <Button variant="destructive" onClick={deleteAssignment}>
              <Trash2 className="w-5 h-5 mr-1" />
              Delete Assignment
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setEditDialogOpen(true)}>Add Assignment</Button>
      )}
      {editDialogOpen && (
        <Dialog open onOpenChange={() => setEditDialogOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{lesson.assignment ? 'Edit Assignment' : 'Add Assignment'}</DialogTitle>
              <DialogDescription>Provide a title and select a file.</DialogDescription>
            </DialogHeader>
            <AssignmentForm
              initialTitle={lesson.assignment?.title || ''}
              onSubmit={(title, file) => {
                const fd = new FormData();
                fd.append('title', title);
                if (file) fd.append('assignment', file);
                handleAssignmentSubmit(fd);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

const AssignmentForm = ({
  initialTitle,
  onSubmit,
  onCancel,
}: {
  initialTitle: string;
  onSubmit: (title: string, file: File | null) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <div className="space-y-4 py-4">
        <Input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded w-full p-3 shadow-sm"
        />
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          accept=".pdf,.zip,.rar"
          className="border rounded w-full p-3 shadow-sm"
        />
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(title, file)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
};

// -------------------- Code Example Manager --------------------
const CodeExampleManager = ({
  course,
  refreshCourse,
  authHeaders,
}: {
  course: Course;
  refreshCourse: () => void;
  authHeaders: Record<string, string>;
}) => {
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>(course.codeExamples || []);
  const [newExample, setNewExample] = useState<CodeExample>({
    title: '',
    description: '',
    language: '',
    code: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [exampleToEdit, setExampleToEdit] = useState<CodeExample | null>(null);

  useEffect(() => {
    setCodeExamples(course.codeExamples || []);
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExample.title || !newExample.language || !newExample.code) {
      setError('Title, language, and code are required.');
      return;
    }
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(newExample),
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples || []);
        setNewExample({ title: '', description: '', language: '', code: '' });
        setError(null);
        refreshCourse();
      })
      .catch((err) => {
        console.error('Error adding code example:', err);
        setError(err.message);
      });
  };

  const deleteCodeExample = (codeExampleId: string) => {
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples/${codeExampleId}`, {
      method: 'DELETE',
      headers: { ...authHeaders },
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples || []);
        refreshCourse();
      })
      .catch((err) => console.error('Error deleting code example:', err));
  };

  const openEdit = (example: CodeExample) => {
    setExampleToEdit(example);
    setEditDialogOpen(true);
  };

  const handleEditSave = (edited: CodeExample) => {
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples/${edited._id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(edited),
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples || []);
        setEditDialogOpen(false);
        setExampleToEdit(null);
        refreshCourse();
      })
      .catch((err) => console.error('Error updating code example:', err));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Code className="w-5 h-5 text-primary" />
        Code Examples
      </h3>
      {codeExamples.length > 0 ? (
        <div className="space-y-4">
          {codeExamples.map((ex, index) => (
            <div key={index} className="p-4 border rounded-md relative shadow-sm bg-white">
              <h4 className="font-bold text-lg">{ex.title}</h4>
              <p className="text-sm text-gray-700">{ex.description}</p>
              <pre className="bg-gray-800 text-white p-3 rounded mt-2 whitespace-pre-wrap">
                {ex.code}
              </pre>
              <p className="text-xs text-gray-500 mt-1">Language: {ex.language}</p>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(ex)}>
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteCodeExample(ex._id!)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No code examples available</p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white p-6 border rounded shadow-sm">
        <Input
          type="text"
          placeholder="Title"
          value={newExample.title}
          onChange={(e) => setNewExample({ ...newExample, title: e.target.value })}
          required
          className="mt-1 block w-full p-3 rounded border shadow-sm"
        />
        <Textarea
          placeholder="Description (optional)"
          value={newExample.description}
          onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
          className="mt-1 block w-full p-3 rounded border shadow-sm"
        />
        <Input
          type="text"
          placeholder="Language"
          value={newExample.language}
          onChange={(e) => setNewExample({ ...newExample, language: e.target.value })}
          required
          className="mt-1 block w-full p-3 rounded border shadow-sm"
        />
        <Textarea
          placeholder="Code"
          value={newExample.code}
          onChange={(e) => setNewExample({ ...newExample, code: e.target.value })}
          required
          rows={4}
          className="mt-1 block w-full p-3 rounded border shadow-sm"
        />
        <Button type="submit" className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Add Code Example
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      {editDialogOpen && exampleToEdit && (
        <Dialog open onOpenChange={() => setEditDialogOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Code Example</DialogTitle>
              <DialogDescription>Update code example details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                type="text"
                placeholder="Title"
                value={exampleToEdit.title}
                onChange={(e) =>
                  setExampleToEdit({ ...exampleToEdit, title: e.target.value })
                }
                className="border rounded w-full p-3 shadow-sm"
              />
              <Textarea
                placeholder="Description"
                value={exampleToEdit.description}
                onChange={(e) =>
                  setExampleToEdit({ ...exampleToEdit, description: e.target.value })
                }
                className="border rounded w-full p-3 shadow-sm"
              />
              <Input
                type="text"
                placeholder="Language"
                value={exampleToEdit.language}
                onChange={(e) =>
                  setExampleToEdit({ ...exampleToEdit, language: e.target.value })
                }
                className="border rounded w-full p-3 shadow-sm"
              />
              <Textarea
                placeholder="Code"
                value={exampleToEdit.code}
                onChange={(e) =>
                  setExampleToEdit({ ...exampleToEdit, code: e.target.value })
                }
                rows={4}
                className="border rounded w-full p-3 shadow-sm"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => exampleToEdit && handleEditSave(exampleToEdit)}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// -------------------- Main Dashboard --------------------
function Dashboard() {
  const { user } = useUser();
  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Refresh full course details after any update.
  const refreshCourse = () => {
    if (selectedCourse) {
      fetch(`http://localhost:5000/api/courses/${selectedCourse._id}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data: Course) => {
          setSelectedCourse(data);
          if (selectedLesson) {
            const found = data.lessons.find((l) => l._id === selectedLesson._id);
            if (found) setSelectedLesson(found);
          }
        })
        .catch((err) => console.error('Error refreshing course:', err));
    }
  };

  return (
    <div className="mt-20 min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Course Selection */}
          <div className="md:col-span-4">
            <Card className="p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Course Selection</h2>
              </div>
              <CourseSelection
                selectedCourse={selectedCourse}
                onSelectCourse={(course) => {
                  setSelectedCourse(course);
                  setSelectedLesson(null);
                }}
                authHeaders={authHeaders}
              />
            </Card>
          </div>

          {/* Lesson Selection & Managers */}
          <div className="md:col-span-8 space-y-6">
            {selectedCourse && (
              <Card className="p-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Lesson Selection</h2>
                </div>
                <LessonSelection
                  course={selectedCourse}
                  selectedLesson={selectedLesson}
                  onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                />
              </Card>
            )}

            {selectedCourse && selectedLesson && (
              <Card className="p-6">
                <Tabs defaultValue="quizzes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="quizzes" className="space-x-2">
                      <ClipboardList className="w-5 h-5" />
                      <span>Quizzes</span>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="space-x-2">
                      <PlusCircle className="w-5 h-5" />
                      <span>Assignments</span>
                    </TabsTrigger>
                    <TabsTrigger value="codeexamples" className="space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Code Examples</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="quizzes">
                    <QuizManager
                      courseId={selectedCourse._id}
                      lesson={selectedLesson}
                      refreshLesson={refreshCourse}
                      authHeaders={authHeaders}
                    />
                  </TabsContent>
                  <TabsContent value="assignments">
                    <AssignmentManager
                      courseId={selectedCourse._id}
                      lesson={selectedLesson}
                      refreshLesson={refreshCourse}
                      authHeaders={authHeaders}
                    />
                  </TabsContent>
                  <TabsContent value="codeexamples">
                    <CodeExampleManager
                      course={selectedCourse}
                      refreshCourse={refreshCourse}
                      authHeaders={authHeaders}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
