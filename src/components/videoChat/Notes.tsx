"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileDown,
  Save,
  Trash,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { io } from "socket.io-client"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface NotesProps {
  roomId: string
  userId: string
  username: string
}

const COLORS = [
  { name: "Default", value: "#000000" },
  { name: "Red", value: "#e11d48" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#9333ea" },
  { name: "Orange", value: "#ea580c" },
  { name: "Pink", value: "#db2777" },
]

const Notes: React.FC<NotesProps> = ({ roomId, userId, username }) => {
  const [notes, setNotes] = useState<string>("")
  const [title, setTitle] = useState<string>(`Session Notes - ${new Date().toLocaleDateString()}`)
  const [socket, setSocket] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<string>("personal")
  const [personalNotes, setPersonalNotes] = useState<string>("")
  const [sharedNotes, setSharedNotes] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Connect to socket
  useEffect(() => {
    const s = io("http://localhost:5000")
    setSocket(s)

    s.on("connect", () => {
      setIsConnected(true)
      s.emit("join-notes", { roomId, userId })
      s.emit("get-notes", { roomId })
    })

    s.on("notes-state", (content) => {
      setSharedNotes(content || "")
    })

    s.on("note-updated", (content) => {
      if (!isEditing) {
        setSharedNotes(content)
      }
    })

    s.on("connect_error", () => {
      setIsConnected(false)
    })

    return () => {
      s.disconnect()
    }
  }, [roomId, userId])

  // Load personal notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${roomId}_${userId}`)
    if (savedNotes) {
      setPersonalNotes(savedNotes)
    }
  }, [roomId, userId])

  // Set active notes based on tab
  useEffect(() => {
    if (activeTab === "personal") {
      setNotes(personalNotes)
    } else {
      setNotes(sharedNotes)
    }
  }, [activeTab, personalNotes, sharedNotes])

  const handleFormatCommand = (command: string, value: string = null) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleColorChange = (color: string) => {
    handleFormatCommand("foreColor", color)
  }

  const handleNoteChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      if (activeTab === "personal") {
        setPersonalNotes(content)
        localStorage.setItem(`notes_${roomId}_${userId}`, content)
      } else {
        setSharedNotes(content)
        socket?.emit("update-note", { roomId, content, userId })
      }
    }
  }

  const handleSaveNotes = () => {
    if (activeTab === "shared") {
      socket?.emit("save-note", { roomId, content: sharedNotes, userId })
      setLastSaved(new Date())
      toast({
        title: "Notes saved",
        description: "Your notes have been saved to the server.",
      })
    } else {
      localStorage.setItem(`notes_${roomId}_${userId}`, personalNotes)
      setLastSaved(new Date())
      toast({
        title: "Notes saved",
        description: "Your personal notes have been saved locally.",
      })
    }
  }

  const handleClearNotes = () => {
    if (activeTab === "personal") {
      setPersonalNotes("")
      localStorage.removeItem(`notes_${roomId}_${userId}`)
    } else {
      setSharedNotes("")
      socket?.emit("update-note", { roomId, content: "", userId })
      socket?.emit("save-note", { roomId, content: "", userId })
    }
  }

  const exportToPDF = async () => {
    if (!editorRef.current) return

    try {
      toast({
        title: "Preparing PDF",
        description: "Your notes are being prepared for download...",
      })

      const canvas = await html2canvas(editorRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      })

      // Add title
      pdf.setFontSize(16)
      pdf.text(title, 20, 20)

      // Add date
      pdf.setFontSize(10)
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 30)

      // Calculate aspect ratio
      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add the image
      pdf.addImage(imgData, "PNG", 20, 40, imgWidth, imgHeight)

      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`)

      toast({
        title: "PDF exported",
        description: "Your notes have been exported as a PDF file.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your notes to PDF.",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1 flex-1">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              placeholder="Enter a title for your notes"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1">
              Personal Notes
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared Notes {!isConnected && "(Offline)"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-2 border-b bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormatCommand("bold")}>
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormatCommand("italic")}>
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("underline")}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Type className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Text Style</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFormatCommand("formatBlock", "p")}>
                <Type className="h-4 w-4 mr-2" />
                Normal Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatCommand("formatBlock", "h1")}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatCommand("formatBlock", "h2")}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatCommand("formatBlock", "h3")}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Text Color</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              {COLORS.map((color) => (
                <DropdownMenuItem key={color.value} onClick={() => handleColorChange(color.value)}>
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: color.value }}></div>
                    <span>{color.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("insertUnorderedList")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("insertOrderedList")}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("justifyLeft")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("justifyCenter")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFormatCommand("justifyRight")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Notes</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportToPDF}>
                  <FileDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export to PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClearNotes}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear Notes</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div
          ref={editorRef}
          className="min-h-[300px] p-4 border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          contentEditable
          dangerouslySetInnerHTML={{ __html: notes }}
          onInput={handleNoteChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
      </ScrollArea>

      <div className="p-2 border-t text-xs text-muted-foreground">
        {lastSaved ? <span>Last saved: {lastSaved.toLocaleTimeString()}</span> : <span>Not saved yet</span>}
        {activeTab === "shared" && (
          <span className="ml-2">{isConnected ? "Connected to shared notes" : "Disconnected from shared notes"}</span>
        )}
      </div>
    </div>
  )
}

export default Notes
