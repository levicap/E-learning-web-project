"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from "@clerk/clerk-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
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
  CheckCircle,
} from "lucide-react"

// Helper function to remove extra quotes from a string if present.
const cleanString = (s: string) => {
  if (!s) return s
  return s.replace(/^"|"$/g, "")
}

function CourseContent() {
  const location = useLocation()
  // Debug: Check what state is coming from the previous page
  console.log("Location state:", location.state)

  // Expecting courseId passed as state from the previous page.
  const { courseId } = location.state as { courseId: string }

  const navigate = useNavigate()
  const { user } = useUser()

  // Build the headers using useMemo.
  const authHeaders = useMemo(() => {
    if (!user?.id) return {}
    return {
      "Content-Type": "application/json",
      "x-clerk-user-id": user.id,
    }
  }, [user])

  const [activeLesson, setActiveLesson] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({})
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [visibleSolutions, setVisibleSolutions] = useState<Record<string, boolean>>({})

  // Review state
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [isEnrolled, setIsEnrolled] = useState(true) // Assuming the user is enrolled since they're viewing the content
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  // Fetch course data.
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course data for courseId:", courseId)
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: authHeaders,
        })
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error fetching course:", errorData)
          throw new Error(errorData.message || "Failed to fetch course")
        }
        const data = await response.json()
        console.log("Course data received:", data)
        setCourse(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching course:", error)
        setLoading(false)
      }
    }

    if (user?.id && courseId) {
      fetchCourse()
    }
  }, [courseId, authHeaders, user])

  // Fetch persisted progress data for the course.
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        console.log("Fetching progress for courseId:", courseId)
        const res = await fetch(`http://localhost:5000/api/progress/progress/${courseId}`, {
          headers: authHeaders,
        })
        if (res.ok) {
          const progressData = await res.json()
          console.log("Progress data received:", progressData)
          // Merge the persisted progress into your course state.
          setCourse((prev: any) => ({ ...prev, progress: progressData.progress }))
        } else {
          console.warn("No progress data found for this course")
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      }
    }

    if (user?.id && courseId) {
      fetchProgress()
    }
  }, [courseId, authHeaders, user])

  // Fetch reviews from the API
  const fetchReviews = async () => {
    if (!courseId) return

    setIsLoadingReviews(true)
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/reviews`)
      const data = await response.json()

      if (data.reviews) {
        setReviews(data.reviews)

        // Calculate average rating
        if (data.reviews.length > 0) {
          const totalRating = data.reviews.reduce((sum, review) => sum + review.rating, 0)
          const avg = totalRating / data.reviews.length
          setAverageRating(Number.parseFloat(avg.toFixed(1)))
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch reviews when component mounts
  useEffect(() => {
    if (courseId) {
      fetchReviews()
    }
  }, [courseId])

  // Set the active lesson based on course progress once course data is loaded.
  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0 && typeof course.progress === "number") {
      const totalLessons = course.lessons.length
      // Compute lesson index based on progress percentage.
      let computedLesson = Math.ceil((course.progress / 100) * totalLessons)
      // Clamp the index if it exceeds available lessons.
      if (computedLesson >= totalLessons) computedLesson = totalLessons - 1
      setActiveLesson(computedLesson)
    }
  }, [course])

  // Call progress API when a lesson is completed.
  const handleLessonCompletion = async () => {
    try {
      const lessonId = course.lessons[activeLesson]._id
      console.log("Completing lesson:", lessonId, "for course:", courseId)
      const response = await fetch("http://localhost:5000/api/progress/complete-lesson", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          courseId,
          lessonId,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to update progress:", errorData)
        return
      }
      const data = await response.json()
      console.log("Updated progress data:", data)
      // Update course progress with the new progress value returned from the API.
      setCourse((prev: any) => ({ ...prev, progress: data.progress }))
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleQuizSubmit = () => {
    setShowQuizResult(true)
  }

  // Update selected answer for a given question.
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  // Submit a review
  const submitReview = async () => {
    setReviewError("")
    if (!comment) {
      setReviewError("Comment is required")
      return
    }
    try {
      setReviewLoading(true)
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReviewError(data.message || "Failed to submit review")
      } else {
        setReviewSuccess(true)
        fetchReviews() // Refresh reviews after submission

        // Auto close after showing success message
        setTimeout(() => {
          setIsReviewDialogOpen(false)
          setReviewSuccess(false)
          setComment("")
          setRating(5)
        }, 2000)
      }
    } catch (err) {
      setReviewError("Failed to submit review")
    } finally {
      setReviewLoading(false)
    }
  }

  // Reset review form when dialog closes
  useEffect(() => {
    if (!isReviewDialogOpen) {
      setTimeout(() => {
        setComment("")
        setRating(5)
        setReviewError("")
        setReviewSuccess(false)
      }, 300)
    }
  }, [isReviewDialogOpen])

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    )
  }

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (!course.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No lessons available for this course.</p>
      </div>
    )
  }

  const currentLesson = course.lessons[activeLesson]

  const totalQuizzes = course.lessons.reduce(
    (acc: number, lesson: any) => acc + (lesson.quiz?.questions.length > 0 ? 1 : 0),
    0,
  )
  const totalAssignments = course.lessons.reduce((acc: number, lesson: any) => acc + (lesson.assignment ? 1 : 0), 0)

  // Add a log before navigating to Exam to see what's being sent.
  const handleTakeExam = () => {
    console.log("Navigating to Exam with state:", {
      courseId,
      courseName: course.title,
    })
    navigate("/exam", { state: { courseId, courseName: course.title } })
  }

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
                {reviews.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {averageRating}/5 ({reviews.length})
                  </Badge>
                )}
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
                        {course.instructor?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students ?? 0} enrolled
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {averageRating || course.rating || "N/A"}/5
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
                <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                {/* Conditionally render the "Take Exam" button when progress is 100% */}
                {course.progress === 100 && (
                  <Button className="mt-4 w-full" onClick={handleTakeExam}>
                    Take Exam
                  </Button>
                )}
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
                <TabsTrigger value="reviews">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Reviews {reviews.length > 0 && `(${reviews.length})`}
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Keep Learning King
                      </h3>
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
                  {currentLesson.quiz?.questions?.length ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Quiz</h3>

                      {currentLesson.quiz.questions.map((q, qIndex) => {
                        const userAnswer = selectedAnswers[qIndex]
                        const isCorrect = userAnswer === q.correctAnswer

                        return (
                          <div key={qIndex} className="mb-8">
                            <p className="font-medium mb-4">{q.question}</p>

                            {/* Wrap all options in one RadioGroup */}
                            <RadioGroup
                              value={userAnswer?.toString() || ""}
                              onValueChange={(val) => handleAnswerSelect(qIndex, Number.parseInt(val))}
                              disabled={showQuizResult}
                              className="space-y-2"
                            >
                              {q.options.map((option, oIndex) => {
                                let bgClass = ""
                                if (showQuizResult) {
                                  if (oIndex === q.correctAnswer) {
                                    bgClass = "bg-green-100"
                                  } else if (oIndex === userAnswer && !isCorrect) {
                                    bgClass = "bg-red-100"
                                  }
                                }

                                return (
                                  <div key={oIndex} className={`flex items-center p-2 rounded ${bgClass}`}>
                                    <RadioGroupItem value={oIndex.toString()} id={`option-${qIndex}-${oIndex}`} />
                                    <Label htmlFor={`option-${qIndex}-${oIndex}`} className="ml-2">
                                      {option}
                                    </Label>
                                  </div>
                                )
                              })}
                            </RadioGroup>

                            {showQuizResult && (
                              <p className={`mt-2 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                                {isCorrect
                                  ? "✅ Correct answer!"
                                  : `❌ Wrong answer. The correct answer is "${q.options[q.correctAnswer]}".`}
                              </p>
                            )}
                          </div>
                        )
                      })}

                      <Button onClick={handleQuizSubmit} disabled={showQuizResult} className="mt-4">
                        Submit Quiz
                      </Button>
                    </div>
                  ) : (
                    <p>No quiz available for this lesson.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="assignment" className="mt-6">
                <Card className="p-6">
                  {currentLesson.assignments?.length > 0 ? (
                    currentLesson.assignments.map((asg: any, idx: number) => (
                      <div key={asg._id} className="mb-6">
                        <h3 className="text-xl font-bold">{asg.title}</h3>
                        <p className="mt-2 whitespace-pre-wrap">{asg.content}</p>

                        {/* only show button if there's a solution */}
                        {asg.solution && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() =>
                              setVisibleSolutions((prev) => ({
                                ...prev,
                                [asg._id]: !prev[asg._id],
                              }))
                            }
                          >
                            {visibleSolutions[asg._id] ? "Hide Solution" : "Check Solution"}
                          </Button>
                        )}

                        {/* toggled solution block */}
                        {visibleSolutions[asg._id] && (
                          <div className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">{asg.solution}</div>
                        )}

                        {/* separator if not last */}
                        {idx < currentLesson.assignments.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))
                  ) : (
                    <p>No assignments available for this lesson.</p>
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

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-bold">Student Reviews</h3>
                        <p className="text-muted-foreground">
                          {reviews.length > 0
                            ? `${reviews.length} reviews • Average rating: ${averageRating}/5`
                            : "No reviews yet"}
                        </p>
                      </div>
                      {averageRating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">{averageRating}</div>
                          {renderStars(averageRating)}
                        </div>
                      )}
                    </div>

                    {/* Review Form Dialog */}
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="mb-6" onClick={() => setIsReviewDialogOpen(true)}>
                          <Star className="w-4 h-4 mr-2" />
                          Write a Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        {reviewSuccess ? (
                          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold">Thank You!</DialogTitle>
                            <p className="text-muted-foreground">Your review has been submitted successfully.</p>
                          </div>
                        ) : (
                          <>
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-center">
                                Share Your Experience
                              </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              {/* Star Rating */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">Your Rating</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setRating(star)}
                                      onMouseEnter={() => setHoverRating(star)}
                                      onMouseLeave={() => setHoverRating(0)}
                                      className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110"
                                    >
                                      <Star
                                        className={`h-8 w-8 transition-all ${
                                          (hoverRating ? hoverRating >= star : rating >= star)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Comment */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium">Your Review</label>
                                </div>
                                <Textarea
                                  placeholder="Share your thoughts about this course..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="min-h-[150px] resize-none focus-visible:ring-primary"
                                />
                                <div className="text-xs text-right text-muted-foreground">
                                  {comment.length} characters
                                </div>
                              </div>

                              {reviewError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{reviewError}</div>
                              )}
                            </div>

                            <DialogFooter className="flex justify-between items-center gap-2">
                              <Button variant="ghost" onClick={() => setIsReviewDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={submitReview}
                                disabled={reviewLoading}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {reviewLoading ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Review"
                                )}
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {isLoadingReviews ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border p-4 rounded-lg animate-pulse">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              </div>
                              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review._id} className="border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{review.user?.name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <span className="font-semibold">{review.user?.name || "Anonymous"}</span>
                              <div className="ml-auto flex items-center">{renderStars(review.rating)}</div>
                            </div>
                            <p className="mb-2">{review.comment}</p>
                            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                        </div>
                      )}
                    </div>
                  </div>
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
              {/* Render the "Take Exam" button when progress is 100% */}
              {course.progress === 100 && (
                <Button className="mt-4 w-full" onClick={handleTakeExam}>
                  Take Exam
                </Button>
              )}
            </Card>

            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center gap-2">Course Content</h2>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="p-4">
                  {course.lessons.map((lesson: any, index: number) => (
                    <div key={lesson._id} className="group">
                      <Button
                        variant={activeLesson === index ? "secondary" : "ghost"}
                        className="w-full justify-start mb-2"
                        onClick={() => {
                          console.log("Switching to lesson index:", index)
                          setActiveLesson(index)
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
                            <div className="font-medium group-hover:text-primary transition-colors">{lesson.title}</div>
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
                      {index < course.lessons.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseContent
