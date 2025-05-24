"use client"

import {
  Search,
  BookOpen,
  Users,
  Clock,
  Calendar,
  Trophy,
  Star,
  BookMarked,
  GraduationCap,
  Code,
  Palette,
  Music,
  Bookmark,
  Timer,
  Award,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
"use client"

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

interface CertificateDialogProps {
  courseTitle: string
  courseId: string
}

export function CertificateDialog({ courseTitle, courseId }: CertificateDialogProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const generateCertificate = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("http://localhost:5000/api/certificates/generate-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          course: courseTitle,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.download = `${courseTitle.replace(/\s+/g, "-")}-certificate.pdf`

      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      window.URL.revokeObjectURL(url)

      setOpen(false)
    } catch (error) {
      console.error("Error generating certificate:", error)
      alert("Failed to generate certificate. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Award className="h-4 w-4" />
          Download Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
          <DialogDescription>
            Enter your name as you would like it to appear on your certificate for {courseTitle}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="John Doe"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={generateCertificate} disabled={!name.trim() || isLoading}>
            {isLoading ? "Generating..." : "Generate Certificate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


const categoryIcons = {
  Programming: <Code />,
  "Web Development": <Code />,
  "Computer Science": <GraduationCap />,
  Design: <Palette />,
  Music: <Music />,
  all: <BookMarked />,
}

interface Filters {
  category: string
  difficulty: string[]
  progress: string
  rating: number | null
  duration: string
}

function Learning() {
  const { user } = useUser()
  const clerkId = user?.id
  const navigate = useNavigate()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // items will hold both enrolled courses and sessions fetched from API
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    difficulty: [],
    progress: "all",
    rating: null,
    duration: "all",
  })

  // Fetch enrolled courses and sessions using Clerk user id header
  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!clerkId) return
      try {
        // Fetch courses
        const resCourses = await fetch("http://localhost:5000/api/students/courses", {
          headers: {
            "Content-Type": "application/json",
            "x-clerk-user-id": clerkId,
          },
        })
        const dataCourses = await resCourses.json()

        // Fetch sessions
        const resSessions = await fetch("http://localhost:5000/api/students/sessions", {
          headers: {
            "Content-Type": "application/json",
            "x-clerk-user-id": clerkId,
          },
        })
        const dataSessions = await resSessions.json()

        // Map enrolled courses and sessions to include a type field
        const coursesArray = (dataCourses.enrolledCourses || []).map((item: any) => ({ ...item, type: "course" }))
        const sessionsArray = (dataSessions.enrolledSessions || []).map((item: any) => ({ ...item, type: "session" }))

        // Enrich each course with progress (based on completed lessons) and total hours (converted from minutes)
        const enrichedCourses = await Promise.all(
          coursesArray.map(async (course: any) => {
            try {
              const resProgress = await fetch(`http://localhost:5000/api/progress/progress/${course._id}`, {
                headers: {
                  "Content-Type": "application/json",
                  "x-clerk-user-id": clerkId,
                },
              })
              if (resProgress.ok) {
                const progressData = await resProgress.json()
                // Calculate progress from number of completed lessons vs. total lessons
                const completedCount = progressData.completedLessons ? progressData.completedLessons.length : 0
                const totalLessons = course.lessons ? course.lessons.length : 0
                course.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
                // Save the count for display purposes
                course.completedLessonsCount = completedCount
              } else {
                course.progress = 0
                course.completedLessonsCount = 0
              }
            } catch (error) {
              console.error("Error fetching progress for course", course._id, error)
              course.progress = 0
              course.completedLessonsCount = 0
            }
            // Calculate total hours: sum lesson durations (in minutes) and convert to hours
            course.totalHours = course.lessons
              ? course.lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration || 0), 0) / 60
              : 0
            return course
          }),
        )

        // Combine the enriched courses and sessions
        const combined = [...enrichedCourses, ...sessionsArray]
        setItems(combined)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching enrolled items:", error)
        setLoading(false)
      }
    }

    fetchEnrolled()
  }, [clerkId])

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.instructor?.toLowerCase().includes(search.toLowerCase())
    const matchesType =
      activeTab === "all" ||
      (activeTab === "courses" && item.type === "course") ||
      (activeTab === "sessions" && item.type === "session")
    const matchesCategory = filters.category === "all" || item.category === filters.category

    const matchesDifficulty =
      item.type === "session" || filters.difficulty.length === 0 || filters.difficulty.includes(item.difficulty)

    const matchesProgress =
      filters.progress === "all" ||
      (filters.progress === "inProgress" && item.type === "course" && item.progress > 0 && item.progress < 100) ||
      (filters.progress === "completed" && item.type === "course" && item.progress === 100) ||
      (filters.progress === "notStarted" && item.type === "course" && item.progress === 0)

    const matchesRating = !filters.rating || (item.type === "course" && item.rating >= filters.rating)

    const matchesDuration =
      filters.duration === "all" ||
      (filters.duration === "short" && item.estimatedHours <= 20) ||
      (filters.duration === "medium" && item.estimatedHours > 20 && item.estimatedHours <= 40) ||
      (filters.duration === "long" && item.estimatedHours > 40)

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesDifficulty &&
      matchesProgress &&
      matchesRating &&
      matchesDuration
    )
  })

  // Pagination: Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const categories = ["all", ...new Set(items.map((item) => item.category))]
  const difficulties = ["Beginner", "Intermediate", "Advanced"]

  // Calculate overall metrics for display
  const totalHoursLearned = items
    .filter((item) => item.type === "course")
    .reduce((acc, course) => acc + (course.totalHours || 0) * (course.progress / 100), 0)

  const totalSessions = items.filter((item) => item.type === "session").length
  const totalCourses = items.filter((item) => item.type === "course").length
  const averageProgress =
    items.filter((item) => item.type === "course").length > 0
      ? items.filter((item) => item.type === "course").reduce((acc, course) => acc + (course.progress || 0), 0) /
        totalCourses
      : 0

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const LoadingCard = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category !== "all") count++
    if (filters.difficulty.length > 0) count++
    if (filters.progress !== "all") count++
    if (filters.rating !== null) count++
    if (filters.duration !== "all") count++
    return count
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 mt-20">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-8 w-8" />
                My Learning Dashboard
              </h1>
              <p className="text-muted-foreground">Track your progress and upcoming sessions</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses and sessions..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1) // Reset page on new search
                }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px]">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, category }))
                        setCurrentPage(1)
                      }}
                      className="capitalize flex items-center gap-2"
                    >
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      {category}
                      {filters.category === category && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Difficulty</DropdownMenuLabel>
                  {difficulties.map((difficulty) => (
                    <DropdownMenuCheckboxItem
                      key={difficulty}
                      checked={filters.difficulty.includes(difficulty)}
                      onCheckedChange={(checked) => {
                        setFilters((prev) => ({
                          ...prev,
                          difficulty: checked
                            ? [...prev.difficulty, difficulty]
                            : prev.difficulty.filter((d) => d !== difficulty),
                        }))
                        setCurrentPage(1)
                      }}
                    >
                      {difficulty}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Progress</DropdownMenuLabel>
                  {[
                    { value: "all", label: "All" },
                    { value: "notStarted", label: "Not Started" },
                    { value: "inProgress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, progress: option.value }))
                        setCurrentPage(1)
                      }}
                    >
                      {option.label}
                      {filters.progress === option.value && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Rating</DropdownMenuLabel>
                  {[4, 4.5].map((rating) => (
                    <DropdownMenuItem
                      key={rating}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, rating }))
                        setCurrentPage(1)
                      }}
                      className="flex items-center"
                    >
                      {rating}+ <Star className="h-3 w-3 ml-1 text-yellow-400" />
                      {filters.rating === rating && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Duration</DropdownMenuLabel>
                  {[
                    { value: "all", label: "All" },
                    { value: "short", label: "Short (≤20h)" },
                    { value: "medium", label: "Medium (20-40h)" },
                    { value: "long", label: "Long (>40h)" },
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, duration: option.value }))
                        setCurrentPage(1)
                      }}
                    >
                      {option.label}
                      {filters.duration === option.value && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setFilters({
                      category: "all",
                      difficulty: [],
                      progress: "all",
                      rating: null,
                      duration: "all",
                    })
                    setCurrentPage(1)
                  }}
                >
                  Reset Filters
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours Learned</p>
              <p className="text-2xl font-bold">{Math.round(totalHoursLearned)}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Progress</p>
              <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-full">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <BookOpen className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Users className="h-4 w-4" />
              Tutoring Sessions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-400px)]">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardTitle className="mb-2">No results found</CardTitle>
                    <CardDescription>Try adjusting your filters or search terms</CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {currentItems.map((item) => (
                      <Card
                        key={item._id}
                        className="overflow-hidden group transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="relative">
                          {item.type === "course" ? (
                            <img
                              src={item.image.startsWith("/") ? `http://localhost:5000${item.image}` : item.image}
                              alt={item.title}
                              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : null}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Badge variant={item.type === "course" ? "default" : "secondary"} className="opacity-90">
                              {item.type}
                            </Badge>
                            {item.type === "course" && item.difficulty && (
                              <Badge variant="outline" className="opacity-90 bg-background/50 backdrop-blur-sm">
                                {item.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                              </CardTitle>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <CardDescription className="flex items-center gap-2 cursor-pointer">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={item.instructorAvatar || "/placeholder.svg"} />
                                      <AvatarFallback>{item.instructor ? item.instructor[0] : "U"}</AvatarFallback>
                                    </Avatar>
                                    {item.instructor?.name}{" "}
                                  </CardDescription>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="flex justify-between space-x-4">
                                    <Avatar>
                                      <AvatarImage src={item.instructorAvatar || "/placeholder.svg"} />
                                      <AvatarFallback>{item.instructor ? item.instructor[0] : "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-semibold">{item.instructor}</h4>
                                      <p className="text-sm text-muted-foreground">Expert in {item.category}</p>
                                      {item.type === "course" && item.rating !== undefined && (
                                        <div className="flex items-center pt-2">
                                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                          <span className="text-sm font-medium">{item.rating}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">{item.icon}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {item.type === "course" ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Lessons Completed: {item.completedLessonsCount} /{" "}
                                  {item.lessons ? item.lessons.length : 0}
                                </span>
                                <span>{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="transition-all duration-300" />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.studentsEnrolled?.toLocaleString()} students
                                </span>
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {item.totalHours.toFixed(1)}h total
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {item.rating} rating
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                {new Date(item.date).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                Duration: {item.duration} mins
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Bookmark className="h-4 w-4" />
                                Topic: {item.description}
                              </div>
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Trophy className="h-4 w-4" />
                                Price: ${item.price}
                              </div>
                              <p>Note:Join room with name of :{item.title} when time come for session</p>
                            </div>
                          )}
                          {item.type === "course" && item.progress === 100 && (
                            <CertificateDialog courseTitle={item.title} courseId={item._id} />
                          )}
                          <Button
                            className="w-full group-hover:bg-primary/90 transition-colors"
                            onClick={() => {
                              if (item.type === "course") {
                                navigate("/course-content", { state: { courseId: item._id } })
                                window.location.reload()
                              } else {
                                navigate("/live", { state: { sessionId: item._id } })
                              }
                            }}
                          >
                            {item.type === "course" ? "Continue Learning" : "Join Session"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {/* Pagination Controls */}
                {filteredItems.length > itemsPerPage && (
                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}

export default Learning
