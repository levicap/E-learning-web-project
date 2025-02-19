import { Pencil, Trash2, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Quiz } from '@/types';
import { format } from 'date-fns';

interface QuizListProps {
  quizzes: Quiz[];
  onEdit: (quiz: Quiz) => void;
  onDelete: (id: string) => void;
}

export default function QuizList({ quizzes, onEdit, onDelete }: QuizListProps) {
  return (
    <div className="space-y-4">
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <HelpCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  No quizzes available
                </p>
                <p className="text-sm text-muted-foreground">
                  Create your first quiz for this lesson by clicking the "Add Quiz" button above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        quizzes.map((quiz) => (
          <Card key={quiz.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg font-semibold">
                    Quiz Question
                  </CardTitle>
                  <Badge variant="secondary" className="bg-primary/10">
                    {quiz.options.length} options
                  </Badge>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <Clock className="mr-1 h-4 w-4" />
                  Created {format(new Date(quiz.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <div className="flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(quiz)}
                  className="hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this quiz? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(quiz.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium mb-4">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                      index === quiz.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/50'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                    }`}
                  >
                    {index === quiz.correctAnswer && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className={index === quiz.correctAnswer ? 'font-medium' : ''}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}