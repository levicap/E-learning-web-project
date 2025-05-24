"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Users, Star, Play, Pause, Maximize, Minimize } from "lucide-react"
import CourseReviewForm from "./CourseReviewForm"
import { useUser } from "@clerk/clerk-react"
import { useToast } from "@/hooks/use-toast"

function Enroll() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()
  const { toast } = useToast()
  const [course, setCourse] = useState(state?.course || null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [instructorProfile, setInstructorProfile] = useState(null)
  const videoRef = useRef(null)
  const videoContainerRef = useRef(null)

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!course?._id) return

    setIsLoadingReviews(true)
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${course._id}/reviews`)
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

  // Fetch instructor profile from API
  const fetchInstructorProfile = async () => {
    if (!course?._id) return

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${course._id}/instructor-profile`)
      const data = await response.json()

      if (data.instructorProfile) {
        setInstructorProfile(data.instructorProfile)
      }
    } catch (error) {
      console.error("Error fetching instructor profile:", error)
    }
  }

  // Fetch reviews and instructor profile when component mounts or course changes
  useEffect(() => {
    if (course?._id) {
      fetchReviews()
      fetchInstructorProfile()
    }
  }, [course?._id])

  // If no course data, show message
  if (!course) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>No course selected.</p>
      </div>
    )
  }

  // Calculate total duration (in minutes) from course lessons
  const totalDuration = course.lessons ? course.lessons.reduce((acc, lesson) => acc + Number(lesson.duration), 0) : 0

  // Function to navigate to Payment component with course data
  const handleEnrollPayment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      })
      return
    }

    // If course is free (price is 0), directly enroll the student
    if (course.price === 0) {
      try {
        const response = await fetch("http://localhost:5000/api/students/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-clerk-user-id": user.id,
          },
          body: JSON.stringify({ courseId: course._id }),
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "Enrollment Successful",
            description: "You have been enrolled in this course.",
            variant: "default",
          })
          setIsEnrolled(true)
        } else {
          toast({
            title: "Enrollment Failed",
            description: data.message || "Failed to enroll in this course.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error enrolling in course:", error)
        toast({
          title: "Enrollment Failed",
          description: "An error occurred while enrolling in this course.",
          variant: "destructive",
        })
      }
    } else {
      // For paid courses, navigate to payment page as before
      navigate("/payment", { state: { course } })
    }
  }

  // Toggle video play/pause
  const toggleVideoPlayback = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const container = videoContainerRef.current

    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  // Handle video play/pause events
  const handleVideoPlay = () => setIsPlaying(true)
  const handleVideoPause = () => setIsPlaying(false)
  const handleVideoEnded = () => setIsPlaying(false)

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement ? true : false,
      )
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("msfullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Render each lesson in the curriculum
  const renderLessons = () => {
    if (course.lessons && course.lessons.length > 0) {
      return course.lessons.map((lesson, lessonIndex) => (
        <motion.div
          whileHover={{ scale: 1.01 }}
          key={lessonIndex}
          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{lesson.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">{lesson.duration} min</span>
        </motion.div>
      ))
    } else {
      return <p>No curriculum available.</p>
    }
  }

  // Determine instructor details (if provided as an object)
  const instructor =
    typeof course.instructor === "object"
      ? course.instructor
      : { name: course.instructor, image: "https://via.placeholder.com/150" }

  // Handle review submission
  const handleReviewSubmitted = (data) => {
    console.log("Review submitted:", data)
    // Refresh reviews after submission
    fetchReviews()
  }

  // Fetch enrollment status from the backend
  useEffect(() => {
    let isMounted = true
    let shouldCheckEnrollment = false

    const checkEnrollment = async () => {
      if (user && course._id) {
        try {
          const res = await fetch(`http://localhost:5000/api/users/enrollment-status?courseId=${course._id}`, {
            headers: {
              "Content-Type": "application/json",
              "x-clerk-user-id": user.id,
            },
          })
          const data = await res.json()
          if (isMounted) {
            setIsEnrolled(data.enrolled)
          }
        } catch (error) {
          console.error("Error checking enrollment status:", error)
        }
      }
    }

    if (user && course._id) {
      shouldCheckEnrollment = true
    }

    if (shouldCheckEnrollment) {
      checkEnrollment()
    }

    return () => {
      isMounted = false
    }
  }, [user, course._id])

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

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8 mb-8"
        >
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="animate-pulse">
                  {course.category}
                </Badge>
                <Badge variant="secondary">Price: {course.price === 0 ? "Free" : `${course.price}د.ت`}</Badge>
                <Badge variant="secondary">Rating: {averageRating || course.rating || "N/A"}</Badge>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{course.totalEnrolled ?? 0} students</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{averageRating || course.rating || "N/A"}/5 rating</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Clock className="w-5 h-5 text-green-500" />
                  <span>{totalDuration} minutes</span>
                </motion.div>
              </div>
              {/* Enroll button navigates to Payment */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={handleEnrollPayment}
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Enroll Now - {course.price === 0 ? "Free" : `د.ت${course.price}`}
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-96"
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative rounded-lg overflow-hidden"
                  ref={videoContainerRef}
                >
                  {course.previewVideo ? (
                    <>
                      <video
                        ref={videoRef}
                        src={`http://localhost:5000${course.previewVideo}`}
                        className={`w-full ${isFullscreen ? "h-screen object-contain" : "h-48 object-cover"} rounded-lg`}
                        poster={course.image ? `http://localhost:5000${course.image}` : undefined}
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                        onEnded={handleVideoEnded}
                        controls={false}
                      />
                      <div
                        className={`absolute inset-0 bg-black/30 flex items-center justify-center ${isPlaying && !isFullscreen ? "opacity-0 hover:opacity-100 transition-opacity" : ""}`}
                      >
                        <div
                          className="rounded-full bg-white/80 p-3 shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
                          onClick={toggleVideoPlayback}
                        >
                          {isPlaying ? (
                            <Pause className="h-8 w-8 text-primary" />
                          ) : (
                            <Play className="h-8 w-8 text-primary ml-1" />
                          )}
                        </div>

                        {/* Fullscreen button */}
                        <div
                          className="absolute bottom-3 right-3 rounded-full bg-white/80 p-2 shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-5 w-5 text-primary" />
                          ) : (
                            <Maximize className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={`http://localhost:5000${course.image}`}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center p-4">
                        <p className="text-white text-sm">No preview video available</p>
                      </div>
                    </>
                  )}
                </motion.div>
                <div className="mt-3 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVideoPlayback}
                    disabled={!course.previewVideo}
                    className="flex-1 mr-2"
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    disabled={!course.previewVideo}
                    className="flex-1 ml-2"
                  >
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="content" className="mt-12">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews {reviews.length > 0 && `(${reviews.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.lessons && course.lessons.length > 0
                    ? `${course.lessons.length} lessons • ${totalDuration} minutes total`
                    : "No lessons available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">{renderLessons()}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary">
                      <AvatarFallback>{instructor.name ? instructor.name[0] : "?"}</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-2 -right-2">Trusted Instructor</Badge>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl">{instructorProfile?.name || instructor.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {instructorProfile?.jobRole || "Senior Web Developer & Lead Instructor"}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {instructorProfile?.expertiseAreas
                        ? instructorProfile.expertiseAreas.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        : ["React Expert", "TypeScript", "UI/UX"].map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed">
                    {instructorProfile?.bio ||
                      `With over ${instructorProfile?.experienceYears || 10} years of experience in web development, ${instructorProfile?.name || instructor.name} has trained thousands of developers worldwide.`}
                  </p>
                  {instructorProfile?.experienceYears && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>{instructorProfile.experienceYears} years of experience</span>
                    </div>
                  )}
                  <Separator />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      {reviews.length > 0
                        ? `${reviews.length} reviews • Average rating: ${averageRating}/5`
                        : "No reviews yet"}
                    </CardDescription>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{averageRating}</div>
                      {renderStars(averageRating)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
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
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  {isEnrolled ? (
                    <CourseReviewForm courseId={course._id} onReviewSubmitted={handleReviewSubmitted} />
                  ) : (
                    <p className="text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
                      You need to enroll in this course to submit a review.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Enroll
