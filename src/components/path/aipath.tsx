"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Search, Clock, Star, Sparkles, ChevronRight, Cpu, BookOpen, Code, Layers, PenTool, Zap, Briefcase, Palette, Database, Languages, Music, Heart, FlaskRoundIcon as Flask, Calculator, Utensils, Compass, X } from 'lucide-react'
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"

interface Instructor {
  name: string
  avatar: string
  title: string
}

interface Course {
  id: string
  title: string
  duration: string
  level: string
  description: string
  image: string
  instructor: Instructor
  price: number
  rating: number
  students: number
}

interface RoadmapNode {
  id: string
  title: string
  description: string
  icon: JSX.Element
  courses: Course[]
}

// Form schema
const formSchema = z.object({
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
  careerGoal: z.string().min(2, {
    message: "Career goal must be at least 2 characters.",
  }),
  timeframe: z.string({
    required_error: "Please select a timeframe.",
  }),
  hoursPerWeek: z.number().min(1).max(80),
  priorKnowledge: z.string({
    required_error: "Please select your prior knowledge level.",
  }),
  learningStyle: z.string({
    required_error: "Please select your learning style.",
  }),
})

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  )
}

// Helper function to choose an icon based on the node title and subject category
const getIconForTitle = (title: string) => {
  const title_lower = title.toLowerCase()

  // Programming/Tech related
  if (title_lower.includes("programming") || title_lower.includes("coding") || title_lower.includes("development")) {
    return <Code className="w-5 h-5" />
  }
  // Business related
  else if (
    title_lower.includes("business") ||
    title_lower.includes("marketing") ||
    title_lower.includes("management")
  ) {
    return <Briefcase className="w-5 h-5" />
  }
  // Design related
  else if (title_lower.includes("design") || title_lower.includes("art") || title_lower.includes("creative")) {
    return <Palette className="w-5 h-5" />
  }
  // Data Science related
  else if (title_lower.includes("data") || title_lower.includes("machine learning") || title_lower.includes("ai")) {
    return <Database className="w-5 h-5" />
  }
  // Language related
  else if (title_lower.includes("language") || title_lower.includes("english") || title_lower.includes("spanish")) {
    return <Languages className="w-5 h-5" />
  }
  // Arts related
  else if (title_lower.includes("music") || title_lower.includes("painting") || title_lower.includes("photography")) {
    return <Music className="w-5 h-5" />
  }
  // Health related
  else if (title_lower.includes("health") || title_lower.includes("fitness") || title_lower.includes("nutrition")) {
    return <Heart className="w-5 h-5" />
  }
  // Science related
  else if (title_lower.includes("science") || title_lower.includes("physics") || title_lower.includes("chemistry")) {
    return <Flask className="w-5 h-5" />
  }
  // Math related
  else if (title_lower.includes("math") || title_lower.includes("calculus") || title_lower.includes("algebra")) {
    return <Calculator className="w-5 h-5" />
  }
  // Cooking related
  else if (title_lower.includes("cooking") || title_lower.includes("baking") || title_lower.includes("culinary")) {
    return <Utensils className="w-5 h-5" />
  }
  // Introduction/Basics
  else if (
    title_lower.includes("introduction") ||
    title_lower.includes("basics") ||
    title_lower.includes("fundamentals")
  ) {
    return <BookOpen className="w-5 h-5" />
  }
  // Components/Structure
  else if (
    title_lower.includes("component") ||
    title_lower.includes("structure") ||
    title_lower.includes("framework")
  ) {
    return <Layers className="w-5 h-5" />
  }
  // Projects/Applications
  else if (title_lower.includes("project") || title_lower.includes("app") || title_lower.includes("application")) {
    return <PenTool className="w-5 h-5" />
  }
  // Advanced topics
  else if (title_lower.includes("advanced") || title_lower.includes("expert") || title_lower.includes("mastery")) {
    return <Zap className="w-5 h-5" />
  }
  // Default
  return <Compass className="w-5 h-5" />
}

function LearningPath() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      careerGoal: "General knowledge",
      timeframe: "3 months",
      hoursPerWeek: 10,
      priorKnowledge: "Beginner",
      learningStyle: "Visual",
    },
  })

  // API call to fetch the learning path with all parameters
  const fetchRoadmap = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:5000/api/ai/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch AI learning path")
      }

      // The API returns an object with roadmap data
      const data = await response.json()

      // Check if we have the expected data structure
      if (data.success && data.data && data.data.roadmap) {
        // Transform the API response into an array of RoadmapNode objects
        const nodes: RoadmapNode[] = data.data.roadmap.map((item: any, index: number) => ({
          id: String(index + 1),
          title: item.title,
          description: item.description || `Learn essential concepts for ${item.title}`,
          icon: getIconForTitle(item.title),
          courses: (item.matchingCourses || []).map((course: any) => ({
            id: course._id.toString(),
            title: course.title,
            duration: "4-6 weeks", // Default duration
            level: item.difficulty || "Beginner",
            description: course.description,
            image: course.image || "/placeholder.svg?height=200&width=400",
            instructor: {
              name: course.instructor?.name || "Instructor",
              avatar: "/placeholder.svg?height=50&width=50", // Placeholder avatar
              title: "Instructor",
            },
            price: course.price || 0,
            rating: course.rating || 4.5,
            students: Math.floor(Math.random() * 1000) + 100, // Random number of students
          })),
        }))

        setRoadmapNodes(nodes)
        setIsFormOpen(false) // Close the form after successful submission
      } else {
        // Handle legacy API format
        const legacyNodes: RoadmapNode[] = data.roadmap.map((nodeTitle: string, index: number) => ({
          id: String(index + 1),
          title: nodeTitle,
          description: `Learn essential concepts and skills for ${nodeTitle}`,
          icon: getIconForTitle(nodeTitle),
          courses: data.courses[nodeTitle] || [],
        }))

        setRoadmapNodes(legacyNodes)
        setIsFormOpen(false) // Close the form after successful submission
      }
    } catch (error: any) {
      console.error("Error fetching roadmap:", error)
      setError(error.message || "Failed to generate learning path")
      setRoadmapNodes([])
    } finally {
      setIsLoading(false)
    }
  }

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    fetchRoadmap(values)
  }

  // Quick search handler (uses only subject with default values)
  const handleQuickSearch = () => {
    if (searchTerm.trim()) {
      form.setValue("subject", searchTerm)
      fetchRoadmap({
        subject: searchTerm,
        careerGoal: "General knowledge",
        timeframe: "3 months",
        hoursPerWeek: 10,
        priorKnowledge: "Beginner",
        learningStyle: "Visual",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 mt-20">
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12"

>
          <div className="relative">
            <Brain className="w-12 h-12 text-blue-600" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-blue-100 rounded-full blur-xl"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Learning Path</h1>
            <p className="text-gray-500">Generate personalized learning roadmaps for any subject</p>
          </div>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <Input
              className="h-12 text-lg border-gray-200 focus:border-blue-500"
              placeholder="Try 'Digital Marketing', 'French Cooking', or 'Data Science'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
            />
          </div>
          <Button
            onClick={handleQuickSearch}
            disabled={isLoading}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Cpu className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                Quick Search
              </>
            )}
          </Button>
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white gap-2">
                <Sparkles className="w-4 h-4" /> Personalize
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Personalize Your Learning Path</SheetTitle>
                <SheetDescription>
                  Customize your learning experience by providing more details about your goals and preferences.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. React.js, Digital Marketing, French Cooking" {...field} />
                          </FormControl>
                          <FormDescription>What do you want to learn?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="careerGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Become a front-end developer, Start a business"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>What are you trying to achieve?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeframe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeframe</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a timeframe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1 week">1 week</SelectItem>
                              <SelectItem value="2 weeks">2 weeks</SelectItem>
                              <SelectItem value="1 month">1 month</SelectItem>
                              <SelectItem value="3 months">3 months</SelectItem>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How much time do you have to learn this subject?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hoursPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Per Week: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={40}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>How many hours can you dedicate each week?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priorKnowledge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prior Knowledge</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your knowledge level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>What's your current level of knowledge?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your learning style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Visual">Visual</SelectItem>
                              <SelectItem value="Auditory">Auditory</SelectItem>
                              <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                              <SelectItem value="Kinesthetic">Kinesthetic (Hands-on)</SelectItem>
                              <SelectItem value="Balanced">Balanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How do you prefer to learn?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFormOpen(false)}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                      <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700">
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Cpu className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Generate Roadmap
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3 text-red-600">
                <Search className="w-6 h-6" />
                <p className="font-medium">{error}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {roadmapNodes.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {roadmapNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-gray-100 shadow-lg">
                  <div className="p-6 flex items-start gap-4 bg-gray-50">
                    <div className="bg-white p-3 rounded-lg shadow-sm">{node.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">{node.title}</h2>
                      <p className="text-gray-600">{node.description}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {node.courses.length > 0 ? (
                        node.courses.map((course) => (
                          <motion.div key={course.id} whileHover={{ scale: 1.02 }} className="group">
                            <Card className="overflow-hidden border border-gray-100 shadow-sm">
                              <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={`http://localhost:5000${course.image}`}
                                  alt={course.title}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900">
                                  {course.level}
                                </Badge>
                              </div>

                              <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                                  {course.title}
                                </h3>

                                <div className="flex items-center gap-3 mb-4">
                                  <img
                                    src={course.instructor.avatar || "/placeholder.svg"}
                                    alt={course.instructor.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{course.instructor.name}</p>
                                    <p className="text-sm text-gray-500">{course.instructor.title}</p>
                                  </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                  <StarRating rating={course.rating} />
                                  <span className="text-sm text-gray-500">
                                    {course.students ? course.students.toLocaleString() : "0"} students
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{course.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-gray-900">${course.price}</span>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Enroll Now</Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 p-8 text-center">
                          <p className="text-gray-500">No courses found for this topic. Try a different search term.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {searchTerm && roadmapNodes.length === 0 && !isLoading && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-12 text-center border border-gray-100">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No roadmap found</h3>
              <p className="text-gray-500">
                Try searching for "Digital Marketing", "French Cooking", or "Data Science"
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LearningPath
