import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  PlayCircle,
  Star,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  BookOpenCheck,
  Trophy,
  Brain,
  FileQuestion,
  Bookmark,
  Share2,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Timer,
  Award,
  CheckSquare,
  Lightbulb,
  Folder,
  ArrowRight,
  ChevronRight,
  CalendarIcon,
  PencilIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Helper function to remove extra quotes from a string if present
const cleanString = (s: string) => {
  if (!s) return s;
  return s.replace(/^"|"$/g, '');
};

function CourseContent() {
  const [activeLesson, setActiveLesson] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/67b5046931d04ea3450d461a');
        const data = await response.json();
        setCourse(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, []);

  const handleQuizSubmit = () => {
    setShowQuizResult(true);
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Calculate total quizzes and assignments from lessons
  const totalQuizzes = course.lessons.reduce((acc: number, lesson: any) => 
    acc + (lesson.quiz?.questions.length > 0 ? 1 : 0), 0
  );
  const totalAssignments = course.lessons.reduce((acc: number, lesson: any) => 
    acc + (lesson.assignment ? 1 : 0), 0
  );
  const currentLesson = course.lessons[activeLesson];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{cleanString(course.title)}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {totalQuizzes} Quizzes
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {totalAssignments} Assignments
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save Course
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Card */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black relative group">
              <video
  src={`http://localhost:5000${currentLesson.videoUrl}`}
  controls
  className="w-full h-full"
/>
                <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Clock className="w-4 h-4" />
                  {currentLesson.duration} minutes
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {cleanString(course.instructor)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {(course.students !== undefined ? course.students : 0)} enrolled
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {course.rating}/5
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Helpful
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Questions
                    </Button>
                  </div>
                </div>
                <Progress value={course.progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {course.progress}% complete
                </p>
              </div>
            </Card>

            {/* Course Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="quiz">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Quiz
                  </div>
                </TabsTrigger>
                <TabsTrigger value="assignment">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Assignment
                  </div>
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Resources
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        What You'll Learn
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'Master responsive design principles',
                          'Build modern web applications',
                          'Implement best practices',
                          'Create scalable solutions',
                          'Handle complex user interactions',
                          'Optimize performance'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckSquare className="w-5 h-5 text-green-500 mt-1" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Course Progress
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Brain className="w-8 h-8 text-primary" />
                            <div>
                              <p className="text-2xl font-bold">{totalQuizzes}</p>
                              <p className="text-sm text-muted-foreground">Quizzes</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <p className="text-2xl font-bold">{totalAssignments}</p>
                              <p className="text-sm text-muted-foreground">Assignments</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Timer className="w-8 h-8 text-primary" />
                            <div>
                              <p className="text-2xl font-bold">{currentLesson.duration}m</p>
                              <p className="text-sm text-muted-foreground">Duration</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="quiz" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-semibold">Lesson Quiz</h2>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {currentLesson.quiz?.questions.length || 0} Questions
                    </Badge>
                  </div>

                  {currentLesson.quiz?.questions.map((q: any, qIndex: number) => (
                    <div key={qIndex} className="mb-8 bg-muted/50 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          {qIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-4">{q.question}</h3>
                          <RadioGroup
                            value={selectedAnswer?.toString()}
                            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                            className="space-y-4"
                          >
                            {q.options.map((option: string, oIndex: number) => (
                              <div key={oIndex} className="flex items-center space-x-2 bg-background p-4 rounded-lg hover:bg-accent transition-colors">
                                <RadioGroupItem value={oIndex.toString()} id={`option-${qIndex}-${oIndex}`} />
                                <Label className="flex-1 cursor-pointer" htmlFor={`option-${qIndex}-${oIndex}`}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>

                      {showQuizResult && (
                        <Alert className="mt-4" variant={selectedAnswer === q.correctAnswer ? "default" : "destructive"}>
                          <AlertDescription className="flex items-center gap-2">
                            {selectedAnswer === q.correctAnswer ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <div>
                                  <span className="font-semibold">Correct!</span> Great job understanding this concept.
                                </div>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5" />
                                <div>
                                  <span className="font-semibold">Incorrect.</span> Review the material and try again.
                                </div>
                              </>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center mt-6">
                    <Button variant="outline">Previous Question</Button>
                    <Button 
                      onClick={handleQuizSubmit}
                      disabled={selectedAnswer === null}
                    >
                      Submit Answer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="assignment" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-semibold">Assignment</h2>
                    </div>
                    {currentLesson.assignment && (
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download Project Files
                      </Button>
                    )}
                  </div>

                  {currentLesson.assignment ? (
                    <div className="space-y-6">
                      <div className="bg-muted/50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">
                          {currentLesson.assignment.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {currentLesson.assignment.description}
                        </p>
                        
                        <div className="grid gap-4">
                          <Card className="p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-primary" />
                              Requirements
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                              <li>Implement responsive design patterns</li>
                              <li>Use modern CSS techniques</li>
                              <li>Ensure cross-browser compatibility</li>
                              <li>Follow accessibility guidelines</li>
                            </ul>
                          </Card>

                          <Card className="p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Timer className="w-4 h-4 text-primary" />
                              Timeline
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                              <li>Project Setup: 30 minutes</li>
                              <li>Implementation: 2 hours</li>
                              <li>Testing: 30 minutes</li>
                              <li>Documentation: 1 hour</li>
                            </ul>
                          </Card>

                          <Card className="p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" />
                              Evaluation Criteria
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                              <li>Code quality and organization</li>
                              <li>Visual design and user experience</li>
                              <li>Responsiveness and adaptability</li>
                              <li>Documentation completeness</li>
                            </ul>
                          </Card>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button className="flex-1">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Assignment
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Ask for Help
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No assignment available for this lesson</p>
                      <p className="text-sm text-muted-foreground">
                        Continue with the course content and check back later
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Folder className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-semibold">Learning Resources</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {course.codeExamples.map((example: any) => (
                        <Card key={example._id} className="p-4">
                          <div className="flex items-start gap-4">
                            <Code2 className="w-8 h-8 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{example.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {example.description}
                              </p>
                              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                              <div className="flex justify-end mt-3">
                                <Button variant="outline" size="sm">
                                  <Code2 className="w-4 h-4 mr-2" />
                                  Copy Code
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Card className="p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Additional Materials
                        </h3>
                        <div className="space-y-3">
                          {course.materials.length > 0 ? (
                            course.materials.map((material: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <span>{material.title}</span>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No additional materials available for this lesson.
                            </p>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Course Progress</h2>
                </div>
                <Badge variant="secondary">{course.progress}%</Badge>
              </div>
              <Progress value={course.progress} className="mb-4" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{course.progress}% Complete</span>
                <span>{course.lessons.length} Lessons</span>
              </div>
            </Card>

            {/* Course Content */}
            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course Content
                </h2>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="p-4">
                  {course.lessons.map((lesson: any, index: number) => (
                    <div key={lesson._id} className="group">
                      <Button
                        variant={activeLesson === index ? "secondary" : "ghost"}
                        className="w-full justify-start mb-2"
                        onClick={() => setActiveLesson(index)}
                      >
                        <div className="flex items-start gap-4 w-full">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {activeLesson > index ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-sm">{index + 1}</span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium group-hover:text-primary transition-colors">
                              {lesson.title}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {lesson.duration} minutes
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                      
                      <div className="ml-10 mb-4 flex gap-2">
                        {lesson.quiz?.questions.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            Quiz
                          </Badge>
                        )}
                        {lesson.assignment && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Assignment
                          </Badge>
                        )}
                      </div>
                      
                      {index < course.lessons.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseContent;
