"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Download,
  Trash2,
  Undo,
  Redo,
  ImageIcon,
  Upload,
  File,
  FileText,
  FileCode,
  FileIcon as FilePdf,
  FileArchive,
  User,
  ExternalLink,
  Clock,
  Loader2,
  Maximize,
  Minimize,
  X,
} from "lucide-react"
import { io } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WhiteboardProps {
  roomId: string
  userId: string
  userRole?: "host" | "participant"
}

type DrawingMode = "pencil" | "rectangle" | "circle" | "text" | "eraser"
type DrawingAction = {
  type: "draw" | "clear" | "image" | "remove-image" | "update-image"
  mode?: DrawingMode
  points?: { x: number; y: number }[]
  color?: string
  size?: number
  text?: string
  position?: { x: number; y: number }
  dimensions?: { width: number; height: number }
  userId?: string
  imageId?: string
  imageData?: string
  imagePosition?: { x: number; y: number }
  imageSize?: { width: number; height: number }
  timestamp?: Date
}

interface SharedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: string
  uploaderId: string
  timestamp: Date
  dataUrl?: string // For direct file data
}

interface UploadedImage {
  id: string
  dataUrl: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isDragging: boolean
  isResizing: boolean
}

const colors = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
]

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId, userId, userRole = "host" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("pencil")
  const [color, setColor] = useState("#000000")
  const [size, setSize] = useState(5)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [redoActions, setRedoActions] = useState<DrawingAction[]>([])
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<any>(null)
  const [currentTab, setCurrentTab] = useState<"draw" | "notes" | "files">("draw")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const whiteboardContainerRef = useRef<HTMLDivElement>(null)
  const drawAreaRef = useRef<HTMLDivElement>(null)

  // Image handling state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isDraggingImage, setIsDraggingImage] = useState<string | null>(null)
  const [isResizingImage, setIsResizingImage] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Notes state
  const [notesContent, setNotesContent] = useState("")
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Files state
  const [files, setFiles] = useState<SharedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drawing state
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const currentPathRef = useRef<{ x: number; y: number }[]>([])

  // Initialize canvas, socket connection, notes, and files
  useEffect(() => {
    // Initialize real socket connection
    const socket = io("http://localhost:5000")
    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)

      // Join all necessary rooms
      socket.emit("join-whiteboard", { roomId, userId })
      console.log(`Joining whiteboard room: whiteboard-${roomId}`)
      socket.emit("join-notes", { roomId })
      socket.emit("join-files", { roomId })

      // Request initial data
      socket.emit("get-whiteboard-state", { roomId })
      socket.emit("get-notes", { roomId })
      socket.emit("get-files", { roomId })
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    socket.on("whiteboard-state", (state: { actions: DrawingAction[] }) => {
      setActions(state.actions)

      // Clear existing images
      setUploadedImages([])

      // Process all actions to rebuild state
      if (contextRef.current && canvasRef.current) {
        // Clear canvas
        contextRef.current.fillStyle = "#ffffff"
        contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        // Apply all actions
        state.actions.forEach((action) => {
          // Handle image actions separately
          if (action.type === "image" && action.imageData && action.imagePosition) {
            const newImage: UploadedImage = {
              id: action.imageId || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              dataUrl: action.imageData,
              position: action.imagePosition,
              size: action.imageSize || { width: 300, height: 200 },
              isDragging: false,
              isResizing: false,
            }

            setUploadedImages((prev) => [...prev, newImage])
          } else if (action.type === "remove-image" && action.imageId) {
            // Handle image removal
            setUploadedImages((prev) => prev.filter((img) => img.id !== action.imageId))
          } else if (action.type === "update-image" && action.imageId) {
            // Handle image update (position/size)
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.id === action.imageId
                  ? {
                      ...img,
                      position: action.imagePosition || img.position,
                      size: action.imageSize || img.size,
                    }
                  : img,
              ),
            )
          } else if (action.type !== "clear") {
            // Handle drawing actions
            drawFromAction(action)
          }
        })
      }
    })

    socket.on("whiteboard-action", (action: DrawingAction) => {
      console.log("Received whiteboard action from another user:", action)
      // Only apply actions from other users
      if (action.userId !== userId) {
        setActions((prev) => [...prev, action])

        // Handle image actions
        if (action.type === "image" && action.imageData && action.imagePosition) {
          const newImage: UploadedImage = {
            id: action.imageId || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            dataUrl: action.imageData,
            position: action.imagePosition,
            size: action.imageSize || { width: 300, height: 200 },
            isDragging: false,
            isResizing: false,
          }

          setUploadedImages((prev) => [...prev, newImage])
        } else if (action.type === "remove-image" && action.imageId) {
          // Handle image removal
          setUploadedImages((prev) => prev.filter((img) => img.id !== action.imageId))
        } else if (action.type === "update-image" && action.imageId) {
          // Handle image update (position/size)
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === action.imageId
                ? {
                    ...img,
                    position: action.imagePosition || img.position,
                    size: action.imageSize || img.size,
                  }
                : img,
            ),
          )
        } else if (action.type === "clear") {
          // Handle clear action
          if (contextRef.current && canvasRef.current) {
            contextRef.current.fillStyle = "#ffffff"
            contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            setUploadedImages([])
          }
        } else {
          // Handle drawing actions
          drawFromAction(action)
        }
      }
    })

    socket.on("notes-state", (content: string) => {
      setNotesContent(content)
      setIsLoadingNotes(false)
    })

    socket.on("note-updated", (content: string) => {
      setNotesContent(content)
    })

    socket.on("files-update", (updatedFiles: SharedFile[]) => {
      setFiles(updatedFiles)
    })

    // Initialize canvas
    initializeCanvas()

    // Handle window resize
    const handleResize = () => {
      initializeCanvas()
    }

    window.addEventListener("resize", handleResize)
    document.addEventListener("fullscreenchange", handleResize)

    return () => {
      socket.disconnect()
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("fullscreenchange", handleResize)
    }
  }, [roomId, userId])

  // Update the initializeCanvas function to properly set canvas dimensions
  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the container dimensions
    const container = drawAreaRef.current
    if (!container) return

    // Set the container to take up the full height
    container.style.height = "calc(100vh - 150px)" // Even more height
    container.style.minHeight = "1000px" // Larger minimum height

    const rect = container.getBoundingClientRect()
    console.log("Canvas container dimensions:", rect.width, rect.height)

    // Set canvas size to match container
    canvas.width = rect.width
    canvas.height = rect.height

    console.log("Canvas dimensions set to:", canvas.width, canvas.height)

    // Get context
    const context = canvas.getContext("2d")
    if (context) {
      context.lineCap = "round"
      context.strokeStyle = color
      context.lineWidth = size
      contextRef.current = context

      // Clear canvas
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Redraw all actions
      actions.forEach((action) => {
        if (action.type !== "image" && action.type !== "remove-image" && action.type !== "update-image") {
          drawFromAction(action)
        }
      })
    }
  }

  // Update context when color or size changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color
      contextRef.current.lineWidth = size
    }
  }, [color, size])

  // WHITEBOARD FUNCTIONS
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || textPosition || userRole !== "host") return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    startPointRef.current = { x, y }
    currentPathRef.current = [{ x, y }]

    if (drawingMode === "text") {
      setTextPosition({ x, y })
      return
    }

    contextRef.current?.beginPath()
    contextRef.current?.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current || !startPointRef.current || userRole !== "host") return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (drawingMode === "pencil" || drawingMode === "eraser") {
      contextRef.current.lineTo(x, y)
      contextRef.current.stroke()

      // Add point to current path
      currentPathRef.current.push({ x, y })
    }
  }

  const finishDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current || !startPointRef.current || userRole !== "host") return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const startX = startPointRef.current.x
    const startY = startPointRef.current.y

    if (drawingMode === "rectangle") {
      contextRef.current.strokeRect(startX, startY, x - startX, y - startY)
      currentPathRef.current = [
        { x: startX, y: startY },
        { x, y },
      ]
    } else if (drawingMode === "circle") {
      const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
      contextRef.current.beginPath()
      contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI)
      contextRef.current.stroke()
      currentPathRef.current = [
        { x: startX, y: startY },
        { x, y },
      ]
    }

    contextRef.current.closePath()
    setIsDrawing(false)

    // Add action to history
    const newAction: DrawingAction = {
      type: "draw",
      mode: drawingMode,
      color,
      size,
      points: [...currentPathRef.current],
      userId,
    }

    setActions((prev) => [...prev, newAction])
    setRedoActions([])

    // Emit action to other users
    if (socketRef.current) {
      console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
      socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
    }

    // Reset start point and current path
    startPointRef.current = null
    currentPathRef.current = []
  }

  const addText = () => {
    if (!textPosition || !contextRef.current || !textInput.trim() || userRole !== "host") return

    contextRef.current.font = `${size * 3}px Arial`
    contextRef.current.fillStyle = color
    contextRef.current.fillText(textInput, textPosition.x, textPosition.y)

    // Add action to history
    const newAction: DrawingAction = {
      type: "draw",
      mode: "text",
      text: textInput,
      position: textPosition,
      color,
      size: size * 3,
      userId,
    }

    setActions((prev) => [...prev, newAction])
    setRedoActions([])

    // Emit action to other users
    if (socketRef.current) {
      console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
      socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
    }

    // Reset text input
    setTextInput("")
    setTextPosition(null)
  }

  const clearCanvas = (emitToServer = true) => {
    if (!contextRef.current || !canvasRef.current || userRole !== "host") return

    contextRef.current.fillStyle = "#ffffff"
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Clear uploaded images
    setUploadedImages([])

    if (emitToServer) {
      // Add clear action to history
      const newAction: DrawingAction = {
        type: "clear",
        userId,
      }

      setActions((prev) => [...prev, newAction])
      setRedoActions([])

      // Emit action to other users
      if (socketRef.current) {
        console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
        socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
      }
    }
  }

  const undo = () => {
    if (actions.length === 0 || userRole !== "host") return

    const actionsToKeep = [...actions]
    const actionToUndo = actionsToKeep.pop()

    if (actionToUndo) {
      setRedoActions((prev) => [...prev, actionToUndo])
      setActions(actionsToKeep)

      // Redraw canvas from remaining actions
      if (!contextRef.current || !canvasRef.current) return

      contextRef.current.fillStyle = "#ffffff"
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      // Clear uploaded images and re-add them based on remaining actions
      setUploadedImages([])

      actionsToKeep.forEach((action) => {
        if (action.type === "image" && action.imageData && action.imagePosition) {
          const newImage: UploadedImage = {
            id: action.imageId || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            dataUrl: action.imageData,
            position: action.imagePosition,
            size: action.imageSize || { width: 300, height: 200 },
            isDragging: false,
            isResizing: false,
          }
          setUploadedImages((prev) => [...prev, newImage])
        } else if (action.type === "update-image" && action.imageId) {
          // Handle image update (position/size)
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === action.imageId
                ? {
                    ...img,
                    position: action.imagePosition || img.position,
                    size: action.imageSize || img.size,
                  }
                : img,
            ),
          )
        } else if (action.type === "remove-image" && action.imageId) {
          // Handle image removal
          setUploadedImages((prev) => prev.filter((img) => img.id !== action.imageId))
        } else if (action.type !== "clear") {
          drawFromAction(action)
        }
      })

      // Emit updated state to other users
      socketRef.current?.emit("whiteboard-state-update", { roomId, actions: actionsToKeep })
    }
  }

  const redo = () => {
    if (redoActions.length === 0 || userRole !== "host") return

    const redoActionsToKeep = [...redoActions]
    const actionToRedo = redoActionsToKeep.pop()

    if (actionToRedo) {
      setActions((prev) => [...prev, actionToRedo])
      setRedoActions(redoActionsToKeep)

      // Apply the action to the canvas
      if (actionToRedo.type === "image" && actionToRedo.imageData && actionToRedo.imagePosition) {
        const newImage: UploadedImage = {
          id: actionToRedo.imageId || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          dataUrl: actionToRedo.imageData,
          position: actionToRedo.imagePosition,
          size: actionToRedo.imageSize || { width: 300, height: 200 },
          isDragging: false,
          isResizing: false,
        }
        setUploadedImages((prev) => [...prev, newImage])
      } else if (actionToRedo.type === "update-image" && actionToRedo.imageId) {
        // Handle image update (position/size)
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === actionToRedo.imageId
              ? {
                  ...img,
                  position: actionToRedo.imagePosition || img.position,
                  size: actionToRedo.imageSize || img.size,
                }
              : img,
          ),
        )
      } else if (actionToRedo.type === "remove-image" && actionToRedo.imageId) {
        // Handle image removal
        setUploadedImages((prev) => prev.filter((img) => img.id !== actionToRedo.imageId))
      } else if (actionToRedo.type === "clear") {
        clearCanvas(false)
      } else {
        drawFromAction(actionToRedo)
      }

      // Emit updated state to other users
      socketRef.current?.emit("whiteboard-state-update", {
        roomId,
        actions: [...actions, actionToRedo],
      })
    }
  }

  const drawFromAction = (action: DrawingAction) => {
    if (!contextRef.current || !canvasRef.current) return

    if (action.type === "clear") {
      contextRef.current.fillStyle = "#ffffff"
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      return
    }

    if (action.type === "image" || action.type === "remove-image" || action.type === "update-image") {
      // Images are handled separately through the uploadedImages state
      return
    }

    // Save current context settings
    const currentColor = contextRef.current.strokeStyle
    const currentLineWidth = contextRef.current.lineWidth

    // Apply action settings
    if (action.color) contextRef.current.strokeStyle = action.color
    if (action.size) contextRef.current.lineWidth = action.size

    if (action.mode === "text" && action.text && action.position) {
      contextRef.current.font = `${action.size || 15}px Arial`
      contextRef.current.fillStyle = action.color || "#000000"
      contextRef.current.fillText(action.text, action.position.x, action.position.y)
    } else if (action.mode === "rectangle" && action.points && action.points.length >= 2) {
      const [start, end] = action.points
      contextRef.current.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
    } else if (action.mode === "circle" && action.points && action.points.length >= 2) {
      const [center, edge] = action.points
      const radius = Math.sqrt(Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2))
      contextRef.current.beginPath()
      contextRef.current.arc(center.x, center.y, radius, 0, 2 * Math.PI)
      contextRef.current.stroke()
    } else if ((action.mode === "pencil" || action.mode === "eraser") && action.points && action.points.length >= 2) {
      contextRef.current.beginPath()
      contextRef.current.moveTo(action.points[0].x, action.points[0].y)

      for (let i = 1; i < action.points.length; i++) {
        contextRef.current.lineTo(action.points[i].x, action.points[i].y)
      }

      contextRef.current.stroke()
      contextRef.current.closePath()
    }

    // Restore previous context settings
    contextRef.current.strokeStyle = currentColor
    contextRef.current.lineWidth = currentLineWidth
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return

    // Create a temporary canvas to combine the base canvas and images
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvasRef.current.width
    tempCanvas.height = canvasRef.current.height
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    // Draw the base canvas
    tempCtx.drawImage(canvasRef.current, 0, 0)

    // Draw all images
    const drawPromises = uploadedImages.map(
      (img) =>
        new Promise<void>((resolve, reject) => {
          const image = new Image()
          image.crossOrigin = "anonymous"
          image.src = img.dataUrl
          image.onload = () => {
            tempCtx.drawImage(image, img.position.x, img.position.y, img.size.width, img.size.height)
            resolve()
          }
          image.onerror = reject
        }),
    )

    Promise.all(drawPromises)
      .then(() => {
        // Create download link
        const link = document.createElement("a")
        link.download = `whiteboard-${roomId}-${new Date().toISOString()}.png`
        link.href = tempCanvas.toDataURL("image/png")
        link.click()
      })
      .catch((error) => {
        console.error("Error drawing images for download:", error)
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "There was an error creating the whiteboard image.",
        })
      })
  }

  // Enhanced image handling
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || userRole !== "host") return

    // Store selected files
    const files = Array.from(e.target.files)
    setSelectedFiles(files)

    // Generate preview URLs
    const previews: string[] = []
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      previews.push(url)
    })

    setImagePreviewUrls(previews)
    setShowImageDialog(true)
  }

  const uploadSelectedImages = () => {
    if (selectedFiles.length === 0 || userRole !== "host") return

    // Process each selected file
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (!event.target?.result) return

        // Create a new image object
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          // Calculate size while maintaining aspect ratio
          const maxWidth = 400
          const maxHeight = 300
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }

          if (height > maxHeight) {
            width = (maxHeight / height) * width
            height = maxHeight
          }

          // Position images in a grid-like pattern
          const canvasRect = canvasRef.current?.getBoundingClientRect()
          const canvasWidth = canvasRect?.width || 800
          const canvasHeight = canvasRect?.height || 600

          // Calculate position based on index
          const imagesPerRow = Math.floor(canvasWidth / (maxWidth + 20))
          const row = Math.floor(index / imagesPerRow)
          const col = index % imagesPerRow

          const x = 20 + col * (maxWidth + 20)
          const y = 20 + row * (maxHeight + 20)

          // Generate unique ID for this image
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

          // Add to uploaded images
          const newImage: UploadedImage = {
            id: imageId,
            dataUrl: event.target.result as string,
            position: { x, y },
            size: { width, height },
            isDragging: false,
            isResizing: false,
          }

          setUploadedImages((prev) => [...prev, newImage])

          // Add action to history
          const newAction: DrawingAction = {
            type: "image",
            userId,
            imageId,
            imageData: event.target.result as string,
            imagePosition: { x, y },
            imageSize: { width, height },
          }

          setActions((prev) => [...prev, newAction])
          setRedoActions([])

          // Emit action to other users
          if (socketRef.current) {
            console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
            socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
          }
        }

        img.src = event.target.result as string
      }

      reader.readAsDataURL(file)
    })

    // Reset state
    setShowImageDialog(false)
    setSelectedFiles([])
    setImagePreviewUrls([])

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }

    toast({
      title: "Images Added",
      description: `${selectedFiles.length} image${selectedFiles.length > 1 ? "s" : ""} added to the whiteboard.`,
    })
  }

  // Image manipulation functions
  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>, imageId: string) => {
    if (userRole !== "host") return
    e.stopPropagation()

    const imageState = uploadedImages.find((img) => img.id === imageId)
    if (!imageState) return

    setSelectedImageId(imageId)

    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    // If near bottom-right corner (20x20 area), start resizing
    if (offsetX > imageState.size.width - 20 && offsetY > imageState.size.height - 20) {
      setIsResizingImage(imageId)
      setResizeStart({ x: e.clientX, y: e.clientY })
      setInitialSize({ ...imageState.size })
    } else {
      // Otherwise, start dragging
      setIsDraggingImage(imageId)
      setDragOffset({ x: offsetX, y: offsetY })
    }
  }

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (userRole !== "host") return
    e.preventDefault()
    e.stopPropagation()

    if (isDraggingImage) {
      const imageIndex = uploadedImages.findIndex((img) => img.id === isDraggingImage)
      if (imageIndex === -1) return

      const imageState = uploadedImages[imageIndex]
      const containerRect = drawAreaRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      setUploadedImages((prev) => {
        const newImages = [...prev]
        newImages[imageIndex] = { ...imageState, position: { x: newX, y: newY } }
        return newImages
      })
    } else if (isResizingImage) {
      const imageIndex = uploadedImages.findIndex((img) => img.id === isResizingImage)
      if (imageIndex === -1) return

      const imageState = uploadedImages[imageIndex]
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      setUploadedImages((prev) => {
        const newImages = [...prev]
        newImages[imageIndex] = {
          ...imageState,
          size: {
            width: Math.max(20, initialSize.width + deltaX),
            height: Math.max(20, initialSize.height + deltaY),
          },
        }
        return newImages
      })
    }
  }

  const handleImageMouseUp = () => {
    if (userRole !== "host" || (!isDraggingImage && !isResizingImage)) return

    // Find the modified image
    const imageId = isDraggingImage || isResizingImage
    const modifiedImage = uploadedImages.find((img) => img.id === imageId)
    if (!modifiedImage) return

    // Update action history with the new image position/size
    const newAction: DrawingAction = {
      type: "update-image",
      userId,
      imageId: modifiedImage.id,
      imagePosition: modifiedImage.position,
      imageSize: modifiedImage.size,
    }

    setActions((prev) => [...prev, newAction])

    // Emit action to other users
    if (socketRef.current) {
      console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
      socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
    }

    // Reset states
    setIsDraggingImage(null)
    setIsResizingImage(null)
    setSelectedImageId(null)
  }

  const removeImage = (imageId: string) => {
    if (userRole !== "host") return

    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))

    // Add a remove-image action
    const newAction: DrawingAction = {
      type: "remove-image",
      userId,
      imageId,
    }

    setActions((prev) => [...prev, newAction])

    // Emit action to other users
    if (socketRef.current) {
      console.log("Emitting whiteboard action to room:", `whiteboard-${roomId}`, newAction)
      socketRef.current.emit("whiteboard-action", { roomId, action: newAction })
    }
  }

  // NOTES FUNCTIONS
  const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (userRole !== "host") return

    const newContent = e.target.value
    setNotesContent(newContent)

    // Broadcast changes to other users
    socketRef.current?.emit("update-note", {
      roomId,
      content: newContent,
      userId,
    })

    // Debounce save to server
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSavingNotes(true)
        // Save to server
        socketRef.current?.emit("save-note", {
          roomId,
          content: newContent,
          userId,
        })
        setIsSavingNotes(false)
      } catch (error) {
        console.error("Failed to save notes:", error)
        setIsSavingNotes(false)
      }
    }, 1000)
  }

  // FILES FUNCTIONS
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else if (fileType.includes("pdf")) {
      return <FilePdf className="h-6 w-6 text-red-500" />
    } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) {
      return <FileArchive className="h-6 w-6 text-yellow-500" />
    } else if (
      fileType.includes("javascript") ||
      fileType.includes("html") ||
      fileType.includes("css") ||
      fileType.includes("json")
    ) {
      return <FileCode className="h-6 w-6 text-green-500" />
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
    else return (bytes / 1073741824).toFixed(1) + " GB"
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || userRole !== "host") return

    const file = e.target.files[0]

    // Start upload process
    setIsUploading(true)
    setUploadProgress(0)

    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("roomId", roomId)
    formData.append("userId", userId)

    // Read file as data URL for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!event.target?.result) return

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 200)

      // Simulate file upload completion
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(100)

        setTimeout(() => {
          // Create a file object with the data URL for direct access
          const newFile: SharedFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // Create a local URL for the file
            dataUrl: event.target.result as string, // Store the data URL for direct access
            uploadedBy: "Current User",
            uploaderId: userId,
            timestamp: new Date(),
          }

          // Emit to server
          socketRef.current?.emit("share-file", {
            roomId,
            file: newFile,
          })

          setIsUploading(false)
          setUploadProgress(0)

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }

          toast({
            title: "File Uploaded",
            description: `${file.name} has been shared with all participants.`,
          })
        }, 500)
      }, 2000)
    }

    reader.readAsDataURL(file)
  }

  const deleteFile = (fileId: string) => {
    if (userRole !== "host") return

    // Emit to server
    socketRef.current?.emit("delete-file", {
      roomId,
      fileId,
    })

    toast({
      title: "File Deleted",
      description: "The file has been removed from the shared files.",
    })
  }

  // Toggle fullscreen for whiteboard
  const toggleFullScreen = () => {
    if (!whiteboardContainerRef.current) return

    if (!document.fullscreenElement) {
      // Enter fullscreen
      whiteboardContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullScreen(true)
          // Re-initialize canvas after entering fullscreen
          setTimeout(initializeCanvas, 100)
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
      // Exit fullscreen
      document
        .exitFullscreen()
        .then(() => {
          setIsFullScreen(false)
          // Re-initialize canvas after exiting fullscreen
          setTimeout(initializeCanvas, 100)
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
    }
  }

  return (
    <div
      ref={whiteboardContainerRef}
      className={cn(
        "flex flex-col bg-background border rounded-md overflow-hidden",
        isFullScreen && "fixed inset-0 z-50",
      )}
      style={{
        height: isFullScreen ? "100vh" : "calc(100vh - 20px)",
        minHeight: "1200px", // Even larger minimum height
      }}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collaborative Whiteboard</h3>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "success" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
          <Button variant="outline" size="icon" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="draw"
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as any)}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
        </div>

        {/* DRAWING TAB */}
        <TabsContent value="draw" className="flex-1 flex flex-col p-0 m-0 overflow-hidden h-full">
          {/* Only show tools for host */}
          {userRole === "host" && (
            <>
              <div className="flex justify-between p-2 border-b">
                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={drawingMode === "pencil" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setDrawingMode("pencil")}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Pencil</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={drawingMode === "rectangle" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setDrawingMode("rectangle")}
                          className="h-8 w-8"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rectangle</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={drawingMode === "circle" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setDrawingMode("circle")}
                          className="h-8 w-8"
                        >
                          <Circle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Circle</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={drawingMode === "text" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setDrawingMode("text")}
                          className="h-8 w-8"
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Text</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={drawingMode === "eraser" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setDrawingMode("eraser")}
                          className="h-8 w-8"
                        >
                          <Eraser className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eraser</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={undo}
                          disabled={actions.length === 0}
                          className="h-8 w-8"
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Undo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={redo}
                          disabled={redoActions.length === 0}
                          className="h-8 w-8"
                        >
                          <Redo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Redo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => clearCanvas()} className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={downloadCanvas} className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <ImageIcon className="h-4 w-4" />
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelection}
                            className="hidden"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Upload Images</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>

              <div className="flex items-center gap-2 p-2 border-b">
                <div className="flex gap-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={cn("w-6 h-6 rounded-full border", color === c && "ring-2 ring-primary ring-offset-2")}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs">Size:</span>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                    className="w-32"
                  />
                  <span className="text-xs">{size}px</span>
                </div>
              </div>
            </>
          )}

          {textPosition && userRole === "host" && (
            <div className="flex items-center gap-2 p-2 border-b">
              <Input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={addText}>
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTextPosition(null)}>
                Cancel
              </Button>
            </div>
          )}

          {userRole === "participant" && (
            <div className="p-2 bg-muted/50 border-b">
              <p className="text-sm text-muted-foreground">View only mode - Only the host can draw on the whiteboard</p>
            </div>
          )}

          <div
            className="flex-1 relative bg-white overflow-hidden"
            ref={drawAreaRef}
            style={{
              flex: 1,
              height: "100vh",
              minHeight: "1000px",
              display: "flex",
              flexDirection: "column",
              position: "relative", // Ensure proper positioning
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={finishDrawing}
              onMouseLeave={finishDrawing}
              className={cn(
                "absolute inset-0 w-full h-full",
                userRole === "host" ? "cursor-crosshair" : "cursor-default",
              )}
            />

            {/* Render uploaded images */}
            {uploadedImages.map((img) => (
              <div
                key={img.id}
                className="absolute"
                style={{
                  left: `${img.position.x}px`,
                  top: `${img.position.y}px`,
                  width: `${img.size.width}px`,
                  height: `${img.size.height}px`,
                  cursor: userRole === "host" ? "move" : "default",
                  border: selectedImageId === img.id ? "2px dashed #3b82f6" : "none",
                  zIndex: selectedImageId === img.id ? 10 : 1,
                }}
                onMouseDown={(e) => handleImageMouseDown(e, img.id)}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
              >
                <img
                  src={img.dataUrl || "/placeholder.svg"}
                  alt="Uploaded content"
                  className="w-full h-full object-contain"
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />

                {userRole === "host" && (
                  <>
                    {/* Resize handle */}
                    <div
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center cursor-se-resize"
                      style={{ zIndex: 2 }}
                    >
                      <div className="w-3 h-3 border-b-2 border-r-2 border-white transform rotate-45" />
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-3 -right-3 h-6 w-6 rounded-full"
                      onClick={() => removeImage(img.id)}
                      style={{ zIndex: 2 }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="flex-1 flex flex-col p-0 m-0">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">Collaborative Notes</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSavingNotes && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
            </div>
          </div>

          {isLoadingNotes ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Textarea
              value={notesContent}
              onChange={handleNotesChange}
              placeholder="Start taking notes... (Changes are saved automatically)"
              className="flex-1 resize-none border-none p-4 text-base font-mono h-full focus-visible:ring-0 focus-visible:ring-offset-0"
              readOnly={userRole !== "host"}
              style={{ height: "100%" }}
            />
          )}

          {userRole === "participant" && (
            <div className="p-2 bg-muted/50 border-t">
              <p className="text-sm text-muted-foreground">View only mode - Only the host can edit notes</p>
            </div>
          )}
        </TabsContent>

        {/* FILES TAB */}
        <TabsContent value="files" className="flex-1 flex flex-col p-0 mb-96">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shared Files</h3>
              <Badge variant={isConnected ? "success" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>

          {userRole === "host" && (
            <div className="p-4 border-b">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">Share files with all participants in the session</p>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>

                {isUploading && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {userRole === "participant" && (
            <div className="p-2 bg-muted/50 border-b">
              <p className="text-sm text-muted-foreground">View only mode - Only the host can upload files</p>
            </div>
          )}

          <div className="flex-1 p-4 overflow-auto" style={{ height: "100%" }}>
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <File className="h-12 w-12 mb-2 opacity-20" />
                <p>No files shared yet</p>
                <p className="text-sm">
                  {userRole === "host"
                    ? "Upload a file to share with everyone"
                    : "The host hasn't shared any files yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">{file.name}</CardTitle>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            <Separator orientation="vertical" className="mx-2 h-3" />
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(file.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-xs">Shared by {file.uploadedBy}</span>
                      </div>

                      {/* Preview for image files */}
                      {file.type.startsWith("image/") && file.dataUrl && (
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <img
                            src={file.dataUrl || file.url}
                            alt={file.name}
                            className="max-h-40 object-contain mx-auto"
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open the file in a new tab using the dataUrl
                          const newWindow = window.open()
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>${file.name}</title>
                                </head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;">
                                  ${
                                    file.type.startsWith("image/")
                                      ? `<img src="${file.dataUrl}" alt="${file.name}" style="max-width:100%;max-height:100%;" />`
                                      : `<div style="padding:20px;background:white;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                                        <h3>File: ${file.name}</h3>
                                        <p>Type: ${file.type}</p>
                                        <p>Size: ${formatFileSize(file.size)}</p>
                                        <a href="${file.dataUrl}" download="${file.name}" style="display:inline-block;padding:8px 16px;background:#3b82f6;color:white;text-decoration:none;border-radius:4px;margin-top:10px;">Download</a>
                                      </div>`
                                  }
                                </body>
                              </html>
                            `)
                            newWindow.document.close()
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create a direct download using the dataUrl
                          const link = document.createElement("a")
                          link.href = file.dataUrl || ""
                          link.download = file.name
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                      {userRole === "host" && file.uploaderId === userId && (
                        <Button variant="destructive" size="sm" onClick={() => deleteFile(file.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>
              Add images to the whiteboard. You can resize and reposition them after adding.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-contain"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false)
                setSelectedFiles([])
                setImagePreviewUrls([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={uploadSelectedImages}>Add to Whiteboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Whiteboard
