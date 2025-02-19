import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Pencil, Trash2, Plus, Minus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
}

interface QuizManagerProps {
  lessonId: string;
}

export default function QuizManager({ lessonId }: QuizManagerProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Basic Concepts Quiz',
      description: 'Test your knowledge of fundamental concepts',
      timeLimit: 30,
      questions: [
        {
          id: '1',
          text: 'What is HTML?',
          options: [
            { id: '1', text: 'Hypertext Markup Language', isCorrect: true },
            { id: '2', text: 'High-Level Text Language', isCorrect: false },
          ],
        },
      ],
    },
  ]);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [
      {
        id: Date.now().toString(),
        text: '',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false },
        ],
      },
    ],
  });

  const handleAddQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          id: Date.now().toString(),
          text: '',
          options: [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
          ],
        },
      ],
    });
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options.push({
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
    });
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleAddQuiz = () => {
    if (newQuiz.title && newQuiz.description) {
      setQuizzes([
        ...quizzes,
        {
          id: Date.now().toString(),
          ...newQuiz,
        },
      ]);
      setNewQuiz({
        title: '',
        description: '',
        timeLimit: 30,
        questions: [
          {
            id: Date.now().toString(),
            text: '',
            options: [
              { id: '1', text: '', isCorrect: false },
              { id: '2', text: '', isCorrect: false },
            ],
          },
        ],
      });
    }
  };

  const handleUpdateQuiz = () => {
    if (editingQuiz) {
      setQuizzes(
        quizzes.map((quiz) =>
          quiz.id === editingQuiz.id ? editingQuiz : quiz
        )
      );
      setEditingQuiz(null);
    }
  };

  const handleDeleteQuiz = (id: string) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
    setDeleteQuizId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quizzes</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>
                Create a new quiz with multiple questions and options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={newQuiz.title}
                    onChange={(e) =>
                      setNewQuiz({ ...newQuiz, title: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newQuiz.description}
                    onChange={(e) =>
                      setNewQuiz({ ...newQuiz, description: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={newQuiz.timeLimit}
                    onChange={(e) =>
                      setNewQuiz({
                        ...newQuiz,
                        timeLimit: parseInt(e.target.value),
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {newQuiz.questions.map((question, qIndex) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Question {qIndex + 1}</Label>
                        <Input
                          value={question.text}
                          onChange={(e) => {
                            const updatedQuestions = [...newQuiz.questions];
                            updatedQuestions[qIndex].text = e.target.value;
                            setNewQuiz({
                              ...newQuiz,
                              questions: updatedQuestions,
                            });
                          }}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {question.options.map((option, oIndex) => (
                          <div key={option.id} className="flex gap-2 items-center">
                            <Input
                              value={option.text}
                              onChange={(e) => {
                                const updatedQuestions = [...newQuiz.questions];
                                updatedQuestions[qIndex].options[oIndex].text =
                                  e.target.value;
                                setNewQuiz({
                                  ...newQuiz,
                                  questions: updatedQuestions,
                                });
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant={option.isCorrect ? 'default' : 'outline'}
                              onClick={() => {
                                const updatedQuestions = [...newQuiz.questions];
                                updatedQuestions[qIndex].options[
                                  oIndex
                                ].isCorrect = !option.isCorrect;
                                setNewQuiz({
                                  ...newQuiz,
                                  questions: updatedQuestions,
                                });
                              }}
                              className="w-24"
                            >
                              {option.isCorrect ? 'Correct' : 'Incorrect'}
                            </Button>
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  handleRemoveOption(qIndex, oIndex)
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddOption(qIndex)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddQuiz}>Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">{quiz.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {quiz.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-1 bg-primary/10 rounded-md">
                    {quiz.timeLimit} minutes
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-md">
                    {quiz.questions.length} questions
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingQuiz(quiz)}
                  className="hover:bg-primary/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteQuizId(quiz.id)}
                  className="hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuizId && handleDeleteQuiz(deleteQuizId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingQuiz && (
        <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingQuiz.title}
                  onChange={(e) =>
                    setEditingQuiz({ ...editingQuiz, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingQuiz.description}
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  value={editingQuiz.timeLimit}
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <Button onClick={handleUpdateQuiz}>Update Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}