import { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Loader2,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileQuestion,
  ChevronRight,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  ScrollText,
  Pencil
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Course {
  id: string;
  name: string;
  image: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface QuizQuestion {
  question: string;
  context?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Assignment {
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  duration: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const courses: Course[] = [
  {
    id: 'math',
    name: 'Mathematics',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60',
    description: 'Explore the world of numbers, patterns, and mathematical concepts',
    lessons: [
      {
        id: 'algebra',
        name: 'Algebra',
        description: 'Learn about equations, variables, and mathematical operations',
        icon: '📐',
        duration: '2 hours',
        level: 'Intermediate'
      },
      {
        id: 'calculus',
        name: 'Calculus',
        description: 'Study limits, derivatives, and integrals',
        icon: '📊',
        duration: '3 hours',
        level: 'Advanced'
      },
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=60',
    description: 'Understand the fundamental laws that govern our universe',
    lessons: [
      {
        id: 'mechanics',
        name: 'Mechanics',
        description: 'Study motion, forces, and energy',
        icon: '🎯',
        duration: '2.5 hours',
        level: 'Intermediate'
      },
      {
        id: 'quantum',
        name: 'Quantum Physics',
        description: 'Explore the bizarre world of quantum mechanics',
        icon: '⚛️',
        duration: '4 hours',
        level: 'Advanced'
      },
    ]
  },
  {
    id: 'cs',
    name: 'Computer Science',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    description: 'Master programming, algorithms, and computational thinking',
    lessons: [
      {
        id: 'programming',
        name: 'Programming',
        description: 'Learn the basics of coding and software development',
        icon: '💻',
        duration: '3 hours',
        level: 'Beginner'
      },
      {
        id: 'algorithms',
        name: 'Algorithms',
        description: 'Study problem-solving strategies and optimization',
        icon: '🔄',
        duration: '2.5 hours',
        level: 'Advanced'
      },
    ]
  },
];

function generateMockQuestions(course: Course, lesson: Lesson, prompt: string): QuizQuestion[] {
  return [
    {
      question: `Based on ${lesson.name} in ${course.name}, explain the following concept: ${prompt}`,
      context: `This question tests your understanding of ${lesson.name} fundamentals.`,
      options: [
        `Comprehensive answer relating to ${course.name}`,
        `Partial explanation of ${lesson.name}`,
        `Common misconception about ${prompt}`,
        `Incorrect but plausible answer`,
      ],
      correctAnswer: 0,
      explanation: `The correct answer demonstrates a thorough understanding of ${lesson.name} concepts.`
    },
    {
      question: `How does ${prompt} apply to real-world scenarios in ${lesson.name}?`,
      context: `Practical application of ${lesson.name} concepts.`,
      options: [
        `Theoretical application`,
        `Practical example from ${course.name}`,
        `Industry use case`,
        `Research perspective`,
      ],
      correctAnswer: 1,
      explanation: `This answer shows how ${lesson.name} principles work in practice.`
    }
  ];
}

function generateMockAssignment(course: Course, lesson: Lesson, prompt: string): Assignment {
  return {
    title: `${lesson.name} Project: ${prompt}`,
    description: `Apply your knowledge of ${lesson.name} concepts from ${course.name} to complete this comprehensive assignment.`,
    objectives: [
      `Demonstrate understanding of core ${lesson.name} principles`,
      `Apply theoretical concepts to practical scenarios`,
      `Develop problem-solving skills in ${course.name}`,
    ],
    requirements: [
      `Complete analysis of ${prompt} using ${lesson.name} concepts`,
      `Provide detailed explanations and justifications`,
      `Include relevant examples and applications`,
    ],
    duration: '1 week',
    points: 100,
    difficulty: lesson.level === 'Advanced' ? 'Hard' : lesson.level === 'Intermediate' ? 'Medium' : 'Easy',
  };
}

function Gen() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('quiz');

  const handleGenerate = () => {
    if (!selectedCourse || !selectedLesson || !prompt) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      if (activeTab === 'quiz') {
        setQuestions(generateMockQuestions(selectedCourse, selectedLesson, prompt));
        setAssignment(null);
      } else {
        setAssignment(generateMockAssignment(selectedCourse, selectedLesson, prompt));
        setQuestions([]);
      }
      setIsGenerating(false);
    }, 1500);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-primary" />
            AI Learning Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Generate personalized quizzes and assignments to enhance your learning experience
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Assignment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Course Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Select Your Course</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedCourse?.id === course.id
                      ? 'border-primary ring-2 ring-primary ring-opacity-50'
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedLesson(null);
                    setQuestions([]);
                    setAssignment(null);
                  }}
                >
                  <div className="aspect-video relative">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">{course.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Lesson Selection */}
          {selectedCourse && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Select Your Lesson</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCourse.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLesson?.id === lesson.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setQuestions([]);
                      setAssignment(null);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{lesson.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{lesson.name}</h3>
                          <Badge variant="secondary" className={getDifficultyColor(lesson.level)}>
                            {lesson.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {lesson.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Prompt Input */}
          {selectedLesson && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  {activeTab === 'quiz' ? 'Create Your Quiz' : 'Create Your Assignment'}
                </h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Enter Your Prompt</Label>
                {activeTab === 'quiz' ? (
                  <Input
                    id="prompt"
                    placeholder="What would you like to create a quiz about?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                ) : (
                  <Textarea
                    id="prompt"
                    placeholder="Describe the assignment you'd like to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={!selectedCourse || !selectedLesson || !prompt || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating {activeTab === 'quiz' ? 'Quiz' : 'Assignment'}...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Generate {activeTab === 'quiz' ? 'Quiz' : 'Assignment'}
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* Generated Content */}
          {(questions.length > 0 || assignment) && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ScrollText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  Generated {activeTab === 'quiz' ? 'Quiz' : 'Assignment'}
                </h2>
              </div>

              {/* Quiz Display */}
              {questions.length > 0 && (
                <div className="space-y-8">
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                            {qIndex + 1}
                          </span>
                          {question.question}
                        </h3>
                        {question.context && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            Context: {question.context}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`p-4 rounded-lg border transition-colors ${
                              oIndex === question.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {oIndex === question.correctAnswer ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                              )}
                              <span
                                className={
                                  oIndex === question.correctAnswer
                                    ? 'font-medium text-green-700 dark:text-green-300'
                                    : ''
                                }
                              >
                                {option}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Assignment Display */}
              {assignment && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{assignment.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className={getDifficultyColor(assignment.difficulty)}>
                        {assignment.difficulty}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {assignment.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Trophy className="w-4 h-4" />
                        {assignment.points} points
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{assignment.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Learning Objectives
                      </h4>
                      <ul className="space-y-2">
                        {assignment.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Requirements
                      </h4>
                      <ul className="space-y-2">
                        {assignment.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gen;