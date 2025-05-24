"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Copy,
  FileDown,
  MoreHorizontal,
  Trash2,
  Clock,
  CheckSquare,
  FileText,
  LinkIcon,
  ExternalLink,
  Paperclip,
  Code,
  BookOpen,
  Target,
  Users,
  BarChart,
  HelpCircle,
  Search,
  ImageIcon,
  Camera,
  ChevronDown,
  ChevronRight,
  Layers,
  ArrowRight,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import jsPDF from "jspdf"
import "jspdf-autotable"

// Types
interface SubSegment {
  id: string
  title: string
  content: string
  duration: number
  resources: Resource[]
  order: number
}

interface Resource {
  id: string
  type: "pdf" | "image" | "link" | "slide" | "screenshot" | "example"
  title: string
  url: string
  thumbnail?: string
  segmentId?: string
  subSegmentId?: string
  content?: string
  dateAdded: string
}

interface TimelinePoint {
  id: string
  time: number
  resourceId: string
  note: string
}

interface Segment {
  id: string
  title: string
  content: string
  duration: number
  tags: string[]
  checklist: { id: string; text: string; checked: boolean }[]
  resources: Resource[]
  timeline: TimelinePoint[]
  learningObjectives: string[]
  studentActivities: { id: string; description: string; duration: number }[]
  difficultyLevel: "beginner" | "intermediate" | "advanced" | ""
  prerequisites: string[]
  notes: string
  subSegments: SubSegment[]
  expanded?: boolean
}

export default function Home() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("storyboard")
  const [segments, setSegments] = useState<Segment[]>([])
  const [showTimeline, setShowTimeline] = useState(false)
  const [newSegmentTitle, setNewSegmentTitle] = useState("")
  const [newSegmentContent, setNewSegmentContent] = useState("")
  const [newSegmentDuration, setNewSegmentDuration] = useState(5)
  const [newSegmentTags, setNewSegmentTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<{ name: string; color: string }[]>([
    { name: "Demo", color: "bg-red-500" },
    { name: "Voiceover", color: "bg-blue-500" },
    { name: "Intro", color: "bg-green-500" },
    { name: "Conclusion", color: "bg-purple-500" },
  ])
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("bg-gray-500")
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false)
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [isResourcePreviewOpen, setIsResourcePreviewOpen] = useState(false)
  const [previewResource, setPreviewResource] = useState<Resource | null>(null)
  const [isTimelinePointDialogOpen, setIsTimelinePointDialogOpen] = useState(false)
  const [newTimelinePoint, setNewTimelinePoint] = useState<Partial<TimelinePoint>>({
    time: 0,
    note: "",
  })
  const [editingObjective, setEditingObjective] = useState("")
  const [editingActivity, setEditingActivity] = useState<{ description: string; duration: number }>({
    description: "",
    duration: 5,
  })
  const [editingPrerequisite, setEditingPrerequisite] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    type: "link",
    title: "",
    url: "",
  })
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false)
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [isScreenshotMode, setIsScreenshotMode] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [editingSubSegment, setEditingSubSegment] = useState<SubSegment | null>(null)
  const [isSubSegmentDialogOpen, setIsSubSegmentDialogOpen] = useState(false)
  const [isAIGenerateDialogOpen, setIsAIGenerateDialogOpen] = useState(false)
  const [courseIdea, setCourseIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSegmentForSubSegment, setCurrentSegmentForSubSegment] = useState<string | null>(null)

  useEffect(() => {
    // Check if it's the first visit to show a welcome toast
    const hasVisited = localStorage.getItem("hasVisitedBefore")
    if (!hasVisited) {
      toast({
        title: "Welcome to Storyboard Manager",
        description: "Create, organize, and export your storyboards with ease.",
      })
      localStorage.setItem("hasVisitedBefore", "true")
    }
  }, [toast])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedSegments = localStorage.getItem("storyboardSegments")
    const savedTags = localStorage.getItem("storyboardTags")
    const savedResources = localStorage.getItem("resourceBinder")

    if (savedSegments) {
      const parsedSegments = JSON.parse(savedSegments)
      // Ensure all segments have the subSegments property
      const updatedSegments = parsedSegments.map((segment: any) => ({
        ...segment,
        subSegments: segment.subSegments || [],
        expanded: segment.expanded !== undefined ? segment.expanded : true,
      }))
      setSegments(updatedSegments)
    }
    if (savedTags) setAvailableTags(JSON.parse(savedTags))
    if (savedResources) setResources(JSON.parse(savedResources))
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("storyboardSegments", JSON.stringify(segments))
  }, [segments])

  useEffect(() => {
    localStorage.setItem("storyboardTags", JSON.stringify(availableTags))
  }, [availableTags])

  useEffect(() => {
    localStorage.setItem("resourceBinder", JSON.stringify(resources))
  }, [resources])

  // Setup camera for screenshot mode
  useEffect(() => {
    if (isScreenshotMode && videoRef.current) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error("Error accessing camera:", err)
          toast({
            title: "Camera Error",
            description: "Could not access your camera. Please check permissions.",
            variant: "destructive",
          })
          setIsScreenshotMode(false)
        }
      }

      startCamera()

      // Cleanup function
      return () => {
        const stream = videoRef.current?.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }, [isScreenshotMode, toast])

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(segments)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSegments(items)
  }

  // Add a new segment
  const addSegment = () => {
    if (!newSegmentTitle.trim()) {
      toast({
        title: "Error",
        description: "Segment title is required",
        variant: "destructive",
      })
      return
    }

    const newSegment: Segment = {
      id: Date.now().toString(),
      title: newSegmentTitle,
      content: newSegmentContent,
      duration: newSegmentDuration,
      tags: newSegmentTags,
      checklist: [],
      resources: [],
      timeline: [],
      learningObjectives: [],
      studentActivities: [],
      difficultyLevel: "",
      prerequisites: [],
      notes: "",
      subSegments: [],
      expanded: true,
    }

    setSegments([...segments, newSegment])
    resetSegmentForm()
    setIsSegmentDialogOpen(false)

    toast({
      title: "Segment added",
      description: `"${newSegmentTitle}" has been added to your storyboard.`,
    })
  }

  // Update an existing segment
  const updateSegment = () => {
    if (!editingSegment) return

    const updatedSegments = segments.map((segment) => (segment.id === editingSegment.id ? editingSegment : segment))

    setSegments(updatedSegments)
    setEditingSegment(null)
    setIsSegmentDialogOpen(false)

    toast({
      title: "Segment updated",
      description: `"${editingSegment.title}" has been updated.`,
    })
  }

  // Delete a segment
  const deleteSegment = (id: string) => {
    const segmentToDelete = segments.find((s) => s.id === id)
    setSegments(segments.filter((segment) => segment.id !== id))

    toast({
      title: "Segment deleted",
      description: segmentToDelete ? `"${segmentToDelete.title}" has been removed.` : "Segment has been removed.",
    })
  }

  // Add a new tag
  const addNewTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      })
      return
    }

    const newTag = {
      name: newTagName,
      color: newTagColor,
    }

    setAvailableTags([...availableTags, newTag])
    setNewTagName("")
    setNewTagColor("bg-gray-500")
    setIsNewTagDialogOpen(false)

    toast({
      title: "Tag added",
      description: `"${newTagName}" tag has been added.`,
    })
  }

  // Toggle a tag for the current segment
  const toggleTag = (tagName: string) => {
    if (editingSegment) {
      const updatedTags = editingSegment.tags.includes(tagName)
        ? editingSegment.tags.filter((t) => t !== tagName)
        : [...editingSegment.tags, tagName]

      setEditingSegment({
        ...editingSegment,
        tags: updatedTags,
      })
    } else {
      const updatedTags = newSegmentTags.includes(tagName)
        ? newSegmentTags.filter((t) => t !== tagName)
        : [...newSegmentTags, tagName]

      setNewSegmentTags(updatedTags)
    }
  }

  // Add a checklist item to the current segment
  const addChecklistItem = () => {
    if (editingSegment) {
      const newItem = {
        id: Date.now().toString(),
        text: "New checklist item",
        checked: false,
      }

      setEditingSegment({
        ...editingSegment,
        checklist: [...editingSegment.checklist, newItem],
      })
    }
  }

  // Update a checklist item
  const updateChecklistItem = (itemId: string, text: string) => {
    if (editingSegment) {
      const updatedChecklist = editingSegment.checklist.map((item) => (item.id === itemId ? { ...item, text } : item))

      setEditingSegment({
        ...editingSegment,
        checklist: updatedChecklist,
      })
    }
  }

  // Toggle a checklist item's checked status
  const toggleChecklistItem = (itemId: string) => {
    if (editingSegment) {
      const updatedChecklist = editingSegment.checklist.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      )

      setEditingSegment({
        ...editingSegment,
        checklist: updatedChecklist,
      })
    }
  }

  // Delete a checklist item
  const deleteChecklistItem = (itemId: string) => {
    if (editingSegment) {
      setEditingSegment({
        ...editingSegment,
        checklist: editingSegment.checklist.filter((item) => item.id !== itemId),
      })
    }
  }

  // Export the entire storyboard as PDF
  const exportAsPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.text("Storyboard", 14, 20)

    let yPos = 30

    segments.forEach((segment, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      // Segment title
      doc.setFontSize(16)
      doc.text(`${index + 1}. ${segment.title}`, 14, yPos)
      yPos += 10

      // Duration
      doc.setFontSize(10)
      doc.text(`Duration: ${segment.duration} minutes`, 14, yPos)
      yPos += 6

      // Tags
      if (segment.tags.length > 0) {
        doc.text(`Tags: ${segment.tags.join(", ")}`, 14, yPos)
        yPos += 6
      }

      // Content
      doc.setFontSize(12)
      const contentLines = doc.splitTextToSize(segment.content, 180)
      doc.text(contentLines, 14, yPos)
      yPos += contentLines.length * 6 + 6

      // Learning Objectives
      if (segment.learningObjectives.length > 0) {
        doc.setFontSize(14)
        doc.text("Learning Objectives:", 14, yPos)
        yPos += 8

        doc.setFontSize(10)
        segment.learningObjectives.forEach((objective) => {
          const objLines = doc.splitTextToSize(`• ${objective}`, 180)
          doc.text(objLines, 14, yPos)
          yPos += objLines.length * 5 + 2
        })
        yPos += 4
      }

      // Subsegments
      if (segment.subSegments.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.text("Subsegments:", 14, yPos)
        yPos += 8

        segment.subSegments.forEach((subsegment, subIndex) => {
          doc.setFontSize(12)
          doc.text(`${index + 1}.${subIndex + 1} ${subsegment.title} (${subsegment.duration} min)`, 20, yPos)
          yPos += 6

          const subContentLines = doc.splitTextToSize(subsegment.content, 170)
          doc.setFontSize(10)
          doc.text(subContentLines, 20, yPos)
          yPos += subContentLines.length * 5 + 6

          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
        })
      }

      // Add some space between segments
      yPos += 10

      // Add a page break if needed
      if (yPos > 250 && index < segments.length - 1) {
        doc.addPage()
        yPos = 20
      }
    })

    // Save the PDF
    doc.save("storyboard.pdf")

    toast({
      title: "Export successful",
      description: "Your storyboard has been exported as PDF.",
    })
  }

  // Reset the new segment form
  const resetSegmentForm = () => {
    setNewSegmentTitle("")
    setNewSegmentContent("")
    setNewSegmentDuration(5)
    setNewSegmentTags([])
  }

  // Edit an existing segment
  const editSegment = (segment: Segment) => {
    setEditingSegment(segment)
    setIsSegmentDialogOpen(true)
  }

  // Calculate the total duration of all segments
  const totalDuration = segments.reduce((total, segment) => {
    const segmentDuration = segment.duration
    const subSegmentsDuration = segment.subSegments.reduce((subTotal, subSegment) => subTotal + subSegment.duration, 0)
    return total + segmentDuration + subSegmentsDuration
  }, 0)

  // Get the color for a tag
  const getTagColor = (tagName: string) => {
    const tag = availableTags.find((t) => t.name === tagName)
    return tag ? tag.color : "bg-gray-500"
  }

  // Preview a resource
  const handlePreviewResource = (resource: Resource) => {
    setPreviewResource(resource)
    setIsResourcePreviewOpen(true)
  }

  // Preview resource item (used in resource binder)
  const previewResourceItem = (resource: Resource) => {
    setPreviewResource(resource)
    setIsResourcePreviewOpen(true)
  }

  // Add a resource to the current segment
  const addResourceToSegment = (segmentId: string, resource: Resource) => {
    if (!editingSegment || editingSegment.id !== segmentId) return

    // Check if resource is already in the segment
    if (editingSegment.resources.some((r) => r.id === resource.id)) {
      toast({
        title: "Resource already added",
        description: "This resource is already in the segment.",
      })
      return
    }

    const updatedSegment = {
      ...editingSegment,
      resources: [...editingSegment.resources, resource],
    }

    setEditingSegment(updatedSegment)
  }

  // Remove a resource from the segment
  const removeResourceFromSegment = (resourceId: string) => {
    if (!editingSegment) return

    const updatedSegment = {
      ...editingSegment,
      resources: editingSegment.resources.filter((r) => r.id !== resourceId),
      timeline: editingSegment.timeline.filter((t) => t.resourceId !== resourceId),
    }

    setEditingSegment(updatedSegment)
  }

  // Add a timeline point for a resource
  const addTimelinePoint = () => {
    if (!editingSegment || !newTimelinePoint.resourceId) return

    const newPoint: TimelinePoint = {
      id: Date.now().toString(),
      time: newTimelinePoint.time || 0,
      resourceId: newTimelinePoint.resourceId,
      note: newTimelinePoint.note || "",
    }

    const updatedSegment = {
      ...editingSegment,
      timeline: [...editingSegment.timeline, newPoint],
    }

    setEditingSegment(updatedSegment)
    setNewTimelinePoint({
      time: 0,
      note: "",
    })
    setIsTimelinePointDialogOpen(false)

    toast({
      title: "Timeline point added",
      description: "Resource has been added to the timeline.",
    })
  }

  // Remove a timeline point
  const removeTimelinePoint = (pointId: string) => {
    if (!editingSegment) return

    const updatedSegment = {
      ...editingSegment,
      timeline: editingSegment.timeline.filter((t) => t.id !== pointId),
    }

    setEditingSegment(updatedSegment)
  }

  // Get a resource by ID
  const getResourceById = (resourceId: string) => {
    return resources.find((r) => r.id === resourceId)
  }

  const addLearningObjective = () => {
    if (!editingSegment || !editingObjective.trim()) return

    setEditingSegment({
      ...editingSegment,
      learningObjectives: [...editingSegment.learningObjectives, editingObjective],
    })

    setEditingObjective("")
  }

  const removeLearningObjective = (index: number) => {
    if (!editingSegment) return

    const updatedObjectives = [...editingSegment.learningObjectives]
    updatedObjectives.splice(index, 1)

    setEditingSegment({
      ...editingSegment,
      learningObjectives: updatedObjectives,
    })
  }

  // Add functions to manage student activities
  const addStudentActivity = () => {
    if (!editingSegment || !editingActivity.description.trim()) return

    const newActivity = {
      id: Date.now().toString(),
      description: editingActivity.description,
      duration: editingActivity.duration,
    }

    setEditingSegment({
      ...editingSegment,
      studentActivities: [...editingSegment.studentActivities, newActivity],
    })

    setEditingActivity({
      description: "",
      duration: 5,
    })
  }

  const removeStudentActivity = (id: string) => {
    if (!editingSegment) return

    setEditingSegment({
      ...editingSegment,
      studentActivities: editingSegment.studentActivities.filter((activity) => activity.id !== id),
    })
  }

  // Add functions to manage prerequisites
  const addPrerequisite = () => {
    if (!editingSegment || !editingPrerequisite.trim()) return

    setEditingSegment({
      ...editingSegment,
      prerequisites: [...editingSegment.prerequisites, editingPrerequisite],
    })

    setEditingPrerequisite("")
  }

  const removePrerequisite = (index: number) => {
    if (!editingSegment) return

    const updatedPrerequisites = [...editingSegment.prerequisites]
    updatedPrerequisites.splice(index, 1)

    setEditingSegment({
      ...editingSegment,
      prerequisites: updatedPrerequisites,
    })
  }

  // Add a new resource
  const addResource = () => {
    if (!newResource.title?.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (newResource.type !== "example" && !newResource.url?.trim()) {
      toast({
        title: "Error",
        description: "URL is required for non-example resources",
        variant: "destructive",
      })
      return
    }

    if (newResource.type === "example" && !newResource.content?.trim()) {
      toast({
        title: "Error",
        description: "Content is required for examples",
        variant: "destructive",
      })
      return
    }

    const resourceToAdd: Resource = {
      id: Date.now().toString(),
      type: newResource.type as "pdf" | "image" | "link" | "slide" | "screenshot" | "example",
      title: newResource.title,
      url: newResource.url || "",
      thumbnail: newResource.thumbnail,
      segmentId: activeSegmentId || undefined,
      content: newResource.content,
      dateAdded: new Date().toISOString(),
    }

    // Rest of the function remains the same
    const newResources = [...resources, resourceToAdd]
    setResources(newResources)

    // Also update the resource in any segments that use it
    if (activeSegmentId) {
      const updatedSegments = segments.map((segment) => {
        if (segment.id === activeSegmentId) {
          // Make sure the segment has a resources array
          const segmentResources = segment.resources || []
          return {
            ...segment,
            resources: [...segmentResources, resourceToAdd],
          }
        }
        return segment
      })

      setSegments(updatedSegments)
    }

    setNewResource({
      type: "link",
      title: "",
      url: "",
    })
    setIsResourceDialogOpen(false)

    toast({
      title: "Resource added",
      description: `"${resourceToAdd.title}" has been added to your resource binder.`,
    })
  }

  // Delete a resource
  const deleteResource = (id: string) => {
    const resourceToDelete = resources.find((r) => r.id === id)
    setResources(resources.filter((resource) => resource.id !== id))

    // Also remove the resource from any segments that use it
    const updatedSegments = segments.map((segment) => {
      if (segment.resources && segment.resources.some((r) => r.id === id)) {
        return {
          ...segment,
          resources: segment.resources.filter((r) => r.id !== id),
          // Also remove any timeline points that reference this resource
          timeline: segment.timeline ? segment.timeline.filter((t) => t.resourceId !== id) : [],
        }
      }

      // Also check subsegments
      if (
        segment.subSegments &&
        segment.subSegments.some((sub) => sub.resources && sub.resources.some((r) => r.id === id))
      ) {
        return {
          ...segment,
          subSegments: segment.subSegments.map((sub) => {
            if (sub.resources && sub.resources.some((r) => r.id === id)) {
              return {
                ...sub,
                resources: sub.resources.filter((r) => r.id !== id),
              }
            }
            return sub
          }),
        }
      }

      return segment
    })

    setSegments(updatedSegments)

    toast({
      title: "Resource deleted",
      description: resourceToDelete ? `"${resourceToDelete.title}" has been removed.` : "Resource has been removed.",
    })
  }

  // Take a screenshot
  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    const screenshot = canvas.toDataURL("image/png")

    // Create a new resource with the screenshot
    const screenshotResource: Resource = {
      id: Date.now().toString(),
      type: "screenshot",
      title: `Screenshot ${new Date().toLocaleTimeString()}`,
      url: screenshot,
      thumbnail: screenshot,
      segmentId: activeSegmentId || undefined,
      dateAdded: new Date().toISOString(),
    }

    setResources([...resources, screenshotResource])
    setIsScreenshotMode(false)

    toast({
      title: "Screenshot captured",
      description: "Screenshot has been added to your resources.",
    })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Create a thumbnail for images
        if (file.type.startsWith("image/")) {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            // Create a thumbnail
            const maxSize = 200
            let width = img.width
            let height = img.height

            if (width > height) {
              if (width > maxSize) {
                height = Math.round((height * maxSize) / width)
                width = maxSize
              }
            } else {
              if (height > maxSize) {
                width = Math.round((width * maxSize) / height)
                height = maxSize
              }
            }

            canvas.width = width
            canvas.height = height

            ctx?.drawImage(img, 0, 0, width, height)
            const thumbnail = canvas.toDataURL("image/jpeg")

            setNewResource({
              ...newResource,
              type: "image",
              title: file.name,
              url: event.target.result as string,
              thumbnail,
            })
          }
          img.src = event.target.result as string
        } else {
          // For non-image files
          setNewResource({
            ...newResource,
            type: file.type.includes("pdf") ? "pdf" : "slide",
            title: file.name,
            url: event.target.result as string,
          })
        }
      }
    }

    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  // Filter resources based on search query and active segment
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.content && resource.content.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSegment = !activeSegmentId || resource.segmentId === activeSegmentId

    return matchesSearch && matchesSegment
  })

  // Add a new group for examples in the groupedResources
  const groupedResources = {
    slides: filteredResources.filter((r) => r.type === "slide" || r.type === "pdf"),
    images: filteredResources.filter((r) => r.type === "image" || r.type === "screenshot"),
    links: filteredResources.filter((r) => r.type === "link"),
    examples: filteredResources.filter((r) => r.type === "example"),
  }

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "image":
      case "screenshot":
        return <ImageIcon className="h-4 w-4" />
      case "slide":
        return <FileText className="h-4 w-4" />
      case "example":
        return <Code className="h-4 w-4" />
      case "link":
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  // Toggle segment expansion
  const toggleSegmentExpansion = (segmentId: string) => {
    setSegments(
      segments.map((segment) => {
        if (segment.id === segmentId) {
          return {
            ...segment,
            expanded: !segment.expanded,
          }
        }
        return segment
      }),
    )
  }

  // Add a subsegment to a segment
  const addSubSegment = () => {
    if (!editingSubSegment || !currentSegmentForSubSegment) return

    const parentSegment = segments.find((s) => s.id === currentSegmentForSubSegment)
    if (!parentSegment) return

    const newSubSegment: SubSegment = {
      ...editingSubSegment,
      id: editingSubSegment.id || Date.now().toString(),
      order: parentSegment.subSegments.length,
    }

    const updatedSegments = segments.map((segment) => {
      if (segment.id === currentSegmentForSubSegment) {
        // If we're editing an existing subsegment
        if (editingSubSegment.id && segment.subSegments.some((sub) => sub.id === editingSubSegment.id)) {
          return {
            ...segment,
            subSegments: segment.subSegments.map((sub) => (sub.id === editingSubSegment.id ? newSubSegment : sub)),
          }
        } else {
          // Adding a new subsegment
          return {
            ...segment,
            subSegments: [...segment.subSegments, newSubSegment],
          }
        }
      }
      return segment
    })

    setSegments(updatedSegments)
    setEditingSubSegment(null)
    setCurrentSegmentForSubSegment(null)
    setIsSubSegmentDialogOpen(false)

    toast({
      title: editingSubSegment.id ? "Subsegment updated" : "Subsegment added",
      description: `"${editingSubSegment.title}" has been ${editingSubSegment.id ? "updated" : "added"}.`,
    })
  }

  // Delete a subsegment
  const deleteSubSegment = (segmentId: string, subSegmentId: string) => {
    const updatedSegments = segments.map((segment) => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          subSegments: segment.subSegments.filter((sub) => sub.id !== subSegmentId),
        }
      }
      return segment
    })

    setSegments(updatedSegments)

    toast({
      title: "Subsegment deleted",
      description: "Subsegment has been removed.",
    })
  }

  // Edit a subsegment
  const editSubSegmentDialog = (segmentId: string, subSegment: SubSegment) => {
    setCurrentSegmentForSubSegment(segmentId)
    setEditingSubSegment(subSegment)
    setIsSubSegmentDialogOpen(true)
  }

  // Add resource to subsegment
  const addResourceToSubSegment = (segmentId: string, subSegmentId: string, resource: Resource) => {
    const updatedSegments = segments.map((segment) => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          subSegments: segment.subSegments.map((sub) => {
            if (sub.id === subSegmentId) {
              return {
                ...sub,
                resources: [...(sub.resources || []), { ...resource, subSegmentId }],
              }
            }
            return sub
          }),
        }
      }
      return segment
    })

    setSegments(updatedSegments)
  }

  // Remove resource from subsegment
  const removeResourceFromSubSegment = (segmentId: string, subSegmentId: string, resourceId: string) => {
    const updatedSegments = segments.map((segment) => {
      if (segment.id === segmentId) {
        return {
          ...segment,
          subSegments: segment.subSegments.map((sub) => {
            if (sub.id === subSegmentId) {
              return {
                ...sub,
                resources: (sub.resources || []).filter((r) => r.id !== resourceId),
              }
            }
            return sub
          }),
        }
      }
      return segment
    })

    setSegments(updatedSegments)
  }

  // Generate lessons with AI
  const generateLessonsWithAI = async () => {
    if (!courseIdea.trim()) {
      toast({
        title: "Error",
        description: "Please enter a course idea",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("http://localhost:5000/api/ai/lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: courseIdea }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate lessons")
      }

      const data = await response.json()

      // Convert the API response to our segment format
      const newLessons = data.lessonPlan.map((lesson: any) => {
        // Create a new segment (lesson)
        const newLesson: Segment = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          title: lesson.title,
          content: lesson.content,
          duration: lesson.duration,
          tags: [],
          checklist: [],
          resources: [],
          timeline: [],
          learningObjectives: [],
          studentActivities: [],
          difficultyLevel: "",
          prerequisites: [],
          notes: "",
          subSegments: lesson.sublessons
            ? lesson.sublessons.map((sublesson: any, index: number) => ({
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9) + index,
                title: sublesson.title,
                content: sublesson.content,
                duration: sublesson.duration,
                resources: [],
                order: index,
              }))
            : [],
          expanded: true,
        }

        return newLesson
      })

      setSegments([...segments, ...newLessons])

      toast({
        title: "Lessons generated",
        description: `Generated ${newLessons.length} lessons for "${data.idea}"`,
      })

      setIsAIGenerateDialogOpen(false)
      setCourseIdea("")
    } catch (error) {
      console.error("Error generating lessons:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate lessons. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="storyboard-theme">
      <main className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <header className="py-6">
            <h1 className="text-3xl font-bold">Course Plan Manager</h1>
            <p className="text-muted-foreground">Plan, organize, and export your content with ease</p>
          </header>

          <Tabs defaultValue="storyboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="storyboard">Lessonboard/Script Manager</TabsTrigger>
              <TabsTrigger value="resources">Resource Binder</TabsTrigger>
            </TabsList>

            <TabsContent value="storyboard" className="space-y-4">
              {/* Storyboard Manager */}
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Lessons</h2>
                    <p className="text-muted-foreground">
                      {segments.length} lessons • {totalDuration} minutes total
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="timeline-mode" checked={showTimeline} onCheckedChange={setShowTimeline} />
                      <Label htmlFor="timeline-mode">Timeline View</Label>
                    </div>

                    <Button onClick={() => setIsAIGenerateDialogOpen(true)} variant="outline">
                      <Code className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>

                    <Button onClick={() => exportAsPDF()}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>

                    <Button
                      onClick={() => {
                        resetSegmentForm()
                        setIsSegmentDialogOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>
                </div>

                {/* Segments List */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="segments">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {segments.length === 0 ? (
                          <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                              <p className="text-muted-foreground">
                                No segments yet. Add your first segment to get started.
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                  resetSegmentForm()
                                  setIsSegmentDialogOpen(true)
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lesson
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          segments.map((segment, index) => (
                            <Draggable key={segment.id} draggableId={segment.id} index={index}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="relative"
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-0 h-8 w-8 mr-2"
                                          onClick={() => toggleSegmentExpansion(segment.id)}
                                        >
                                          {segment.expanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <div>
                                          <CardTitle className="flex items-center">
                                            <span className="text-muted-foreground mr-2">{index + 1}.</span>{" "}
                                            {segment.title}
                                          </CardTitle>
                                          <CardDescription className="flex items-center mt-1">
                                            <Clock className="h-3 w-3 mr-1" /> {segment.duration} min
                                            {segment.subSegments.length > 0 && (
                                              <span className="ml-2">
                                                • <Layers className="h-3 w-3 inline mx-1" />
                                                {segment.subSegments.length} sublessons
                                              </span>
                                            )}
                                          </CardDescription>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => editSegment(segment)}>Edit</DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setCurrentSegmentForSubSegment(segment.id)
                                              setEditingSubSegment({
                                                id: "",
                                                title: "",
                                                content: "",
                                                duration: 5,
                                                resources: [],
                                                order: segment.subSegments.length,
                                              })
                                              setIsSubSegmentDialogOpen(true)
                                            }}
                                          >
                                            Add Sublesson
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => deleteSegment(segment.id)}
                                            className="text-red-600"
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    {segment.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {segment.tags.map((tag) => (
                                          <Badge key={tag} className={cn("text-white", getTagColor(tag))}>
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardHeader>

                                  {segment.expanded && (
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div className="prose max-w-none">
                                          <div className="whitespace-pre-wrap border-l-4 border-muted pl-4 py-2">
                                            {segment.content}
                                          </div>
                                        </div>

                                        {segment.learningObjectives && segment.learningObjectives.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <Target className="h-4 w-4 mr-1" /> Learning Objectives
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                              {segment.learningObjectives.map((objective, index) => (
                                                <li key={index} className="text-sm">
                                                  {objective}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {segment.studentActivities && segment.studentActivities.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <Users className="h-4 w-4 mr-1" /> Student Activities
                                            </h4>
                                            <div className="space-y-2">
                                              {segment.studentActivities.map((activity) => (
                                                <div key={activity.id} className="flex items-start gap-2 text-sm">
                                                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                  <div>
                                                    <span className="font-medium">{activity.duration} min:</span>{" "}
                                                    {activity.description}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {segment.difficultyLevel && (
                                          <div className="mt-4 flex items-center gap-2">
                                            <BarChart className="h-4 w-4" />
                                            <span className="text-sm font-medium">Difficulty:</span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                segment.difficultyLevel === "beginner" &&
                                                  "bg-green-50 text-green-700 border-green-200",
                                                segment.difficultyLevel === "intermediate" &&
                                                  "bg-yellow-50 text-yellow-700 border-yellow-200",
                                                segment.difficultyLevel === "advanced" &&
                                                  "bg-red-50 text-red-700 border-red-200",
                                              )}
                                            >
                                              {segment.difficultyLevel.charAt(0).toUpperCase() +
                                                segment.difficultyLevel.slice(1)}
                                            </Badge>
                                          </div>
                                        )}

                                        {segment.prerequisites && segment.prerequisites.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <BookOpen className="h-4 w-4 mr-1" /> Prerequisites
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                              {segment.prerequisites.map((prerequisite, index) => (
                                                <Badge key={index} variant="outline">
                                                  {prerequisite}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {segment.resources && segment.resources.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <Paperclip className="h-4 w-4 mr-1" /> Resources
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {segment.resources.map((resource) => (
                                                <div
                                                  key={resource.id}
                                                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent"
                                                  onClick={() => {
                                                    handlePreviewResource(resource)
                                                  }}
                                                >
                                                  <div className="flex-shrink-0">
                                                    {resource.type === "image" || resource.type === "screenshot" ? (
                                                      <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden">
                                                        <img
                                                          src={resource.url || "/placeholder.svg"}
                                                          alt={resource.title}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      </div>
                                                    ) : (
                                                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                                                        {resource.type === "pdf" || resource.type === "slide" ? (
                                                          <FileText className="h-5 w-5 text-slate-500" />
                                                        ) : resource.type === "example" ? (
                                                          <Code className="h-5 w-5 text-slate-500" />
                                                        ) : (
                                                          <LinkIcon className="h-5 w-5 text-slate-500" />
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{resource.title}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Subsegments */}
                                        {segment.subSegments && segment.subSegments.length > 0 && (
                                          <div className="mt-6 space-y-3">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <Layers className="h-4 w-4 mr-1" /> Sublessons
                                            </h4>
                                            <div className="space-y-3 pl-4">
                                              {segment.subSegments.map((subSegment, subIndex) => (
                                                <Card key={subSegment.id} className="border-l-4 border-l-primary">
                                                  <CardHeader className="py-3">
                                                    <div className="flex justify-between items-start">
                                                      <div>
                                                        <CardTitle className="text-base flex items-center">
                                                          <span className="text-muted-foreground mr-2">
                                                            {index + 1}.{subIndex + 1}
                                                          </span>
                                                          {subSegment.title}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center mt-1">
                                                          <Clock className="h-3 w-3 mr-1" /> {subSegment.duration} min
                                                        </CardDescription>
                                                      </div>
                                                      <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                          <DropdownMenuItem
                                                            onClick={() => editSubSegmentDialog(segment.id, subSegment)}
                                                          >
                                                            Edit
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem
                                                            onClick={() => deleteSubSegment(segment.id, subSegment.id)}
                                                            className="text-red-600"
                                                          >
                                                            Delete
                                                          </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                      </DropdownMenu>
                                                    </div>
                                                  </CardHeader>
                                                  <CardContent className="py-2">
                                                    <div className="whitespace-pre-wrap text-sm">
                                                      {subSegment.content}
                                                    </div>

                                                    {subSegment.resources && subSegment.resources.length > 0 && (
                                                      <div className="mt-3 space-y-2">
                                                        <h5 className="text-xs font-medium flex items-center">
                                                          <Paperclip className="h-3 w-3 mr-1" /> Materials
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                          {subSegment.resources.map((resource) => (
                                                            <div
                                                              key={resource.id}
                                                              className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent"
                                                              onClick={() => {
                                                                handlePreviewResource(resource)
                                                              }}
                                                            >
                                                              <div className="flex-shrink-0">
                                                                {resource.type === "image" ||
                                                                resource.type === "screenshot" ? (
                                                                  <div className="w-8 h-8 bg-slate-100 rounded-md overflow-hidden">
                                                                    <img
                                                                      src={resource.url || "/placeholder.svg"}
                                                                      alt={resource.title}
                                                                      className="w-full h-full object-cover"
                                                                    />
                                                                  </div>
                                                                ) : (
                                                                  <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                                                                    {getResourceIcon(resource.type)}
                                                                  </div>
                                                                )}
                                                              </div>
                                                              <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-medium truncate">
                                                                  {resource.title}
                                                                </div>
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </CardContent>
                                                </Card>
                                              ))}
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="ml-4"
                                              onClick={() => {
                                                setCurrentSegmentForSubSegment(segment.id)
                                                setEditingSubSegment({
                                                  id: "",
                                                  title: "",
                                                  content: "",
                                                  duration: 5,
                                                  resources: [],
                                                  order: segment.subSegments.length,
                                                })
                                                setIsSubSegmentDialogOpen(true)
                                              }}
                                            >
                                              <Plus className="h-3 w-3 mr-1" /> Add Sublesson
                                            </Button>
                                          </div>
                                        )}

                                        {segment.timeline && segment.timeline.length > 0 && showTimeline && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <Clock className="h-4 w-4 mr-1" /> Resource Timeline
                                            </h4>
                                            <div className="relative h-12 bg-muted rounded-md overflow-hidden">
                                              {segment.timeline.map((point) => {
                                                const resource = resources.find((r) => r.id === point.resourceId)
                                                if (!resource) return null

                                                // Calculate position as percentage of segment duration
                                                const position = (point.time / segment.duration) * 100

                                                return (
                                                  <div
                                                    key={point.id}
                                                    className="absolute top-0 h-full w-1 bg-primary cursor-pointer hover:w-2 transition-all"
                                                    style={{ left: `${position}%` }}
                                                    title={`${resource.title} at ${point.time} min: ${point.note}`}
                                                  />
                                                )
                                              })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {segment.timeline.map((point, index) => {
                                                const resource = resources.find((r) => r.id === point.resourceId)
                                                return resource ? (
                                                  <div key={point.id} className="flex items-start gap-1 mb-1">
                                                    <span className="font-medium">{point.time} min:</span>
                                                    <span>{resource.title}</span>
                                                    {point.note && (
                                                      <span className="text-muted-foreground">- {point.note}</span>
                                                    )}
                                                  </div>
                                                ) : null
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {segment.notes && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <HelpCircle className="h-4 w-4 mr-1" /> Notes
                                            </h4>
                                            <div className="text-sm text-muted-foreground whitespace-pre-wrap border-l-4 border-muted pl-4 py-2">
                                              {segment.notes}
                                            </div>
                                          </div>
                                        )}

                                        {segment.checklist.length > 0 && (
                                          <div className="mt-4 space-y-2">
                                            <h4 className="text-sm font-medium flex items-center">
                                              <CheckSquare className="h-4 w-4 mr-1" /> Checklist
                                            </h4>
                                            <ul className="space-y-1">
                                              {segment.checklist.map((item) => (
                                                <li key={item.id} className="flex items-start">
                                                  <div
                                                    className={cn(
                                                      "w-4 h-4 border rounded-sm mr-2 mt-1",
                                                      item.checked ? "bg-primary border-primary" : "border-input",
                                                    )}
                                                  >
                                                    {item.checked && (
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="h-3 w-3 text-primary-foreground"
                                                      >
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                      </svg>
                                                    )}
                                                  </div>
                                                  <span
                                                    className={cn(item.checked && "line-through text-muted-foreground")}
                                                  >
                                                    {item.text}
                                                  </span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {/* Gantt Chart Timeline View */}
                {showTimeline && segments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline View</CardTitle>
                      <CardDescription>Gantt chart of segments and subsegments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Time scale */}
                        <div className="flex border-b pb-1 mb-2">
                          <div className="w-[200px] flex-shrink-0"></div>
                          <div className="flex-1 flex">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="flex-1 text-center text-xs text-muted-foreground">
                                {i * 10}%
                              </div>
                            ))}
                          </div>
                        </div>

                        {segments.map((segment, index) => {
                          // Calculate total duration for this segment including subsegments
                          const segmentTotalDuration =
                            segment.duration + segment.subSegments.reduce((total, sub) => total + sub.duration, 0)

                          // Calculate width percentage based on duration
                          const widthPercentage = (segmentTotalDuration / totalDuration) * 100

                          return (
                            <div key={segment.id} className="mb-6">
                              <div className="flex items-center mb-2">
                                <div className="w-[200px] flex-shrink-0 font-medium truncate pr-2">
                                  {index + 1}. {segment.title}
                                </div>
                                <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
                                  <div
                                    className={cn(
                                      "h-full rounded-md",
                                      segment.tags.length > 0 ? getTagColor(segment.tags[0]) : "bg-primary",
                                    )}
                                    style={{ width: `${widthPercentage}%` }}
                                  >
                                    <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                                      {segmentTotalDuration} min
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Subsegments */}
                              {segment.subSegments.length > 0 && (
                                <div className="pl-6 space-y-2">
                                  {segment.subSegments.map((subSegment, subIndex) => {
                                    // Calculate position and width for subsegment
                                    const subSegmentWidth = (subSegment.duration / totalDuration) * 100

                                    return (
                                      <div key={subSegment.id} className="flex items-center">
                                        <div className="w-[194px] flex-shrink-0 text-sm truncate pr-2 flex items-center">
                                          <ArrowRight className="h-3 w-3 mr-1 text-muted-foreground" />
                                          {index + 1}.{subIndex + 1} {subSegment.title}
                                        </div>
                                        <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                                          <div
                                            className="h-full rounded-md bg-primary/60"
                                            style={{ width: `${subSegmentWidth}%` }}
                                          >
                                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                                              {subSegment.duration} min
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              {/* Resource Binder */}
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Resource Binder</h2>
                    <p className="text-muted-foreground">Organize and manage resources for your storyboard</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search resources..."
                        className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Button variant="outline" onClick={() => setIsScreenshotMode(true)}>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>

                    <Button onClick={() => setIsResourceDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Segments</CardTitle>
                      <CardDescription>Filter resources by segment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-accent",
                            !activeSegmentId && "bg-accent",
                          )}
                          onClick={() => setActiveSegmentId(null)}
                        >
                          <span>All Resources</span>
                        </div>

                        {segments.map((segment) => (
                          <div
                            key={segment.id}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-accent",
                              activeSegmentId === segment.id && "bg-accent",
                            )}
                            onClick={() => setActiveSegmentId(segment.id)}
                          >
                            <span>{segment.title}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Tabs defaultValue="all" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="all">All Resources</TabsTrigger>
                        <TabsTrigger value="slides">Slides & PDFs</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                        <TabsTrigger value="links">Links</TabsTrigger>
                        <TabsTrigger value="examples">Examples</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="space-y-6">
                        {filteredResources.length === 0 ? (
                          <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                              <p className="text-muted-foreground">
                                No resources found. Add your first resource to get started.
                              </p>
                              <Button variant="outline" className="mt-4" onClick={() => setIsResourceDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Resource
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <>
                            {groupedResources.slides.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">Slides & PDFs</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {groupedResources.slides.map((resource) => (
                                    <Card
                                      key={resource.id}
                                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                      onClick={() => previewResourceItem(resource)}
                                    >
                                      <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center">
                                        <FileText className="h-12 w-12 text-slate-400" />
                                      </div>
                                      <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                          <div className="truncate text-sm font-medium">{resource.title}</div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  navigator.clipboard.writeText(resource.url)
                                                  toast({
                                                    title: "URL copied",
                                                    description: "Resource URL has been copied to clipboard.",
                                                  })
                                                }}
                                              >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy URL
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  deleteResource(resource.id)
                                                }}
                                                className="text-red-600"
                                              >
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {groupedResources.images.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">Images</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {groupedResources.images.map((resource) => (
                                    <Card
                                      key={resource.id}
                                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                      onClick={() => previewResourceItem(resource)}
                                    >
                                      <div className="aspect-square bg-slate-100">
                                        <img
                                          src={resource.url || "/placeholder.svg"}
                                          alt={resource.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                          <div className="truncate text-sm font-medium">{resource.title}</div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  navigator.clipboard.writeText(resource.url)
                                                  toast({
                                                    title: "URL copied",
                                                    description: "Resource URL has been copied to clipboard.",
                                                  })
                                                }}
                                              >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy URL
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  deleteResource(resource.id)
                                                }}
                                                className="text-red-600"
                                              >
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            {groupedResources.links.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">Links</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {groupedResources.links.map((resource) => (
                                    <Card key={resource.id} className="overflow-hidden">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="mt-1 bg-slate-100 p-2 rounded-md">
                                            <LinkIcon className="h-5 w-5 text-slate-500" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{resource.title}</h4>
                                            <p className="text-sm text-muted-foreground truncate">{resource.url}</p>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => window.open(resource.url, "_blank")}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Open Link
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  navigator.clipboard.writeText(resource.url)
                                                  toast({
                                                    title: "URL copied",
                                                    description: "Resource URL has been copied to clipboard.",
                                                  })
                                                }}
                                              >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy URL
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                onClick={() => deleteResource(resource.id)}
                                                className="text-red-600"
                                              >
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                            {groupedResources.examples.length > 0 && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">Examples</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {groupedResources.examples.map((resource) => (
                                    <Card key={resource.id} className="overflow-hidden">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="mt-1 bg-slate-100 p-2 rounded-md">
                                            <Code className="h-5 w-5 text-slate-500" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{resource.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                              {resource.content?.substring(0, 100)}...
                                            </p>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => previewResourceItem(resource)}>
                                                <Search className="mr-2 h-4 w-4" />
                                                Preview Example
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  navigator.clipboard.writeText(resource.content || "")
                                                  toast({
                                                    title: "Content copied",
                                                    description: "Example content has been copied to clipboard.",
                                                  })
                                                }}
                                              >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Example
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                onClick={() => deleteResource(resource.id)}
                                                className="text-red-600"
                                              >
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </TabsContent>

                      <TabsContent value="slides">
                        {groupedResources.slides.length === 0 ? (
                          <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                              <p className="text-muted-foreground">No slides or PDFs found.</p>
                              <Button variant="outline" className="mt-4" onClick={() => setIsResourceDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Resource
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {groupedResources.slides.map((resource) => (
                              <Card
                                key={resource.id}
                                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => previewResourceItem(resource)}
                              >
                                <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center">
                                  <FileText className="h-12 w-12 text-slate-400" />
                                </div>
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="truncate text-sm font-medium">{resource.title}</div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            navigator.clipboard.writeText(resource.url)
                                            toast({
                                              title: "URL copied",
                                              description: "Resource URL has been copied to clipboard.",
                                            })
                                          }}
                                        >
                                          <Copy className="mr-2 h-4 w-4" />
                                          Copy URL
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            deleteResource(resource.id)
                                          }}
                                          className="text-red-600"
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="images">
                        {/* Images tab content */}
                        {/* Similar structure to slides tab */}
                      </TabsContent>

                      <TabsContent value="links">
                        {/* Links tab content */}
                        {/* Similar structure to slides tab */}
                      </TabsContent>

                      <TabsContent value="examples">
                        {/* Examples tab content */}
                        {/* Similar structure to slides tab */}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add/Edit Segment Dialog */}
        <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
          <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSegment ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
              <DialogDescription>
                {editingSegment ? "Update the details of your lesson." : "Create a new lesson for your course plan."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingSegment ? editingSegment.title : newSegmentTitle}
                  onChange={(e) =>
                    editingSegment
                      ? setEditingSegment({ ...editingSegment, title: e.target.value })
                      : setNewSegmentTitle(e.target.value)
                  }
                  placeholder="Enter segment title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={editingSegment ? editingSegment.content : newSegmentContent}
                  onChange={(e) =>
                    editingSegment
                      ? setEditingSegment({ ...editingSegment, content: e.target.value })
                      : setNewSegmentContent(e.target.value)
                  }
                  placeholder="Enter segment content, script, or notes"
                  className="min-h-[200px]"
                  rows={8}
                />
              </div>

              {editingSegment && (
                <>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Learning Objectives</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addLearningObjective}
                        disabled={!editingObjective.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Objective
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={editingObjective}
                        onChange={(e) => setEditingObjective(e.target.value)}
                        placeholder="Enter a learning objective"
                        className="flex-1"
                      />
                    </div>
                    {editingSegment.learningObjectives.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {editingSegment.learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="text-sm">{objective}</div>
                            <Button variant="ghost" size="icon" onClick={() => removeLearningObjective(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Student Activities</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addStudentActivity}
                        disabled={!editingActivity.description.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Activity
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        value={editingActivity.description}
                        onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                        placeholder="Describe the student activity"
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="activity-duration" className="whitespace-nowrap">
                          Duration (min):
                        </Label>
                        <Input
                          id="activity-duration"
                          type="number"
                          min="1"
                          value={editingActivity.duration}
                          onChange={(e) =>
                            setEditingActivity({
                              ...editingActivity,
                              duration: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                    {editingSegment.studentActivities.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {editingSegment.studentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="text-sm">
                              <span className="font-medium">{activity.duration} min:</span> {activity.description}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeStudentActivity(activity.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <select
                      id="difficulty"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editingSegment.difficultyLevel}
                      onChange={(e) =>
                        setEditingSegment({
                          ...editingSegment,
                          difficultyLevel: e.target.value as "beginner" | "intermediate" | "advanced" | "",
                        })
                      }
                    >
                      <option value="">Select difficulty level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Prerequisites</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addPrerequisite}
                        disabled={!editingPrerequisite.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Prerequisite
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={editingPrerequisite}
                        onChange={(e) => setEditingPrerequisite(e.target.value)}
                        placeholder="Enter a prerequisite"
                        className="flex-1"
                      />
                    </div>
                    {editingSegment.prerequisites.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingSegment.prerequisites.map((prerequisite, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {prerequisite}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => removePrerequisite(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={editingSegment.notes || ""}
                      onChange={(e) => setEditingSegment({ ...editingSegment, notes: e.target.value })}
                      placeholder="Enter additional notes, tips, or reminders"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Rest of the dialog content remains the same */}
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={editingSegment ? editingSegment.duration : newSegmentDuration}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 1
                    editingSegment
                      ? setEditingSegment({ ...editingSegment, duration: value })
                      : setNewSegmentDuration(value)
                  }}
                />
              </div>

              {/* Rest of the existing fields */}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSegmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingSegment ? updateSegment : addSegment}>
                {editingSegment ? "Update Lesson" : "Add Lesson"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Subsegment Dialog */}
        <Dialog open={isSubSegmentDialogOpen} onOpenChange={setIsSubSegmentDialogOpen}>
          <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSubSegment?.id ? "Edit Sublesson" : "Add New Sublesson"}</DialogTitle>
              <DialogDescription>
                {editingSubSegment?.id
                  ? "Update the details of your sublesson."
                  : "Create a new sublesson for this lesson."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subsegment-title">Title</Label>
                <Input
                  id="subsegment-title"
                  value={editingSubSegment?.title || ""}
                  onChange={(e) => setEditingSubSegment((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  placeholder="Enter subsegment title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subsegment-content">Content</Label>
                <Textarea
                  id="subsegment-content"
                  value={editingSubSegment?.content || ""}
                  onChange={(e) => setEditingSubSegment((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                  placeholder="Enter subsegment content, script, or notes"
                  className="min-h-[150px]"
                  rows={6}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subsegment-duration">Duration (minutes)</Label>
                <Input
                  id="subsegment-duration"
                  type="number"
                  min="1"
                  value={editingSubSegment?.duration || 5}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 1
                    setEditingSubSegment((prev) => (prev ? { ...prev, duration: value } : null))
                  }}
                />
              </div>

              {editingSubSegment?.id && (
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Materials</Label>
                    <Button variant="outline" size="sm" onClick={() => setIsResourceDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Material
                    </Button>
                  </div>

                  {editingSubSegment.resources && editingSubSegment.resources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {editingSubSegment.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                              {getResourceIcon(resource.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{resource.title}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (currentSegmentForSubSegment) {
                                removeResourceFromSubSegment(
                                  currentSegmentForSubSegment,
                                  editingSubSegment.id,
                                  resource.id,
                                )
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md">
                      No materials attached to this subsegment yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubSegmentDialogOpen(false)
                  setEditingSubSegment(null)
                  setCurrentSegmentForSubSegment(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={addSubSegment}>{editingSubSegment?.id ? "Update Sublesson" : "Add Sublesson"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add New Tag Dialog */}
        <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
          <DialogContent className="max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
              <DialogDescription>Create a new tag to categorize your segments.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>

              <div className="grid gap-2">
                <Label>Tag Color</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "bg-red-500",
                    "bg-orange-500",
                    "bg-amber-500",
                    "bg-yellow-500",
                    "bg-lime-500",
                    "bg-green-500",
                    "bg-emerald-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-sky-500",
                    "bg-blue-500",
                    "bg-indigo-500",
                    "bg-violet-500",
                    "bg-purple-500",
                    "bg-fuchsia-500",
                    "bg-pink-500",
                    "bg-rose-500",
                    "bg-slate-500",
                  ].map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer",
                        color,
                        newTagColor === color ? "ring-2 ring-offset-2 ring-ring" : "",
                      )}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addNewTag}>Add Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resource Preview Dialog */}
        <Dialog open={isResourcePreviewOpen} onOpenChange={setIsResourcePreviewOpen}>
          <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewResource?.title}</DialogTitle>
              <DialogDescription>Resource preview</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {previewResource && (
                <div className="space-y-4">
                  {previewResource.type === "image" || previewResource.type === "screenshot" ? (
                    <div className="flex justify-center">
                      <img
                        src={previewResource.url || "/placeholder.svg"}
                        alt={previewResource.title}
                        className="max-h-[500px] max-w-full object-contain"
                      />
                    </div>
                  ) : previewResource.type === "pdf" ? (
                    <div className="flex justify-center">
                      <iframe
                        src={previewResource.url}
                        title={previewResource.title}
                        className="w-full h-[500px] border"
                      />
                    </div>
                  ) : previewResource.type === "example" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-md overflow-auto">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{previewResource.content}</pre>
                      </div>
                      {previewResource.url && (
                        <div className="flex justify-end">
                          <Button onClick={() => window.open(previewResource.url, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Related Link
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : previewResource.type === "link" ? (
                    <div className="space-y-2">
                      <p className="break-all">{previewResource.url}</p>
                      <Button onClick={() => window.open(previewResource.url, "_blank")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Link
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <iframe
                        src={previewResource.url}
                        title={previewResource.title}
                        className="w-full h-[500px] border"
                      />
                    </div>
                  )}

                  {previewResource.content && previewResource.type !== "example" && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-1">Notes:</h4>
                      <p className="text-sm">{previewResource.content}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResourcePreviewOpen(false)}>
                Close
              </Button>
              {editingSegment && (
                <Button
                  onClick={() => {
                    if (previewResource) {
                      addResourceToSegment(editingSegment.id, previewResource)
                      setIsResourcePreviewOpen(false)
                    }
                  }}
                >
                  Add to Current Segment
                </Button>
              )}
              {editingSubSegment && currentSegmentForSubSegment && (
                <Button
                  onClick={() => {
                    if (previewResource && currentSegmentForSubSegment && editingSubSegment.id) {
                      addResourceToSubSegment(currentSegmentForSubSegment, editingSubSegment.id, previewResource)
                      setIsResourcePreviewOpen(false)
                    }
                  }}
                >
                  Add to Subsegment
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Resource Dialog */}
        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
          <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>Add a new resource to your binder.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "link" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "link" })}
                  >
                    <div className="flex justify-center mb-2">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Link</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "pdf" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "pdf" })}
                  >
                    <div className="flex justify-center mb-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">PDF</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "image" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "image" })}
                  >
                    <div className="flex justify-center mb-2">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Image</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "slide" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "slide" })}
                  >
                    <div className="flex justify-center mb-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Slide</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "example" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "example" })}
                  >
                    <div className="flex justify-center mb-2">
                      <Code className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Example</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 border rounded-md text-center cursor-pointer hover:bg-slate-50",
                      newResource.type === "screenshot" ? "border-primary bg-primary/10" : "",
                    )}
                    onClick={() => setNewResource({ ...newResource, type: "screenshot" })}
                  >
                    <div className="flex justify-center mb-2">
                      <Camera className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Screenshot</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input
                  id="resource-title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Enter resource title"
                />
              </div>

              {newResource.type === "example" ? (
                <div className="grid gap-2">
                  <Label htmlFor="resource-content">Example Content</Label>
                  <Textarea
                    id="resource-content"
                    value={newResource.content || ""}
                    onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                    placeholder="Enter your example content, code snippet, or exercise"
                    className="min-h-[200px]"
                    rows={8}
                  />
                  <Input
                    id="resource-url"
                    value={newResource.url || ""}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="Optional: Enter a URL related to this example"
                  />
                </div>
              ) : newResource.type === "image" || newResource.type === "pdf" || newResource.type === "slide" ? (
                <div className="grid gap-2">
                  <Label htmlFor="resource-file">File</Label>
                  <Input
                    id="resource-file"
                    type="file"
                    accept={
                      newResource.type === "image"
                        ? "image/*"
                        : newResource.type === "pdf"
                          ? "application/pdf"
                          : "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    }
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="resource-url">URL</Label>
                  <Input
                    id="resource-url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="Enter resource URL"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="resource-content">Notes (optional)</Label>
                <Input
                  id="resource-content"
                  value={newResource.content || ""}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  placeholder="Add notes about this resource"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addResource}>Add Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Screenshot Mode Dialog */}
        <Dialog open={isScreenshotMode} onOpenChange={setIsScreenshotMode}>
          <DialogContent className="max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Take Screenshot</DialogTitle>
              <DialogDescription>Capture your screen to add to the current segment.</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex justify-center">
                  <Button onClick={takeScreenshot}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Screenshot
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScreenshotMode(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Timeline Point Dialog */}
        <Dialog open={isTimelinePointDialogOpen} onOpenChange={setIsTimelinePointDialogOpen}>
          <DialogContent className="max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Timeline</DialogTitle>
              <DialogDescription>Add a resource to the segment timeline at a specific time.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="timeline-time">Time (minutes)</Label>
                <Input
                  id="timeline-time"
                  type="number"
                  min="0"
                  max={editingSegment?.duration || 60}
                  step="0.5"
                  value={newTimelinePoint.time}
                  onChange={(e) =>
                    setNewTimelinePoint({
                      ...newTimelinePoint,
                      time: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeline-note">Note (optional)</Label>
                <Input
                  id="timeline-note"
                  value={newTimelinePoint.note}
                  onChange={(e) =>
                    setNewTimelinePoint({
                      ...newTimelinePoint,
                      note: e.target.value,
                    })
                  }
                  placeholder="Add a note about this resource usage"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTimelinePointDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTimelinePoint}>Add to Timeline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* AI Generate Dialog */}
        <Dialog open={isAIGenerateDialogOpen} onOpenChange={setIsAIGenerateDialogOpen}>
          <DialogContent className="max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Lessons with AI</DialogTitle>
              <DialogDescription>Enter a course topic or idea to generate a complete lesson plan.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="course-idea">Course Idea</Label>
                <Textarea
                  id="course-idea"
                  value={courseIdea}
                  onChange={(e) => setCourseIdea(e.target.value)}
                  placeholder="Enter a course topic or idea (e.g., 'React JS', 'Machine Learning Basics')"
                  className="min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAIGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateLessonsWithAI} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>Generate Lessons</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Toaster />
      </main>
    </ThemeProvider>
  )
}
