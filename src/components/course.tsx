import { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Clock,
  Layout,
  PlayCircle,
  User,
  Menu,
  Search,
  Bell,
  Settings,
  Home,
  Bookmark,
  Calendar,
  MessageSquare,
  BarChart,
  GraduationCap,
  ChevronRight,
  Trophy,
  Code,
  Brain,
  Zap,
  Star,
  Heart,
  Target,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ConfettiExplosion from 'react-confetti-explosion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  xp: number;
  code?: string;
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 1,
    title: "Introduction to Web Development",
    lessons: [
      {
        id: 1,
        title: "Welcome to the Course",
        duration: "5:30",
        completed: true,
        xp: 100,
        quiz: {
          question: "What is the main purpose of HTML?",
          options: [
            "Styling web pages",
            "Structuring web content",
            "Programming logic",
            "Database management"
          ],
          correctAnswer: 1
        }
      },
      {
        id: 2,
        title: "Setting Up Your Environment",
        duration: "12:45",
        completed: true,
        xp: 150,
        code: 'console.log("Hello, World!");\n\n// Try modifying this code!'
      },
      {
        id: 3,
        title: "HTML Basics",
        duration: "15:20",
        completed: false,
        xp: 200
      },
    ]
  },
  {
    id: 2,
    title: "CSS Fundamentals",
    lessons: [
      {
        id: 4,
        title: "CSS Selectors",
        duration: "18:15",
        completed: false,
        xp: 200,
        code: '.header {\n  color: blue;\n  font-size: 24px;\n}\n\n/* Add your styles below */'
      },
      {
        id: 5,
        title: "Box Model",
        duration: "14:30",
        completed: false,
        xp: 150
      },
      {
        id: 6,
        title: "Flexbox Layout",
        duration: "20:45",
        completed: false,
        xp: 250
      },
    ]
  },
  {
    id: 3,
    title: "JavaScript Essentials",
    lessons: [
      {
        id: 7,
        title: "Variables and Data Types",
        duration: "16:20",
        completed: false,
        xp: 200
      },
      {
        id: 8,
        title: "Functions and Scope",
        duration: "22:10",
        completed: false,
        xp: 300
      },
      {
        id: 9,
        title: "DOM Manipulation",
        duration: "19:55",
        completed: false,
        xp: 250
      },
    ]
  }
];

const navigationItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: BookOpen, label: 'My Courses' },
  { icon: Calendar, label: 'Schedule' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: BarChart, label: 'Progress' },
  { icon: Settings, label: 'Settings' },
];

const achievements = [
  { icon: Zap, label: 'Quick Learner', description: 'Complete 3 lessons in one day', progress: 66 },
  { icon: Star, label: 'Perfect Score', description: 'Get 100% on 5 quizzes', progress: 40 },
  { icon: Heart, label: 'Dedicated', description: 'Study for 7 days in a row', progress: 85 },
  { icon: Target, label: 'Sharpshooter', description: 'Complete all exercises in a module', progress: 20 },
];

function Course() {
  const [currentLesson, setCurrentLesson] = useState({
    id: 1,
    title: "Welcome to the Course",
    moduleTitle: "Introduction to Web Development"
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentLessonData = modules
    .flatMap(m => m.lessons)
    .find(l => l.id === currentLesson.id);

  const handleQuizSubmit = () => {
    if (currentLessonData?.quiz && selectedQuizAnswer === currentLessonData.quiz.correctAnswer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setQuizSubmitted(true);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <ConfettiExplosion />
          </div>
        )}

        {/* Navigation Bar */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="h-16 border-b fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50"
        >
          <div className="flex h-full items-center px-4 gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px]">
                <NavigationSidebar />
              </SheetContent>
            </Sheet>
            <GraduationCap className="h-8 w-8 text-primary hidden lg:block" />
            <div className="flex-1 flex items-center gap-4 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9 bg-muted"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5"
              >
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">2,450 XP</span>
              </motion.div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block">John Doe</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold">John Doe</h4>
                      <div className="text-sm text-muted-foreground">Level 12 Developer</div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span>2,450 XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span>15 Badges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </motion.header>

        {/* Main Layout */}
        <div className="pt-16 lg:pl-[280px] h-screen">
          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="fixed top-16 left-0 bottom-0 w-[280px] border-r hidden lg:block">
            <NavigationSidebar />
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] h-[calc(100vh-4rem)]">
            {/* Main Content */}
            <div className="flex flex-col h-full">
              <Tabs defaultValue="lesson" className="flex-1">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                    <TabsTrigger value="lesson" className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>Lesson</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Code</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>Quiz</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="lesson" className="flex-1">
                  <div className="relative w-full aspect-video bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white opacity-80" />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      <div className="max-w-3xl mx-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                              <p className="text-muted-foreground">{currentLesson.moduleTitle}</p>
                            </div>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                  <Layout className="mr-2 h-4 w-4" />
                                  Course Content
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="p-0 w-[320px]">
                                <CourseContent
                                  modules={modules}
                                  onSelectLesson={(moduleTitle, lesson) => {
                                    setCurrentLesson({
                                      id: lesson.id,
                                      title: lesson.title,
                                      moduleTitle
                                    });
                                    setSelectedQuizAnswer(null);
                                    setQuizSubmitted(false);
                                  }}
                                />
                              </SheetContent>
                            </Sheet>
                          </div>

                          <div className="flex gap-4 mt-4 mb-6">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              20 minutes
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Trophy className="mr-1 h-4 w-4" />
                              {currentLessonData?.xp || 100} XP
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <BookOpen className="mr-1 h-4 w-4" />
                              Beginner
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                              <Progress value={33} className="h-2" />
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              33% Complete
                            </div>
                          </div>

                          <Card className="p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">About This Lesson</h2>
                            <p className="text-muted-foreground">
                              In this comprehensive lesson, we'll explore the fundamentals of web development
                              and set up our development environment. You'll learn about the essential tools
                              and technologies needed to start building modern web applications.
                            </p>
                            
                            <h3 className="text-lg font-semibold mt-6 mb-3">What You'll Learn</h3>
                            <ul className="space-y-2 text-muted-foreground">
                              <li className="flex items-start">
                                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                                Understanding of web development basics
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                                Setting up your code editor and development tools
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                                Introduction to HTML, CSS, and JavaScript
                              </li>
                            </ul>
                          </Card>

                          <div className="flex justify-between">
                            <Button variant="outline" disabled>
                              Previous Lesson
                            </Button>
                            <Button>
                              Next Lesson
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="code" className="flex-1 p-4 mr-9"> 
                  {currentLessonData?.code ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col gap-4"
                    >
                      <div className="flex-1 mr-5 w-150">
                        <CodeMirror
                          value={currentLessonData.code}
                          height="100%"
                          width='100%'
                          theme={oneDark}
                          extensions={[javascript()]}
                          className="border rounded-lg overflow-hidden"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Reset</Button>
                        <Button>Run Code</Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground mr-96">
                      No coding exercise available for this lesson
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz" className="flex-1 mr-12">
                  {currentLessonData?.quiz ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 max-w-2xl mx-auto"
                    >
                      <Card className="p-6 ml-5 w-150">
                        <h2 className="text-xl font-semibold mb-6">{currentLessonData.quiz.question}</h2>
                        <RadioGroup
                          value={selectedQuizAnswer?.toString()}
                          onValueChange={(value) => setSelectedQuizAnswer(parseInt(value))}
                          className="space-y-4"
                        >
                          {currentLessonData.quiz.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                disabled={quizSubmitted}
                                className={cn(
                                  quizSubmitted && index === currentLessonData.quiz?.correctAnswer && "border-green-500",
                                  quizSubmitted && selectedQuizAnswer === index && index !== currentLessonData.quiz?.correctAnswer && "border-red-500"
                                )}
                              />
                              <Label
                                htmlFor={`option-${index}`}
                                className={cn(
                                  "flex-1 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                                  quizSubmitted && index === currentLessonData.quiz?.correctAnswer && "border-green-500 bg-green-500/10",
                                  quizSubmitted && selectedQuizAnswer === index && index !== currentLessonData.quiz?.correctAnswer && "border-red-500 bg-red-500/10"
                                )}
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <div className="mt-6 flex justify-end">
                          {!quizSubmitted ? (
                            <Button
                              onClick={handleQuizSubmit}
                              disabled={selectedQuizAnswer === null}
                            >
                              Submit Answer
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setSelectedQuizAnswer(null);
                                setQuizSubmitted(false);
                              }}
                            >
                              Try Again
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground mr-96 mt-5 ml-5">
                      No quiz available for this lesson
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Course Content Sidebar - Hidden on mobile */}
            <div className="hidden lg:block border-l">
              <CourseContent
                modules={modules}
                onSelectLesson={(moduleTitle, lesson) => {
                  setCurrentLesson({
                    id: lesson.id,
                    title: lesson.title,
                    moduleTitle
                  });
                  setSelectedQuizAnswer(null);
                  setQuizSubmitted(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function NavigationSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">Learning Platform</h2>
        <p className="text-sm text-muted-foreground">Master new skills today</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={item.label === 'My Courses' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Achievements</h3>
          {achievements.map((achievement) => (
            <Card key={achievement.label} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <achievement.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{achievement.label}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                  <Progress value={achievement.progress} className="h-1" />
                  <div className="mt-1 text-xs text-muted-foreground text-right">{achievement.progress}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function CourseContent({
  modules,
  onSelectLesson
}: {
  modules: Module[];
  onSelectLesson: (moduleTitle: string, lesson: Lesson) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Course Content</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" /> </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Bookmark className="mr-2 h-4 w-4" /> Bookmark
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clock className="mr-2 h-4 w-4" /> Mark as Complete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="single" collapsible className="w-full">
            {modules.map((module) => (
              <AccordionItem key={module.id} value={`module-${module.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start">
                    <div className="text-sm font-medium">{module.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {module.lessons.length} lessons
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <motion.div
                        key={lesson.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "p-3 hover:bg-accent cursor-pointer transition-colors",
                            lesson.completed && "bg-muted"
                          )}
                          onClick={() => onSelectLesson(module.title, lesson)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-0.5">
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium leading-none mb-1">
                                  {lesson.title}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {lesson.duration}
                                  </div>
                                  <div className="flex items-center">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    {lesson.xp} XP
                                  </div>
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

export default Course;