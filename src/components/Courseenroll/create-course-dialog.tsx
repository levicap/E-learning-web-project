"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Upload, Plus, X, BookOpen, Clock, Video, FileVideo } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

// Lesson validation schema
const LessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().min(1, "Lesson description is required"),
  duration: z.number().min(0, "Duration must be a non-negative number"),
  videoLink: z
    .string()
    .optional()
    .refine((val) => !val || /^(https?:\/\/)/.test(val), { message: "Video link must be a valid URL" }),
  videoFile: z.any().optional(),
})

// Course validation schema
const CourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  instructor: z.string().min(1, "Instructor is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  image: z.any().optional(),
  previewVideo: z.any().optional(),
  category: z.string().min(1, "Category is required"),
  lessons: z.array(LessonSchema).min(1, "Add at least one lesson to your course"),
})

export const CreateCourseDialog = () => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const formRef = useRef<HTMLFormElement>(null)

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    price: 0,
    image: null as File | null,
    previewVideo: null as File | null,
    category: "",
    lessons: [] as Array<{
      title: string
      description: string
      duration: number
      videoLink: string
      videoFile: File | null
    }>,
  })

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    duration: 0,
    videoLink: "",
    videoFile: null as File | null,
  })

  const [errors, setErrors] = useState<{
    course?: Record<string, string[]>
    lesson?: Record<string, string[]>
  }>({})

  const validateFileType = (file: File, allowedTypes: string[]) => {
    return allowedTypes.includes(file.type)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && !validateFileType(file, ALLOWED_IMAGE_TYPES)) {
      setErrors((prev) => ({
        ...prev,
        course: {
          ...prev.course,
          image: ["Invalid image type. Use JPEG or PNG only."],
        },
      }))
      return
    }
    setNewCourse({ ...newCourse, image: file })
    if (errors.course?.image) {
      const { image, ...rest } = errors.course
      setErrors({ ...errors, course: rest })
    }
  }

  const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && !validateFileType(file, ALLOWED_VIDEO_TYPES)) {
      setErrors((prev) => ({
        ...prev,
        course: {
          ...prev.course,
          previewVideo: ["Invalid video type. Use MP4, WebM, or QuickTime only."],
        },
      }))
      return
    }
    setNewCourse({ ...newCourse, previewVideo: file })
    if (errors.course?.previewVideo) {
      const { previewVideo, ...rest } = errors.course
      setErrors({ ...errors, course: rest })
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && !validateFileType(file, ALLOWED_VIDEO_TYPES)) {
      setErrors((prev) => ({
        ...prev,
        lesson: {
          ...prev.lesson,
          videoFile: ["Invalid video type. Use MP4, WebM, or QuickTime only."],
        },
      }))
      return
    }
    setNewLesson({ ...newLesson, videoFile: file })
    if (errors.lesson?.videoFile) {
      const { videoFile, ...rest } = errors.lesson
      setErrors({ ...errors, lesson: rest })
    }
  }

  const addLesson = () => {
    try {
      LessonSchema.parse(newLesson)

      if (!newLesson.videoLink && !newLesson.videoFile) {
        setErrors((prev) => ({
          ...prev,
          lesson: {
            ...prev.lesson,
            videoSource: ["Please provide either a video link or upload a video file"],
          },
        }))
        return
      }

      setNewCourse({
        ...newCourse,
        lessons: [...newCourse.lessons, { ...newLesson }],
      })

      setNewLesson({
        title: "",
        description: "",
        duration: 0,
        videoLink: "",
        videoFile: null,
      })

      setErrors((prev) => ({ ...prev, lesson: {} }))

      toast({
        title: "Lesson added",
        description: `${newLesson.title} has been added to the course.`,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {}
        error.errors.forEach((err) => {
          const field = err.path[0]
          if (!formattedErrors[field as string]) {
            formattedErrors[field as string] = []
          }
          formattedErrors[field as string].push(err.message)
        })
        setErrors((prev) => ({ ...prev, lesson: formattedErrors }))
      }
    }
  }

  const removeLesson = (index: number) => {
    const updatedLessons = [...newCourse.lessons]
    updatedLessons.splice(index, 1)
    setNewCourse({ ...newCourse, lessons: updatedLessons })
  }

  const resetCourseForm = () => {
    setNewCourse({
      title: "",
      description: "",
      instructor: "",
      price: 0,
      image: null,
      previewVideo: null,
      category: "",
      lessons: [],
    })
    setNewLesson({
      title: "",
      description: "",
      duration: 0,
      videoLink: "",
      videoFile: null,
    })
    setErrors({})
    setActiveTab("basic")
    setOpen(false)
  }

  const addCourse = async () => {
    try {
      CourseSchema.parse(newCourse)
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("title", newCourse.title)
      formData.append("description", newCourse.description)
      formData.append("instructor", newCourse.instructor)
      formData.append("price", String(newCourse.price))
      formData.append("category", newCourse.category)

      if (newCourse.image) {
        formData.append("image", newCourse.image)
      }

      if (newCourse.previewVideo) {
        formData.append("previewVideo", newCourse.previewVideo)
      }

      const lessonsForJSON = newCourse.lessons.map(({ videoFile, ...rest }) => rest)
      formData.append("lessons", JSON.stringify(lessonsForJSON))

      // Log form data for debugging
      console.log("Submitting course with lessons:", newCourse.lessons.length)

      newCourse.lessons.forEach((lesson, idx) => {
        if (lesson.videoFile) {
          console.log(`Appending lesson video ${idx}:`, lesson.videoFile.name, lesson.videoFile.type)
          formData.append(`lessonVideo${idx}`, lesson.videoFile)
        }
      })

      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Server error")
      }

      toast({
        title: "Course created successfully",
        description: "Your course has been created and is now available.",
      })

      resetCourseForm()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string[]> = {}
        error.errors.forEach((err) => {
          const field = err.path[0]
          if (!formattedErrors[field as string]) {
            formattedErrors[field as string] = []
          }
          formattedErrors[field as string].push(err.message)
        })
        setErrors((prev) => ({ ...prev, course: formattedErrors }))

        const firstErrorField = error.errors[0].path[0] as string
        if (firstErrorField === "lessons") {
          setActiveTab("lessons")
        } else {
          setActiveTab("basic")
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error creating course",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })
        console.error("Course creation error:", error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl lg:max-w-5xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create New Course</DialogTitle>
          <DialogDescription>Build your course by filling out the information below</DialogDescription>
        </DialogHeader>

        <form ref={formRef} className="space-y-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Course Information</TabsTrigger>
              <TabsTrigger
                value="lessons"
                className="relative"
                disabled={!newCourse.title || !newCourse.description || !newCourse.category}
              >
                Lessons
                {newCourse.lessons.length > 0 && (
                  <span className="absolute top-0 right-1 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {newCourse.lessons.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className={cn(errors.course?.title && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.course?.title && <p className="text-sm text-destructive">{errors.course.title[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-base">
                    Instructor Name
                  </Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className={cn(errors.course?.instructor && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.course?.instructor && (
                    <p className="text-sm text-destructive">{errors.course.instructor[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={4}
                  className={cn(errors.course?.description && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.course?.description && (
                  <p className="text-sm text-destructive">{errors.course.description[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">
                    Price (USD)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCourse.price === 0 ? "" : newCourse.price}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewCourse({ ...newCourse, price: val === "" ? 0 : Number.parseFloat(val) })
                    }}
                    className={cn(errors.course?.price && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.course?.price && <p className="text-sm text-destructive">{errors.course.price[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className={cn(errors.course?.category && "border-destructive focus-visible:ring-destructive")}
                    placeholder="e.g., Programming, Design, Business"
                  />
                  {errors.course?.category && <p className="text-sm text-destructive">{errors.course.category[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-base">
                    Cover Image (JPEG/PNG)
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="image"
                        type="file"
                        onChange={handleImageUpload}
                        className="p-2"
                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                      />
                      {newCourse.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setNewCourse({ ...newCourse, image: null })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {errors.course?.image && <p className="text-sm text-destructive">{errors.course.image[0]}</p>}
                  {newCourse.image && (
                    <div className="relative mt-2 rounded-md overflow-hidden w-full h-32">
                      <img
                        src={URL.createObjectURL(newCourse.image) || "/placeholder.svg"}
                        alt="Course cover"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previewVideo" className="text-base">
                  Preview Video (MP4, WebM, QuickTime)
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="previewVideo"
                      type="file"
                      accept={ALLOWED_VIDEO_TYPES.join(",")}
                      onChange={handlePreviewUpload}
                      className="p-2"
                    />
                    {newCourse.previewVideo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setNewCourse({ ...newCourse, previewVideo: null })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {errors.course?.previewVideo && (
                  <p className="text-sm text-destructive">{errors.course.previewVideo[0]}</p>
                )}
                {newCourse.previewVideo && (
                  <p className="text-sm font-medium mt-1">Selected: {newCourse.previewVideo.name}</p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setActiveTab("lessons")}
                  disabled={!newCourse.title || !newCourse.description || !newCourse.category}
                >
                  Continue to Lessons
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Add New Lesson</CardTitle>
                  <CardDescription>Create individual lessons for your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lessonTitle" className="text-base">
                        Lesson Title
                      </Label>
                      <Input
                        id="lessonTitle"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        className={cn(errors.lesson?.title && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.lesson?.title && <p className="text-sm text-destructive">{errors.lesson.title[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-base">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        value={newLesson.duration === 0 ? "" : newLesson.duration}
                        onChange={(e) => {
                          const val = e.target.value
                          setNewLesson({ ...newLesson, duration: val === "" ? 0 : Number.parseFloat(val) })
                        }}
                        className={cn(errors.lesson?.duration && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.lesson?.duration && (
                        <p className="text-sm text-destructive">{errors.lesson.duration[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonDescription" className="text-base">
                      Description
                    </Label>
                    <Textarea
                      id="lessonDescription"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      rows={3}
                      className={cn(errors.lesson?.description && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.lesson?.description && (
                      <p className="text-sm text-destructive">{errors.lesson.description[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Lesson Video</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileVideo className="h-4 w-4" />
                          <span className="text-sm font-medium">Upload Video File (MP4, WebM, QuickTime)</span>
                        </div>
                        <div className="relative">
                          <Input
                            type="file"
                            accept={ALLOWED_VIDEO_TYPES.join(",")}
                            onChange={handleVideoUpload}
                            className="p-2"
                          />
                          {newLesson.videoFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setNewLesson({ ...newLesson, videoFile: null })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {newLesson.videoFile && (
                          <p className="text-sm font-medium">Selected: {newLesson.videoFile.name}</p>
                        )}
                        {errors.lesson?.videoFile && (
                          <p className="text-sm text-destructive">{errors.lesson.videoFile[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span className="text-sm font-medium">Or Provide Video URL</span>
                        </div>
                        <Input
                          placeholder="https://example.com/video.mp4"
                          value={newLesson.videoLink}
                          onChange={(e) => setNewLesson({ ...newLesson, videoLink: e.target.value })}
                          className={cn(
                            errors.lesson?.videoLink && "border-destructive focus-visible:ring-destructive",
                          )}
                        />
                        {errors.lesson?.videoLink && (
                          <p className="text-sm text-destructive">{errors.lesson.videoLink[0]}</p>
                        )}
                      </div>
                    </div>
                    {errors.lesson?.videoSource && (
                      <p className="text-sm text-destructive">{errors.lesson.videoSource[0]}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="button"
                    onClick={addLesson}
                    disabled={!newLesson.title || !newLesson.description}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Lesson
                  </Button>
                </CardFooter>
              </Card>

              {newCourse.lessons.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Course Lessons ({newCourse.lessons.length})</h3>
                  <Accordion type="multiple" className="w-full">
                    {newCourse.lessons.map((lesson, idx) => (
                      <AccordionItem key={idx} value={`lesson-${idx}`} className="border rounded-md mb-3">
                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                          <div className="flex items-center gap-2 text-left">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-sm">
                              {idx + 1}
                            </span>
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{lesson.duration} minutes</span>
                            </div>
                            <p className="text-sm">{lesson.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                              {lesson.videoFile ? (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <FileVideo className="h-4 w-4" />
                                  <span>Video file: {lesson.videoFile.name}</span>
                                </div>
                              ) : lesson.videoLink ? (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Video className="h-4 w-4" />
                                  <span>Video URL: {lesson.videoLink}</span>
                                </div>
                              ) : null}
                            </div>
                            <div className="pt-2">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeLesson(idx)}
                                className="gap-1"
                              >
                                <X className="h-3 w-3" /> Remove
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) : (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>No lessons added yet. Add at least one lesson to create your course.</span>
                  </AlertDescription>
                </Alert>
              )}

              {errors.course?.lessons && <p className="text-sm text-destructive">{errors.course.lessons[0]}</p>}
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetCourseForm} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={addCourse} disabled={isSubmitting || newCourse.lessons.length === 0} className="gap-1">
            {isSubmitting ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCourseDialog
