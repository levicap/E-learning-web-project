import { useState, useEffect } from 'react';
import { X, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Quiz } from '@/types';

interface QuizFormProps {
  lessonId: string;
  quiz?: Quiz | null;
  onClose: () => void;
  onSave: (quiz: Quiz) => void;
}

export default function QuizForm({
  lessonId,
  quiz,
  onClose,
  onSave,
}: QuizFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (quiz) {
      setQuestion(quiz.question);
      setOptions(quiz.options);
      setCorrectAnswer(quiz.correctAnswer);
    }
  }, [quiz]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    const emptyOptions = options.some((option, index) => !option.trim());
    if (emptyOptions) {
      newErrors.options = 'All options must be filled out';
    }

    const duplicateOptions = new Set(options).size !== options.length;
    if (duplicateOptions) {
      newErrors.options = 'All options must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswer === index) {
      setCorrectAnswer(0);
    } else if (correctAnswer > index) {
      setCorrectAnswer(correctAnswer - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newQuiz: Quiz = {
      id: quiz?.id || Math.random().toString(36).substr(2, 9),
      lessonId,
      question,
      options,
      correctAnswer,
      createdAt: quiz?.createdAt || new Date().toISOString(),
    };
    onSave(newQuiz);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {quiz ? 'Edit Quiz Question' : 'Add New Quiz Question'}
          </DialogTitle>
          <DialogDescription>
            Create a multiple-choice question with up to 6 options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question) {
                  setErrors((prev) => ({ ...prev, question: '' }));
                }
              }}
              placeholder="Enter your question"
              className={`h-20 ${errors.question ? 'border-red-500' : ''}`}
            />
            {errors.question && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.question}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            {errors.options && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.options}</AlertDescription>
              </Alert>
            )}
            <RadioGroup
              value={correctAnswer.toString()}
              className="space-y-3"
            >
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    onClick={() => setCorrectAnswer(index)}
                  />
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={`flex-1 ${
                        errors.options ? 'border-red-500' : ''
                      }`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit">
              {quiz ? 'Update Quiz' : 'Save Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}