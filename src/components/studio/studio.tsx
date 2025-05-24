"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  VideoIcon,
  Play,
  Pause,
  Mic,
  PenTool,
  Code2,
  GitBranch,
  Presentation,
  FileSpreadsheet,
  BarChart,
  BookOpen,
  Square,
} from "lucide-react"
import { useMediaRecorder } from "@/hooks/useMediaRecorder"
import { Whiteboard } from "./Whiteboard"
import { CodeEditor } from "./CodeEditor"
import { MindMap } from "./MindMap"
import { PreviewPanel } from "./PreviewPanel"
import VideoRecorder from "./video"
import { SpreadsheetToolbar } from "./spreadsheet/SpreadsheetToolbar"
import { SpreadsheetGrid } from "./spreadsheet/SpreadsheetGrid"
import AicourseGenerator from "./aiscript"
import Aiprediction from "./aipr/dashboard"
import Home from "./lessonplan"
import Powerpoint from "./powerpoint"

function Studio() {
  const [recordingType, setRecordingType] = useState<"audio" | "video">("screen")
  const [activeTab, setActiveTab] = useState<
    | "preview"
    | "whiteboard"
    | "code"
    | "mindmap"
    | "home" // Added 'home' instead of 'slides'
    | "powerpoint" // Added 'powerpoint'
    | "spreadsheet"
    | "aicoursegenerator"
    | "aiprediction"
    | "videoedit"
  >("preview")

  // Spreadsheet state
  const [spreadsheetData, setSpreadsheetData] = useState<Record<string, any>[]>([])
  const spreadsheetHeaders = ["A", "B", "C", "D", "E", "F"]
  const spreadsheetRows = 15

  // Slides state
  const [slides, setSlides] = useState([
    { id: 1, content: [] },
    { id: 2, content: [] },
    { id: 3, content: [] },
  ])
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null)

  const { isRecording, isPaused, startRecording, stopRecording, pauseRecording, resumeRecording, stream } =
    useMediaRecorder({ type: recordingType })

  // Spreadsheet handlers
  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...spreadsheetData]
    if (!newData[row]) newData[row] = {}
    newData[row][spreadsheetHeaders[col]] = value
    setSpreadsheetData(newData)
  }

  const handleFormatChange = (format: string) => console.log("Format changed:", format)
  const handleFunctionInsert = () => console.log("Insert function")
  const handleFilter = () => console.log("Apply filter")
  const handleSort = () => console.log("Sort data")
  const handleChartInsert = () => console.log("Insert chart")

  // Slides handlers
  const handleNewSlide = () => {
    setSlides([...slides, { id: slides.length + 1, content: [] }])
  }
  const handleSlideContentChange = (slideId: number, content: any) => {
    setSlides(slides.map((s) => (s.id === slideId ? { ...s, content } : s)))
  }
  const handleInsertElement = (type: string) => {
    if (selectedSlide === null) return
    const newSlides = [...slides]
    newSlides[selectedSlide].content.push({ type, data: "" })
    setSlides(newSlides)
  }

  const handleStartStop = async () => {
    if (isRecording) {
      const blob = await stopRecording()
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `recording.${recordingType === "audio" ? "webm" : "webm"}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } else {
      await startRecording()
    }
  }

  const renderMainContent = () => {
    if (activeTab === "preview") {
      if (recordingType === "video") {
        return <VideoRecorder />
      } else {
        return (
          <>
            <Card className="mb-4">
              <CardContent className="p-4">
                <PreviewPanel recordingType={recordingType} isRecording={isRecording} stream={stream} />
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-2">
              <Button variant={isRecording ? "destructive" : "default"} size="lg" onClick={handleStartStop}>
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={!isRecording}
              >
                <Pause className="mr-2 h-4 w-4" />
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
          </>
        )
      }
    }

    if (activeTab === "aicoursegenerator") {
      return <AicourseGenerator />
    }
    if (activeTab === "videoedit") {
      return (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-2xl font-bold mb-4">Video Edit</h2>
            <p>Video editing tools coming soon...</p>
          </CardContent>
        </Card>
      )
    }

    switch (activeTab) {
      case "home":
        return <Home />
      case "powerpoint":
        return <Powerpoint />
      case "whiteboard":
        return <Whiteboard />
      case "code":
        return <CodeEditor />
      case "mindmap":
        return <MindMap />
      case "spreadsheet":
        return (
          <div className="h-[600px] flex flex-col">
            <SpreadsheetToolbar
              onFormatChange={handleFormatChange}
              onFunctionInsert={handleFunctionInsert}
              onFilter={handleFilter}
              onSort={handleSort}
              onChartInsert={handleChartInsert}
            />
            <SpreadsheetGrid
              headers={spreadsheetHeaders}
              rows={spreadsheetRows}
              data={spreadsheetData}
              onCellChange={handleCellChange}
            />
          </div>
        )
      case "aiprediction": // ← new AI Predictions tab
        return <Aiprediction />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background mt-20 ml-0">
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2">
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setRecordingType("video")
                    setActiveTab("preview")
                  }}
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Record
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setRecordingType("audio")
                    setActiveTab("preview")
                  }}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Audio
                </Button>

                <Separator />

                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("whiteboard")}>
                  <PenTool className="mr-2 h-4 w-4" />
                  Whiteboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("code")}>
                  <Code2 className="mr-2 h-4 w-4" />
                  Code Editor
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("mindmap")}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Mind Map
                </Button>

                <Separator />

                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("home")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Lesson Plan
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("powerpoint")}>
                  <Presentation className="mr-2 h-4 w-4" />
                  Powerpoint
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("spreadsheet")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Spreadsheet
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("aiprediction")}>
                  <BarChart className="mr-2 h-4 w-4" />
                  AI Predictions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("aicoursegenerator")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  AI Course Generator
                </Button>

                <Separator />

                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("videoedit")}>
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Video Edit
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-10">{renderMainContent()}</div>
        </div>
      </main>
    </div>
  )
}

export default Studio
