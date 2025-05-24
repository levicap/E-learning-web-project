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
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

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
  const { toast } = useToast();


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
        toast({
          title: 'Quiz Updated',
          description: 'Your quiz has been successfully Added.',
          variant: 'success',  // Success variant
        });
        refreshLesson();
      })
      .catch((err) => {
        console.error('Error updating quiz:', err);
        toast({
          title: 'Error',
          description: err.message || 'Something went wrong.',
          variant: 'destructive',  // Error variant
        });
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
export const AssignmentManager = ({ courseId, lesson, refreshLesson, authHeaders }) => {
  const [assignments, setAssignments] = useState(lesson.assignments || []);
  const [dialogOpen, setDialogOpen] = useState(false);  // Controls visibility of the Add Assignment form
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    setAssignments(lesson.assignments || []);
  }, [lesson.assignments]);

  const handleSave = (toSend) => {
    fetch(
      `http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assignments`,
      {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend),
      }
    )
      .then((res) => res.json())
      .then(() => {
        toast({
          title: 'Assignment Created',
          description: 'Your assignment was successfully created.',
          variant: 'success',  // Success variant
        });
        setError(null);
        setDialogOpen(false);
        refreshLesson();
      })
      .catch((err) => {
        console.error('Error uploading assignments:', err);
        toast({
          title: 'Error',
          description: err.message || 'Something went wrong.',
          variant: 'destructive',  // Error variant
        });
        setError(err.message);
      });
  };

  const handleUpdate = (updatedAssignment) => {
    fetch(
      `http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assignments/${updatedAssignment._id}`,
      {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAssignment),
      }
    )
      .then((res) => res.json())
      .then(() => {
        toast({
          title: 'Assignment Updated',
          description: 'Your assignment was successfully updated.',
          variant: 'success',  // Success variant
        });
        setEditDialogOpen(false);
        refreshLesson();
      })
      .catch((err) => {
        console.error('Error updating assignment:', err);
        toast({
          title: 'Error',
          description: err.message || 'Something went wrong.',
          variant: 'destructive',  // Error variant
        });
        setError(err.message);
      });
  };

  const handleDelete = () => {
    if (assignmentToDelete) {
      fetch(
        `http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assignments/${assignmentToDelete._id}`,
        {
          method: 'DELETE',
          headers: { ...authHeaders },
        }
      )
        .then((res) => res.json())
        .then(() => {
          toast({
            title: 'Assignment Deleted',
            description: 'The assignment has been successfully deleted.',
            variant: 'success',  // Success variant
          });
          setDeleteDialogOpen(false);
          refreshLesson();
        })
        .catch((err) => {
          console.error('Error deleting assignment:', err);
          toast({
            title: 'Error',
            description: err.message || 'Something went wrong.',
            variant: 'destructive',  // Error variant
          });
          setError(err.message);
        });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Assignments</h3>

      {/* Show the list of assignments only when dialogOpen is false */}
      {!dialogOpen && assignments.length > 0 && (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a._id} className="border p-4 rounded shadow-sm bg-white flex justify-between items-center">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                {a.solution && (
                  <p className="mt-2 text-sm text-gray-600">Solution: {a.solution}</p>  
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => { setAssignmentToEdit(a); setEditDialogOpen(true); }}
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => { setAssignmentToDelete(a); setDeleteDialogOpen(true); }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show the "Add Assignment" button when dialogOpen is false */}
      {!dialogOpen && (
        <Button onClick={() => setDialogOpen(true)} className="mt-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Add Assignments
        </Button>
      )}

      {/* Add Assignment Form */}
      {dialogOpen && (
        <Dialog open onOpenChange={() => setDialogOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Assignments</DialogTitle>
              <DialogDescription>Provide one or more assignments (title + content + solution) and submit.</DialogDescription>
            </DialogHeader>
            <MultiAssignmentForm
              initial={[]}  // No initial assignments, as we are adding new ones
              onSubmit={handleSave}
              onCancel={() => setDialogOpen(false)}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Assignment Dialog */}
      {editDialogOpen && assignmentToEdit && (
        <EditAssignmentDialog
          open={editDialogOpen}
          assignment={assignmentToEdit}
          onSave={handleUpdate}
          onCancel={() => setEditDialogOpen(false)}
        />
      )}

      {/* Delete Assignment Confirmation */}
      {deleteDialogOpen && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          message="Are you sure you want to delete this assignment?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
};

const EditAssignmentDialog = ({ open, assignment, onSave, onCancel }) => {
  const [editedAssignment, setEditedAssignment] = useState(assignment);

  useEffect(() => {
    setEditedAssignment(assignment);
  }, [assignment]);

  const handleChange = (field, value) => {
    setEditedAssignment((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="text"
            placeholder="Title"
            value={editedAssignment.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full"
          />
          <Textarea
            placeholder="Content"
            value={editedAssignment.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="w-full"
            rows={4}
          />
          <Textarea
            placeholder="Solution"
            value={editedAssignment.solution}  // Bind solution field
            onChange={(e) => handleChange('solution', e.target.value)}  // Handle solution changes
            className="w-full"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(editedAssignment)}>Save</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -------------------- Multi Assignment Form --------------------
const MultiAssignmentForm = ({ initial, onSubmit, onCancel }) => {
  const [items, setItems] = useState(
    initial.length > 0 ? initial.map(a => ({ title: a.title, content: a.content, solution: a.solution })) : [{ title: '', content: '', solution: '' }]
  );

  const updateField = (idx, field, value) => {
    const copy = [...items];
    copy[idx][field] = value;
    setItems(copy);
  };

  const addItem = () => setItems([...items, { title: '', content: '', solution: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    // validate
    for (const i of items) {
      if (!i.title.trim() || !i.content.trim()) {
        return;
      }
    }
    // send as { assignments: [...] }
    onSubmit({ assignments: items });
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {items.map((it, idx) => (
          <div key={idx} className="border p-4 rounded bg-gray-50 relative">
            <Input
              type="text"
              placeholder="Title"
              value={it.title}
              onChange={(e) => updateField(idx, 'title', e.target.value)}
              className="mb-2 w-full"
            />
            <Textarea
              placeholder="Content"
              value={it.content}
              onChange={(e) => updateField(idx, 'content', e.target.value)}
              className="w-full"
              rows={3}
            />
            <Textarea
              placeholder="Solution"
              value={it.solution}  // Bind solution field
              onChange={(e) => updateField(idx, 'solution', e.target.value)}  // Handle solution changes
              className="w-full"
              rows={3}
            />
            {items.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeItem(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={addItem} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Another Assignment
        </Button>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
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

    // Add new code example
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newExample), // Send the new code example data in the request body
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples); // Update the code examples list after adding
        setNewExample({ title: '', description: '', language: '', code: '' }); // Reset form
        setError(null); // Clear any previous errors
        refreshCourse(); // Refresh the course data
      })
      .catch((err) => {
        console.error('Error adding code example:', err);
        setError(err.message); // Show error message if there's any
      });
  };

  const openEdit = (example: CodeExample) => {
    setExampleToEdit(example);
    setEditDialogOpen(true); // Open the edit dialog
  };

  const handleEditSave = (edited: CodeExample) => {
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples/${edited._id}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(edited), // Send the edited code example data to the backend
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples); // Update the code examples list after editing
        setEditDialogOpen(false); // Close the dialog
        setExampleToEdit(null); // Clear the example being edited
        refreshCourse(); // Refresh the course data
      })
      .catch((err) => {
        console.error('Error updating code example:', err);
        setError(err.message); // Show error message if there's any
      });
  };

  const deleteCodeExample = (codeExampleId: string) => {
    fetch(`http://localhost:5000/api/courses/${course._id}/codeExamples/${codeExampleId}`, {
      method: 'DELETE',
      headers: { ...authHeaders },
    })
      .then((res) => res.json())
      .then((data) => {
        setCodeExamples(data.codeExamples); // Update the code examples list after deletion
        refreshCourse(); // Refresh the course data
      })
      .catch((err) => console.error('Error deleting code example:', err));
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
                onChange={(e) => setExampleToEdit({ ...exampleToEdit, title: e.target.value })}
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
              <Button onClick={() => handleEditSave(exampleToEdit)}>Save</Button>
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
