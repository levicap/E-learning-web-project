"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Video, BookOpen, Info, DollarSign, Clock, Link, File, X, Plus, Trash2 } from "lucide-react"
import { useUser } from "@clerk/clerk-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Update the LessonSchema to make validation more flexible
const LessonSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    duration: z.number().min(1, "Must be greater than 0"),
    videoLink: z.string().optional(),
    videoFile: z.any().optional(),
  })
  .refine((data) => data.videoLink || data.videoFile, {
    message: "Either a video link or file is required",
    path: ["videoFile"],
  })

// Update the CourseSchema to make image optional
const CourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructor: z.string().min(1, "Instructor is required"),
  price: z.number().min(0, "Must be a non-negative number"),
  image: z.any().optional(),
  previewVideo: z.any().optional(),
  category: z.string().min(1, "Category is required"),
  lessons: z.array(z.any()).min(1, "At least one lesson is required"),
  students: z.array(z.any()).optional(),
  progress: z.array(z.any()).optional(),
})

export const CreateCourseDialog = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("details")

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: user?.fullName || "",
    price: 0,
    image: null,
    previewVideo: null,
    category: "",
    lessons: [],
    students: [],
    progress: [],
  })

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    duration: 0,
    videoLink: "",
    videoFile: null,
  })

  // Field-level errors
  const [courseErrors, setCourseErrors] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    category: "",
    lessons: "",
    image: "",
  })

  const [lessonErrors, setLessonErrors] = useState({
    title: "",
    description: "",
    duration: "",
    videoLink: "",
    videoFile: "",
  })

  const [submissionError, setSubmissionError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Validate course fields
  const validateCourseField = (field, value) => {
    try {
      const schema = CourseSchema.shape[field]
      schema.parse(value)
      setCourseErrors((prev) => ({ ...prev, [field]: "" }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setCourseErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || `Invalid ${field}`,
        }))
      }
      return false
    }
  }

  // Update the validation for lesson fields to be more lenient with video requirements
  const validateLessonField = (field, value) => {
    try {
      // Special case for videoLink and videoFile - we only need one of them
      if (field === "videoLink" || field === "videoFile") {
        if (field === "videoLink" && value) {
          // If we have a videoLink, validate it's a URL
          if (!/^(https?:\/\/)/.test(value)) {
            setLessonErrors((prev) => ({
              ...prev,
              [field]: "Must be a valid URL",
            }))
            return false
          }
        }

        // Clear the error for this field
        setLessonErrors((prev) => ({ ...prev, [field]: "" }))
        return true
      }

      // For other fields, use the schema validation
      const schema = LessonSchema.shape[field]
      schema.parse(value)
      setLessonErrors((prev) => ({ ...prev, [field]: "" }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLessonErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || `Invalid ${field}`,
        }))
      }
      return false
    }
  }

  // File input handlers
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0] || null
    setNewCourse({ ...newCourse, image: file })
    validateCourseField("image", file)
  }

  const handlePreviewUpload = (e) => {
    const file = e.target.files?.[0] || null
    setNewCourse({ ...newCourse, previewVideo: file })
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0] || null
    setNewLesson({ ...newLesson, videoFile: file })
    validateLessonField("videoFile", file)
  }

  const handleVideoLinkChange = (e) => {
    const value = e.target.value
    setNewLesson({ ...newLesson, videoLink: value })
    validateLessonField("videoLink", value)
  }

  // Add lesson
  const addLesson = () => {
    // Check if we have either a video link or a video file
    if (!newLesson.videoLink && !newLesson.videoFile) {
      setLessonErrors((prev) => ({
        ...prev,
        videoLink: "Either a video link or file is required",
        videoFile: "Either a video link or file is required",
      }))
      return
    }

    // Validate required fields
    let isValid = true

    // Validate title
    if (!newLesson.title.trim()) {
      setLessonErrors((prev) => ({ ...prev, title: "Title is required" }))
      isValid = false
    } else {
      setLessonErrors((prev) => ({ ...prev, title: "" }))
    }

    // Validate description
    if (!newLesson.description.trim()) {
      setLessonErrors((prev) => ({ ...prev, description: "Description is required" }))
      isValid = false
    } else {
      setLessonErrors((prev) => ({ ...prev, description: "" }))
    }

    // Validate duration
    if (newLesson.duration <= 0) {
      setLessonErrors((prev) => ({ ...prev, duration: "Duration must be greater than 0" }))
      isValid = false
    } else {
      setLessonErrors((prev) => ({ ...prev, duration: "" }))
    }

    // Validate video link if provided
    if (newLesson.videoLink && !/^(https?:\/\/)/.test(newLesson.videoLink)) {
      setLessonErrors((prev) => ({ ...prev, videoLink: "Must be a valid URL" }))
      isValid = false
    } else {
      setLessonErrors((prev) => ({ ...prev, videoLink: "" }))
    }

    if (!isValid) return

    // Clear video errors since we've validated them
    setLessonErrors((prev) => ({
      ...prev,
      videoLink: "",
      videoFile: "",
    }))

    // Add lesson to course
    const updatedLessons = [...newCourse.lessons, newLesson]
    setNewCourse({
      ...newCourse,
      lessons: updatedLessons,
    })

    // Reset lesson form
    setNewLesson({
      title: "",
      description: "",
      duration: 0,
      videoLink: "",
      videoFile: null,
    })

    // Clear all lesson errors
    setLessonErrors({
      title: "",
      description: "",
      duration: "",
      videoLink: "",
      videoFile: "",
    })

    // Update course errors for lessons if needed
    if (updatedLessons.length > 0) {
      setCourseErrors((prev) => ({ ...prev, lessons: "" }))
    }
  }

  // Remove lesson
  const removeLesson = (index) => {
    const updatedLessons = [...newCourse.lessons]
    updatedLessons.splice(index, 1)
    setNewCourse({
      ...newCourse,
      lessons: updatedLessons,
    })
    validateCourseField("lessons", updatedLessons)
  }

  // Reset form
  const resetCourseForm = () => {
    setSubmissionError("")
    setCourseErrors({
      title: "",
      description: "",
      instructor: "",
      price: "",
      category: "",
      lessons: "",
      image: "",
    })
    setLessonErrors({
      title: "",
      description: "",
      duration: "",
      videoLink: "",
      videoFile: "",
    })
    setNewCourse({
      title: "",
      description: "",
      instructor: user?.fullName || "",
      price: 0,
      image: null,
      previewVideo: null,
      category: "",
      lessons: [],
      students: [],
      progress: [],
    })
    setNewLesson({
      title: "",
      description: "",
      duration: 0,
      videoLink: "",
      videoFile: null,
    })
    setActiveTab("details")
  }

  // Validate all course fields
  const validateAllCourseFields = () => {
    const isValid = true
    let hasErrors = false

    // Reset all errors first
    setCourseErrors({
      title: "",
      description: "",
      instructor: "",
      price: "",
      category: "",
      lessons: "",
      image: "",
    })

    // Check required fields
    if (!newCourse.title.trim()) {
      setCourseErrors((prev) => ({ ...prev, title: "Title is required" }))
      hasErrors = true
    }

    if (!newCourse.description.trim()) {
      setCourseErrors((prev) => ({ ...prev, description: "Description is required" }))
      hasErrors = true
    }

    if (!newCourse.instructor.trim()) {
      setCourseErrors((prev) => ({ ...prev, instructor: "Instructor is required" }))
      hasErrors = true
    }

    if (!newCourse.category.trim()) {
      setCourseErrors((prev) => ({ ...prev, category: "Category is required" }))
      hasErrors = true
    }

    if (newCourse.price < 0) {
      setCourseErrors((prev) => ({ ...prev, price: "Price must be a non-negative number" }))
      hasErrors = true
    }

    // Check if we have at least one lesson
    if (newCourse.lessons.length === 0) {
      setCourseErrors((prev) => ({ ...prev, lessons: "At least one lesson is required" }))
      hasErrors = true
    }

    return !hasErrors
  }

  // Submit course
  const addCourse = async () => {
    // First check if we have lessons
    if (newCourse.lessons.length === 0) {
      setCourseErrors((prev) => ({ ...prev, lessons: "At least one lesson is required" }))
      setActiveTab("lessons")
      setSubmissionError("Please add at least one lesson before submitting")
      return
    }

    // Validate all fields
    if (!validateAllCourseFields()) {
      setSubmissionError("Please fix all errors before submitting")
      return
    }

    // If we get here, validation passed
    setSubmissionError("")

    let updatedLessons = [...newCourse.lessons]

    // Add preview video as first lesson if provided
    if (newCourse.previewVideo) {
      updatedLessons = [
        {
          title: "Preview",
          description: "Preview video of the course",
          duration: 0,
          videoLink: "",
          videoFile: newCourse.previewVideo,
        },
        ...newCourse.lessons,
      ]
    }

    // Prepare form data
    const formData = new FormData()
    formData.append("title", newCourse.title)
    formData.append("description", newCourse.description)
    formData.append("instructor", newCourse.instructor)
    formData.append("price", String(newCourse.price))
    formData.append("category", newCourse.category)
    formData.append("students", JSON.stringify(newCourse.students))
    formData.append("progress", JSON.stringify(newCourse.progress))

    if (newCourse.image) formData.append("image", newCourse.image)
    if (newCourse.previewVideo) formData.append("previewVideo", newCourse.previewVideo)

    // Prepare lessons for JSON (without video files)
    const lessonsForJSON = updatedLessons.map(({ videoFile, ...rest }) => rest)
    formData.append("lessons", JSON.stringify(lessonsForJSON))

    // Add video files separately
    updatedLessons.forEach((lesson, idx) => {
      if (lesson.videoFile) formData.append(`lessonVideo${idx}`, lesson.videoFile)
    })

    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "x-clerk-user-id": user?.id || "" },
        body: formData,
      })

      if (!res.ok) throw new Error("Server error")

      resetCourseForm()
      setIsOpen(false)
    } catch (error) {
      setSubmissionError("Error creating course. Please try again later.")
    }
  }

  const handleCourseInputChange = (field, value) => {
    setNewCourse({ ...newCourse, [field]: value })
    validateCourseField(field, value)
  }

  const handleLessonInputChange = (field, value) => {
    setNewLesson({ ...newLesson, [field]: value })
    validateLessonField(field, value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to your learning platform</DialogDescription>
        </DialogHeader>

        {submissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Course Details
            </TabsTrigger>
            <TabsTrigger value="media">
              <Video className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="lessons">
              <BookOpen className="h-4 w-4 mr-2" />
              Lessons{" "}
              {newCourse.lessons.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {newCourse.lessons.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] pr-4">
            <TabsContent value="details" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center justify-between">
                    Title
                    {courseErrors.title && <span className="text-xs text-destructive">{courseErrors.title}</span>}
                  </Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => handleCourseInputChange("title", e.target.value)}
                    className={courseErrors.title ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="flex items-center justify-between">
                    Instructor
                    {courseErrors.instructor && (
                      <span className="text-xs text-destructive">{courseErrors.instructor}</span>
                    )}
                  </Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor}
                    onChange={(e) => handleCourseInputChange("instructor", e.target.value)}
                    className={courseErrors.instructor ? "border-destructive" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center justify-between">
                  Description
                  {courseErrors.description && (
                    <span className="text-xs text-destructive">{courseErrors.description}</span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => handleCourseInputChange("description", e.target.value)}
                  className={courseErrors.description ? "border-destructive" : ""}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center justify-between">
                    Price (TND)
                    {courseErrors.price && <span className="text-xs text-destructive">{courseErrors.price}</span>}
                  </Label>
                  <div className="relative">
                 
                    <Input
                      id="price"
                      type="number"
                      value={newCourse.price === 0 ? "" : newCourse.price}
                      onChange={(e) => {
                        const val = e.target.value
                        handleCourseInputChange("price", val === "" ? 0 : Number.parseFloat(val))
                      }}
                      className={`pl-8 ${courseErrors.price ? "border-destructive" : ""}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center justify-between">
                    Category
                    {courseErrors.category && <span className="text-xs text-destructive">{courseErrors.category}</span>}
                  </Label>
                  <Input
                    id="category"
                    value={newCourse.category}
                    onChange={(e) => handleCourseInputChange("category", e.target.value)}
                    className={courseErrors.category ? "border-destructive" : ""}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setActiveTab("media")} className="w-full">
                  Next: Add Media
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center justify-between">
                  Course Cover Image
                  {courseErrors.image && <span className="text-xs text-destructive">{courseErrors.image}</span>}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                    <Input id="image" type="file" onChange={handleImageUpload} className="hidden" />
                    <Label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      {!newCourse.image ? (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                        </>
                      ) : (
                        <div className="relative w-full">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6 rounded-full z-10"
                            onClick={(e) => {
                              e.preventDefault()
                              setNewCourse({ ...newCourse, image: null })
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground block mb-2">{newCourse.image.name}</span>
                        </div>
                      )}
                    </Label>
                  </div>
                  <div className="border rounded-md p-2 flex items-center justify-center bg-muted/20">
                    {newCourse.image ? (
                      <img
                        src={URL.createObjectURL(newCourse.image) || "/placeholder.svg"}
                        alt="Cover Preview"
                        className="max-h-[150px] max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">Image preview</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previewVideo" className="flex items-center justify-between">
                  Course Preview Video (optional)
                </Label>
                <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                  <Input
                    id="previewVideo"
                    type="file"
                    accept="video/*"
                    onChange={handlePreviewUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="previewVideo"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {!newCourse.previewVideo ? (
                      <>
                        <Video className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload preview video</span>
                      </>
                    ) : (
                      <div className="relative w-full">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0 h-6 w-6 rounded-full z-10"
                          onClick={(e) => {
                            e.preventDefault()
                            setNewCourse({ ...newCourse, previewVideo: null })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Video className="h-8 w-8 text-primary" />
                        <span className="text-sm block mt-2">{newCourse.previewVideo.name}</span>
                      </div>
                    )}
                  </Label>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("lessons")}>
                  Next: Add Lessons
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-4 mt-0">
              {courseErrors.lessons && (
                <Alert variant="destructive">
                  <AlertDescription>{courseErrors.lessons}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Add New Lesson</CardTitle>
                  <CardDescription>Create a lesson for your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lessonTitle" className="flex items-center justify-between">
                        Lesson Title
                        {lessonErrors.title && <span className="text-xs text-destructive">{lessonErrors.title}</span>}
                      </Label>
                      <Input
                        id="lessonTitle"
                        placeholder="Introduction to the course"
                        value={newLesson.title}
                        onChange={(e) => handleLessonInputChange("title", e.target.value)}
                        className={lessonErrors.title ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessonDuration" className="flex items-center justify-between">
                        Duration (minutes)
                        {lessonErrors.duration && (
                          <span className="text-xs text-destructive">{lessonErrors.duration}</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lessonDuration"
                          placeholder="15"
                          type="number"
                          value={newLesson.duration === 0 ? "" : newLesson.duration}
                          onChange={(e) => {
                            const val = e.target.value
                            handleLessonInputChange("duration", val === "" ? 0 : Number.parseFloat(val))
                          }}
                          className={`pl-8 ${lessonErrors.duration ? "border-destructive" : ""}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonDescription" className="flex items-center justify-between">
                      Lesson Description
                      {lessonErrors.description && (
                        <span className="text-xs text-destructive">{lessonErrors.description}</span>
                      )}
                    </Label>
                    <Textarea
                      id="lessonDescription"
                      placeholder="A brief overview of what this lesson covers"
                      value={newLesson.description}
                      onChange={(e) => handleLessonInputChange("description", e.target.value)}
                      className={lessonErrors.description ? "border-destructive" : ""}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonVideoLink" className="flex items-center justify-between">
                      Video URL (optional)
                      {lessonErrors.videoLink && (
                        <span className="text-xs text-destructive">{lessonErrors.videoLink}</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Link className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lessonVideoLink"
                        placeholder="https://example.com/video.mp4"
                        value={newLesson.videoLink}
                        onChange={handleVideoLinkChange}
                        className={`pl-8 ${lessonErrors.videoLink ? "border-destructive" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonVideoFile" className="flex items-center justify-between">
                      Video File (optional)
                      {lessonErrors.videoFile && (
                        <span className="text-xs text-destructive">{lessonErrors.videoFile}</span>
                      )}
                    </Label>
                    <div
                      className={`border rounded-md p-3 flex items-center justify-center ${lessonErrors.videoFile ? "border-destructive" : ""}`}
                    >
                      <Input
                        id="lessonVideoFile"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="lessonVideoFile"
                        className="cursor-pointer flex items-center justify-center gap-2 w-full"
                      >
                        {!newLesson.videoFile ? (
                          <>
                            <File className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Upload video file</span>
                          </>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-primary" />
                              <span className="text-sm truncate max-w-[200px]">{newLesson.videoFile.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.preventDefault()
                                setNewLesson({ ...newLesson, videoFile: null })
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addLesson} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </Button>
                </CardFooter>
              </Card>

              {newCourse.lessons.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Course Lessons ({newCourse.lessons.length})</h3>
                  <div className="border rounded-md divide-y">
                    {newCourse.lessons.map((lesson, idx) => (
                      <div key={idx} className="p-4 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{idx + 1}</Badge>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration} min
                            </span>
                            {lesson.videoFile && (
                              <span className="flex items-center gap-1">
                                <File className="h-3 w-3" />
                                {lesson.videoFile.name.length > 20
                                  ? lesson.videoFile.name.substring(0, 20) + "..."
                                  : lesson.videoFile.name}
                              </span>
                            )}
                            {lesson.videoLink && (
                              <span className="flex items-center gap-1">
                                <Link className="h-3 w-3" />
                                External video
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLesson(idx)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("media")}>
                  Back
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => {
              resetCourseForm()
              setIsOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={addCourse} className="gap-2">
            <Upload className="h-4 w-4" />
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCourseDialog
