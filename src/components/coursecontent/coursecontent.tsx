import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Lightbulb,
  Timer,
  Trophy,
  Users,
  Star,
  MessageSquare,
  ThumbsUp,
  XCircle,
} from 'lucide-react';

// Helper function to remove extra quotes from a string if present
const cleanString = (s: string) => {
  if (!s) return s;
  return s.replace(/^"|"$/g, '');
};

function CourseContent() {
  const location = useLocation();
  // Expecting courseId passed as state from the previous page
  const { courseId } = location.state as { courseId: string };

  const { user } = useUser();

  // Build the headers using useMemo
  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  const [activeLesson, setActiveLesson] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course data for courseId:', courseId);
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: authHeaders,
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching course:', errorData);
          throw new Error(errorData.message || 'Failed to fetch course');
        }
        const data = await response.json();
        console.log('Course data received:', data);
        setCourse(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        setLoading(false);
      }
    };

    if (user?.id && courseId) {
      fetchCourse();
    }
  }, [courseId, authHeaders, user]);

  // Fetch persisted progress data for the course
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        console.log('Fetching progress for courseId:', courseId);
        const res = await fetch(`http://localhost:5000/api/progress/progress/${courseId}`, {
          headers: authHeaders,
        });
        if (res.ok) {
          const progressData = await res.json();
          console.log('Progress data received:', progressData);
          // Merge the persisted progress into your course state
          setCourse((prev: any) => ({ ...prev, progress: progressData.progress }));
        } else {
          console.warn('No progress data found for this course');
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    if (user?.id && courseId) {
      fetchProgress();
    }
  }, [courseId, authHeaders, user]);

  // Set the active lesson based on course progress once course data is loaded
  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0 && typeof course.progress === 'number') {
      const totalLessons = course.lessons.length;
      // Compute lesson index based on progress percentage
      let computedLesson = Math.ceil((course.progress / 100) * totalLessons);
      // Clamp the index if it exceeds available lessons
      if (computedLesson >= totalLessons) computedLesson = totalLessons - 1;
      setActiveLesson(computedLesson);
    }
  }, [course]);

  // Call progress API when a lesson is completed
  const handleLessonCompletion = async () => {
    try {
      const lessonId = course.lessons[activeLesson]._id;
      console.log('Completing lesson:', lessonId, 'for course:', courseId);
      const response = await fetch('http://localhost:5000/api/progress/complete-lesson', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          courseId,
          lessonId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update progress:', errorData);
        return;
      }
      const data = await response.json();
      console.log('Updated progress data:', data);
      // Update course progress with the new progress value returned from the API
      setCourse((prev: any) => ({ ...prev, progress: data.progress }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleQuizSubmit = () => {
    setShowQuizResult(true);
  };

  // Update selected answer for a given question
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No lessons available for this course.</p>
      </div>
    );
  }

  const currentLesson = course.lessons[activeLesson];

  const totalQuizzes = course.lessons.reduce((acc: number, lesson: any) =>
    acc + (lesson.quiz?.questions.length > 0 ? 1 : 0), 0
  );
  const totalAssignments = course.lessons.reduce((acc: number, lesson: any) =>
    acc + (lesson.assignment ? 1 : 0), 0
  );

  return (
    <div className="min-h-screen bg-background mt-20">
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
                <ThumbsUp className="w-4 h-4 mr-2" />
                Helpful
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Questions
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
                  onEnded={handleLessonCompletion}
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
                        {course.students ?? 0} enrolled
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
                    <Lightbulb className="w-4 h-4" />
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
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
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
                  {currentLesson.quiz && currentLesson.quiz.questions.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Quiz</h3>
                      {currentLesson.quiz.questions.map((question: any, qIndex: number) => (
                        <div key={qIndex} className="mb-6">
                          <p className="font-medium mb-2">{question.question}</p>
                          <RadioGroup
                            value={selectedAnswers[qIndex]?.toString() || ''}
                            onValueChange={(val) => handleAnswerSelect(qIndex, parseInt(val))}
                          >
                            {question.options.map((option: string, oIndex: number) => (
                              <div key={oIndex} className="flex items-center mb-1">
                                <RadioGroupItem value={oIndex.toString()} id={`option-${qIndex}-${oIndex}`} />
                                <Label htmlFor={`option-${qIndex}-${oIndex}`} className="ml-2">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                      <Button onClick={handleQuizSubmit}>Submit Quiz</Button>
                      {showQuizResult && (
                        <Alert className="mt-4">
                          <AlertDescription>Quiz submitted successfully!</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <p>No quiz available for this lesson.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="assignment" className="mt-6">
                <Card className="p-6">
                  {currentLesson.assignment ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Assignment</h3>
                      <p>{currentLesson.assignment.description}</p>
                      <Button className="mt-4">Submit Assignment</Button>
                    </div>
                  ) : (
                    <p>No assignment available for this lesson.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Resources</h3>
                  {currentLesson.resources ? (
                    <ul className="list-disc pl-5">
                      {currentLesson.resources.map((resource: any, index: number) => (
                        <li key={index}>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No resources available for this lesson.</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center gap-2">
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
                        onClick={() => {
                          console.log('Switching to lesson index:', index);
                          setActiveLesson(index);
                        }}
                      >
                        <div className="flex items-start gap-4 w-full">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
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
