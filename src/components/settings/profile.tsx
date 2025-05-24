"use client"

import { useState, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@clerk/clerk-react"
import {
  Settings,
  Save,
  X,
  Plus,
  Calendar,
  Award,
  Briefcase,
  FileText,
  Edit2,
  Trash2,
  GraduationCap,
  Star,
  Code2,
  Palette,
  Building2,
  Coins,
  BarChartIcon as ChartBar,
  Globe2,
  Users2,
  Lightbulb,
  BookOpen,
  HeartPulse,
  Scale,
  Wrench,
  Leaf,
  Microscope,
  Loader2,
  AlertCircle,
  Mail,
  Link,
  Linkedin,
  School,
  BadgeIcon as Certificate,
  ExternalLink,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Constants
const MAX_BIO_LENGTH = 500
const API_BASE_URL = "http://localhost:5000/api"

// Types
interface Education {
  institution: string
  degree: string
  year: string
}

interface Certification {
  name: string
  issuer: string
  year: string
}

interface InstructorProfile {
  jobRole: string
  expertiseAreas: string[]
  experienceYears: number
  bio: string
  education: string[]
  certifications: string[]
  website: string
  linkedinUrl: string
  name?: string
  email?: string
  _educationObjects?: Education[]
  _certificationsObjects?: Certification[]
}

// Helper functions to convert between UI representation and backend format
const formatEducationForUI = (educationStrings: string[]): Education[] => {
  return educationStrings.map((str) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      // If parsing fails, create a fallback object
      return { institution: str, degree: "", year: "" }
    }
  })
}

const formatEducationForBackend = (educationObjects: Education[]): string[] => {
  return educationObjects.map((edu) => JSON.stringify(edu))
}

const formatCertificationsForUI = (certStrings: string[]): Certification[] => {
  return certStrings.map((str) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      // If parsing fails, create a fallback object
      return { name: str, issuer: "", year: "" }
    }
  })
}

const formatCertificationsForBackend = (certObjects: Certification[]): string[] => {
  return certObjects.map((cert) => JSON.stringify(cert))
}

// API Client Functions
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text()
    try {
      const errorJson = JSON.parse(errorText)
      throw new Error(errorJson.error || errorJson.message || `Error ${response.status}: ${response.statusText}`)
    } catch (e) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
  }
  return response.json()
}

// Custom Hook for Profile Management
const useInstructorProfile = () => {
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get user from Clerk
  const { user } = useUser()

  // Create auth headers with Clerk user ID
  const authHeaders = useMemo(() => {
    if (!user?.id) return {}
    return {
      "Content-Type": "application/json",
      "x-clerk-user-id": user.id,
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/instructor/profile`, {
        headers: authHeaders,
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Profile not found is not an error, just means we need to create one
          setProfile(null)
          setIsLoading(false)
          return null
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Create a UI-friendly version of the profile
      const uiProfile = { ...data }

      // Convert education and certifications to UI format if they exist
      if (Array.isArray(uiProfile.education)) {
        // Store the original education data for the form
        uiProfile._educationObjects = formatEducationForUI(uiProfile.education)
      }

      if (Array.isArray(uiProfile.certifications)) {
        // Store the original certifications data for the form
        uiProfile._certificationsObjects = formatCertificationsForUI(uiProfile.certifications)
      }

      setProfile(uiProfile)
      return uiProfile
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async (data: InstructorProfile) => {
    if (!user?.id) throw new Error("User not authenticated")

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/instructor/profile`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(data),
      })

      const result = await handleResponse(response)
      setProfile(result.profile)
      return result
    } catch (err) {
      console.error("Error saving profile:", err)
      setError(err instanceof Error ? err.message : "Failed to save profile")
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const removeProfile = async () => {
    if (!user?.id) throw new Error("User not authenticated")

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/instructor/profile`, {
        method: "DELETE",
        headers: authHeaders,
      })

      await handleResponse(response)
      setProfile(null)
    } catch (err) {
      console.error("Error deleting profile:", err)
      setError(err instanceof Error ? err.message : "Failed to delete profile")
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  // Load profile on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  return {
    profile,
    isLoading,
    error,
    isSaving,
    isDeleting,
    fetchProfile,
    saveProfile,
    removeProfile,
  }
}

// Default values and schema
const DEFAULT_PROFILE: InstructorProfile = {
  jobRole: "",
  expertiseAreas: [],
  experienceYears: 0,
  bio: "",
  education: [],
  certifications: [],
  website: "",
  linkedinUrl: "",
}

const EXPERTISE_CATEGORIES = [
  {
    label: "Technology",
    icon: Code2,
    options: [
      "Software Development",
      "Web Development",
      "Mobile Development",
      "Cloud Computing",
      "Cybersecurity",
      "DevOps",
      "System Architecture",
      "Database Management",
      "Node.js",
      "MongoDB",
    ],
  },
  {
    label: "Business",
    icon: Building2,
    options: [
      "Strategic Planning",
      "Business Development",
      "Project Management",
      "Operations Management",
      "Change Management",
      "Risk Management",
      "Entrepreneurship",
    ],
  },
  {
    label: "Finance",
    icon: Coins,
    options: [
      "Financial Analysis",
      "Investment Banking",
      "Corporate Finance",
      "Risk Assessment",
      "Portfolio Management",
      "Financial Planning",
      "Cryptocurrency",
    ],
  },
  {
    label: "Marketing",
    icon: ChartBar,
    options: [
      "Digital Marketing",
      "Content Strategy",
      "Brand Management",
      "Social Media Marketing",
      "SEO/SEM",
      "Market Research",
      "Public Relations",
    ],
  },
  {
    label: "International",
    icon: Globe2,
    options: [
      "Global Business",
      "Cross-cultural Communication",
      "International Trade",
      "Foreign Languages",
      "Global Markets",
      "Export/Import",
    ],
  },
  {
    label: "Leadership",
    icon: Users2,
    options: [
      "Team Leadership",
      "Executive Management",
      "Organizational Development",
      "Mentoring",
      "Strategic Leadership",
      "Crisis Management",
    ],
  },
  {
    label: "Innovation",
    icon: Lightbulb,
    options: [
      "Product Innovation",
      "R&D Management",
      "Design Thinking",
      "Creative Direction",
      "Innovation Strategy",
      "Digital Transformation",
    ],
  },
  {
    label: "Legal",
    icon: Scale,
    options: [
      "Corporate Law",
      "Intellectual Property",
      "Contract Management",
      "Regulatory Compliance",
      "Legal Research",
      "Risk & Compliance",
    ],
  },
  {
    label: "Healthcare",
    icon: HeartPulse,
    options: [
      "Healthcare Management",
      "Medical Research",
      "Clinical Operations",
      "Health Informatics",
      "Patient Care",
      "Healthcare Policy",
    ],
  },
  {
    label: "Education",
    icon: BookOpen,
    options: [
      "Teaching",
      "Curriculum Development",
      "Educational Technology",
      "Training & Development",
      "E-learning",
      "Academic Research",
    ],
  },
  {
    label: "Creative",
    icon: Palette,
    options: ["Graphic Design", "UX/UI Design", "Content Creation", "Visual Design", "Brand Design", "Motion Graphics"],
  },
  {
    label: "Science",
    icon: Microscope,
    options: [
      "Data Science",
      "Research & Development",
      "Laboratory Management",
      "Scientific Writing",
      "Experimental Design",
    ],
  },
  {
    label: "Engineering",
    icon: Wrench,
    options: [
      "Mechanical Engineering",
      "Electrical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Industrial Engineering",
    ],
  },
  {
    label: "Sustainability",
    icon: Leaf,
    options: [
      "Environmental Management",
      "Sustainable Development",
      "Green Technology",
      "Renewable Energy",
      "Climate Change",
    ],
  },
]

const educationSchema = z.object({
  institution: z.string().min(1, { message: "Institution is required" }),
  degree: z.string().min(1, { message: "Degree is required" }),
  year: z.string().min(1, { message: "Year is required" }),
})

const certificationSchema = z.object({
  name: z.string().min(1, { message: "Certification name is required" }),
  issuer: z.string().min(1, { message: "Issuer is required" }),
  year: z.string().min(1, { message: "Year is required" }),
})

const formSchema = z.object({
  jobRole: z.string().min(1, { message: "Job role is required" }),
  expertiseAreas: z.array(z.string()).min(1, { message: "Select at least one area of expertise" }),
  experienceYears: z.number().min(0).max(50),
  bio: z.string().max(MAX_BIO_LENGTH, { message: `Bio must be ${MAX_BIO_LENGTH} characters or less` }),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  website: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL" }).or(z.string().length(0)),
  name: z.string().optional(),
  email: z.string().optional(),
})

// Main Component
function InstructorProfile() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [newEducation, setNewEducation] = useState<Education>({ institution: "", degree: "", year: "" })
  const [newCertification, setNewCertification] = useState<Certification>({ name: "", issuer: "", year: "" })

  // Get user from Clerk
  const { user, isLoaded: isUserLoaded } = useUser()

  // Use the custom hook
  const { profile, isLoading, error, isSaving, isDeleting, fetchProfile, saveProfile, removeProfile } =
    useInstructorProfile()

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: profile || DEFAULT_PROFILE,
  })

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      // Create a copy of the profile for the form
      const formProfile = { ...profile }

      // Use the UI objects if available
      if (profile._educationObjects) {
        formProfile.education = profile._educationObjects
      }

      if (profile._certificationsObjects) {
        formProfile.certifications = profile._certificationsObjects
      }

      form.reset(formProfile)
    }
  }, [profile, form])

  const watchBio = form.watch("bio")
  const bioLength = watchBio?.length || 0
  const bioPercentage = (bioLength / MAX_BIO_LENGTH) * 100

  const handleSave = async (data: any) => {
    try {
      // Create a copy of the data to modify
      const formattedData = { ...data }

      // Convert education and certifications to the format expected by the backend
      if (
        Array.isArray(formattedData.education) &&
        formattedData.education.length > 0 &&
        typeof formattedData.education[0] !== "string"
      ) {
        formattedData.education = formatEducationForBackend(formattedData.education)
      }

      if (
        Array.isArray(formattedData.certifications) &&
        formattedData.certifications.length > 0 &&
        typeof formattedData.certifications[0] !== "string"
      ) {
        formattedData.certifications = formatCertificationsForBackend(formattedData.certifications)
      }

      await saveProfile(formattedData)
      setIsEditing(false)

      toast({
        title: profile ? "Profile updated" : "Profile created",
        description: "Your professional profile has been saved successfully.",
      })
    } catch (err) {
      console.error("Error saving profile:", err)
      toast({
        title: "Error saving profile",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await removeProfile()
      form.reset(DEFAULT_PROFILE)
      setDeleteDialogOpen(false)

      toast({
        title: "Profile deleted",
        description: "Your profile has been permanently deleted.",
        variant: "destructive",
      })
    } catch (err) {
      toast({
        title: "Error deleting profile",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const addExpertise = (expertise: string) => {
    const current = form.getValues("expertiseAreas")
    if (!current.includes(expertise)) {
      form.setValue("expertiseAreas", [...current, expertise], { shouldValidate: true })
    }
  }

  const removeExpertise = (expertise: string) => {
    const current = form.getValues("expertiseAreas")
    form.setValue(
      "expertiseAreas",
      current.filter((item) => item !== expertise),
      { shouldValidate: true },
    )
  }

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.year) {
      const current = form.getValues("education") || []
      form.setValue("education", [...current, { ...newEducation }], { shouldValidate: true })
      setNewEducation({ institution: "", degree: "", year: "" })
    }
  }

  const removeEducation = (index: number) => {
    const current = form.getValues("education")
    form.setValue(
      "education",
      current.filter((_, i) => i !== index),
      { shouldValidate: true },
    )
  }

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.year) {
      const current = form.getValues("certifications") || []
      form.setValue("certifications", [...current, { ...newCertification }], { shouldValidate: true })
      setNewCertification({ name: "", issuer: "", year: "" })
    }
  }

  const removeCertification = (index: number) => {
    const current = form.getValues("certifications")
    form.setValue(
      "certifications",
      current.filter((_, i) => i !== index),
      { shouldValidate: true },
    )
  }

  const getInitials = (role: string) => {
    return role
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy")
  }

  // Show loading state if Clerk user is not loaded yet or profile is loading
  if (!isUserLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading profile...</h2>
        </div>
      </div>
    )
  }

  // Show authentication required message if no user
  if (isUserLoaded && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your instructor profile.</p>
          <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-black">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <header className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                <GraduationCap className="h-10 w-10 text-blue-600" />
                Professional Profile
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Showcase your expertise and experience</p>
            </div>
            {profile && !isEditing && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </header>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isEditing || !profile ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                <Card className="border-none shadow-lg">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Settings className="h-6 w-6 text-blue-600" />
                      {profile ? "Edit Profile" : "Create Profile"}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {profile ? "Update your professional information" : "Set up your professional profile"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-5 gap-2 bg-gray-100/80 p-1">
                        <TabsTrigger
                          value="basic"
                          className={cn("flex items-center gap-2 py-3", activeTab === "basic" && "bg-white shadow-sm")}
                        >
                          <Briefcase className="h-4 w-4" />
                          Basic Info
                        </TabsTrigger>
                        <TabsTrigger
                          value="expertise"
                          className={cn(
                            "flex items-center gap-2 py-3",
                            activeTab === "expertise" && "bg-white shadow-sm",
                          )}
                        >
                          <Star className="h-4 w-4" />
                          Expertise
                        </TabsTrigger>
                        <TabsTrigger
                          value="education"
                          className={cn(
                            "flex items-center gap-2 py-3",
                            activeTab === "education" && "bg-white shadow-sm",
                          )}
                        >
                          <School className="h-4 w-4" />
                          Education
                        </TabsTrigger>
                        <TabsTrigger
                          value="certifications"
                          className={cn(
                            "flex items-center gap-2 py-3",
                            activeTab === "certifications" && "bg-white shadow-sm",
                          )}
                        >
                          <Certificate className="h-4 w-4" />
                          Certifications
                        </TabsTrigger>
                        <TabsTrigger
                          value="bio"
                          className={cn("flex items-center gap-2 py-3", activeTab === "bio" && "bg-white shadow-sm")}
                        >
                          <FileText className="h-4 w-4" />
                          Bio & Links
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="jobRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Job Role</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Lead Instructor" {...field} className="h-12 text-lg" />
                              </FormControl>
                              <FormDescription>Enter your current job role or position</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experienceYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Years of Experience</FormLabel>
                              <FormControl>
                                <div className="pt-4">
                                  <Slider
                                    min={0}
                                    max={30}
                                    step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </div>
                              </FormControl>
                              <div className="flex justify-between text-sm text-gray-600 mt-2">
                                <span>Entry Level</span>
                                <span className="font-medium text-base text-blue-600">{field.value} years</span>
                                <span>Senior Level</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="expertise" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="expertiseAreas"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-base">Areas of Expertise</FormLabel>
                              <ScrollArea className="h-[500px] rounded-xl border bg-gray-50/50 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {EXPERTISE_CATEGORIES.map((category) => {
                                    const Icon = category.icon
                                    return (
                                      <div key={category.label} className="bg-white rounded-lg p-4 shadow-sm">
                                        <h3 className="flex items-center gap-2 font-medium text-lg mb-3">
                                          <Icon className="h-5 w-5 text-blue-600" />
                                          {category.label}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                          {category.options.map((option) => {
                                            const isSelected = form.getValues("expertiseAreas")?.includes(option)
                                            return (
                                              <Badge
                                                key={option}
                                                variant={isSelected ? "default" : "outline"}
                                                className={cn(
                                                  "cursor-pointer transition-all hover:scale-105",
                                                  isSelected
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "hover:border-blue-400",
                                                )}
                                                onClick={() =>
                                                  isSelected ? removeExpertise(option) : addExpertise(option)
                                                }
                                              >
                                                {option}
                                                {isSelected && <X className="ml-1 h-3 w-3" />}
                                              </Badge>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </ScrollArea>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-gray-50 rounded-lg p-4">
                          <FormLabel className="text-base">Add Custom Expertise</FormLabel>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Enter custom skill or expertise"
                              className="h-12"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  const value = (e.target as HTMLInputElement).value.trim()
                                  if (value) {
                                    addExpertise(value)
                                    ;(e.target as HTMLInputElement).value = ""
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={() => {
                                const input = document.querySelector(
                                  'input[placeholder="Enter custom skill or expertise"]',
                                ) as HTMLInputElement
                                const value = input.value.trim()
                                if (value) {
                                  addExpertise(value)
                                  input.value = ""
                                }
                              }}
                              className="flex items-center gap-2 min-w-[120px]"
                            >
                              <Plus className="h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="education" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="education"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-base">Education History</FormLabel>
                              <div className="space-y-4">
                                {form.getValues("education")?.length > 0 ? (
                                  <div className="space-y-3">
                                    {form.getValues("education").map((edu, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between bg-white p-4 rounded-lg border"
                                      >
                                        <div>
                                          <p className="font-medium">{edu.degree}</p>
                                          <p className="text-sm text-gray-600">
                                            {edu.institution} • {edu.year}
                                          </p>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeEducation(index)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <School className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No education history added yet</p>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <FormLabel className="text-base">Add Education</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              placeholder="Institution"
                              value={newEducation.institution}
                              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                              className="h-12"
                            />
                            <Input
                              placeholder="Degree"
                              value={newEducation.degree}
                              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                              className="h-12"
                            />
                            <Input
                              placeholder="Year"
                              value={newEducation.year}
                              onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                              className="h-12"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={addEducation}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={
                              !newEducation.institution.trim() ||
                              !newEducation.degree.trim() ||
                              !newEducation.year.trim()
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="certifications" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="certifications"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-base">Professional Certifications</FormLabel>
                              <div className="space-y-4">
                                {form.getValues("certifications")?.length > 0 ? (
                                  <div className="space-y-3">
                                    {form.getValues("certifications").map((cert, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between bg-white p-4 rounded-lg border"
                                      >
                                        <div>
                                          <p className="font-medium">{cert.name}</p>
                                          <p className="text-sm text-gray-600">
                                            {cert.issuer} • {cert.year}
                                          </p>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeCertification(index)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <Certificate className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">No certifications added yet</p>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <FormLabel className="text-base">Add Certification</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              placeholder="Certification Name"
                              value={newCertification.name}
                              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                              className="h-12"
                            />
                            <Input
                              placeholder="Issuing Organization"
                              value={newCertification.issuer}
                              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                              className="h-12"
                            />
                            <Input
                              placeholder="Year"
                              value={newCertification.year}
                              onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })}
                              className="h-12"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={addCertification}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={
                              !newCertification.name.trim() ||
                              !newCertification.issuer.trim() ||
                              !newCertification.year.trim()
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="bio" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Professional Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Write a brief professional summary..."
                                  className="min-h-[200px] resize-none text-lg leading-relaxed"
                                  {...field}
                                />
                              </FormControl>
                              <div className="flex justify-between items-center mt-2">
                                <FormDescription>Highlight your key achievements and expertise</FormDescription>
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    bioPercentage > 90 ? "text-red-500" : "text-gray-500",
                                  )}
                                >
                                  {bioLength}/{MAX_BIO_LENGTH}
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base flex items-center gap-2">
                                  <Globe2 className="h-4 w-4 text-blue-600" />
                                  Website
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourwebsite.com" {...field} className="h-12" />
                                </FormControl>
                                <FormDescription>Your personal or professional website</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="linkedinUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base flex items-center gap-2">
                                  <Linkedin className="h-4 w-4 text-blue-600" />
                                  LinkedIn Profile
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    {...field}
                                    className="h-12"
                                  />
                                </FormControl>
                                <FormDescription>Your LinkedIn profile URL</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>

                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        if (profile) {
                          setIsEditing(false)
                          form.reset(profile)
                        }
                      }}
                      className="min-w-[120px]"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="min-w-[160px] bg-blue-600 hover:bg-blue-700"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {profile ? "Update Profile" : "Create Profile"}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          ) : profile ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20 bg-blue-600 text-white text-2xl border-4 border-white shadow-md">
                        <AvatarFallback>{getInitials(profile.jobRole)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-3xl font-bold">{profile.jobRole}</CardTitle>
                            {profile.name && <p className="text-gray-600 mt-1">{profile.name}</p>}
                          </div>
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Instructor</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <CardDescription className="flex items-center gap-2 text-base">
                            <Calendar className="h-5 w-5" />
                            {profile.experienceYears} years of experience
                          </CardDescription>
                          {profile.email && (
                            <CardDescription className="flex items-center gap-2 text-base">
                              <Mail className="h-5 w-5" />
                              {profile.email}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-8 p-8">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Award className="h-6 w-6 text-blue-600" />
                        Areas of Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.expertiseAreas.map((area, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1 text-base bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {profile._educationObjects && profile._educationObjects.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                          <School className="h-6 w-6 text-blue-600" />
                          Education
                        </h3>
                        <div className="space-y-3">
                          {profile._educationObjects.map((edu, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium text-lg">{edu.degree}</p>
                              <p className="text-gray-600">
                                {edu.institution} • {edu.year}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile._certificationsObjects && profile._certificationsObjects.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                          <Certificate className="h-6 w-6 text-blue-600" />
                          Certifications
                        </h3>
                        <div className="space-y-3">
                          {profile._certificationsObjects.map((cert, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium text-lg">{cert.name}</p>
                              <p className="text-gray-600">
                                {cert.issuer} • {cert.year}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Professional Bio
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{profile.bio}</p>
                    </div>

                    {(profile.website || profile.linkedinUrl) && (
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                          <Link className="h-6 w-6 text-blue-600" />
                          Online Presence
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {profile.website && (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors"
                            >
                              <Globe2 className="h-5 w-5" />
                              Website
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {profile.linkedinUrl && (
                            <a
                              href={profile.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors"
                            >
                              <Linkedin className="h-5 w-5" />
                              LinkedIn
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 pt-4 border-t">Last updated {formatDate(new Date())}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <GraduationCap className="h-20 w-20 mx-auto text-blue-600 mb-6" />
              <h2 className="text-2xl font-bold mb-3">No Profile Yet</h2>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                Create your professional profile to showcase your expertise and experience
              </p>
              <Button onClick={() => setIsEditing(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Create Your Profile
              </Button>
            </div>
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your profile? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ToastViewport />
      </div>
    </ToastProvider>
  )
}

export default InstructorProfile
