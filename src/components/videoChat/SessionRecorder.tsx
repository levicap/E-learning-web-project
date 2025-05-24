"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Pause, Play, Square, Download, Mic, MicOff, MonitorUp } from "lucide-react"

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":")
}

interface SessionRecorderProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
}

const SessionRecorder: React.FC<SessionRecorderProps> = ({ localStream, remoteStreams }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingName, setRecordingName] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [includeAudio, setIncludeAudio] = useState(true)
  const [isCapturingScreen, setIsCapturingScreen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl)
      }
    }
  }, [recordingUrl])

  // Helper function to get supported MIME type
  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
      "video/mp4",
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return "video/webm" // Default fallback
  }

  const startScreenCapture = async () => {
    try {
      setIsCapturingScreen(true)

      // Reset recorded chunks
      recordedChunksRef.current = []

      // Request screen capture
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: includeAudio,
      })

      screenStreamRef.current = screenStream

      // If we need additional audio and screen capture didn't include it
      if (includeAudio && !screenStream.getAudioTracks().length) {
        try {
          // Try to get user audio
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioStream.getAudioTracks().forEach((track) => {
            screenStream.addTrack(track)
          })
        } catch (audioError) {
          console.warn("Could not get user audio:", audioError)

          // Try to get audio from the local stream or remote streams as fallback
          let audioTrack = null

          if (localStream && localStream.getAudioTracks().length) {
            audioTrack = localStream.getAudioTracks()[0]
          } else {
            // Find first available audio track from remote streams
            for (const stream of remoteStreams) {
              if (stream && stream.getAudioTracks().length) {
                audioTrack = stream.getAudioTracks()[0]
                break
              }
            }
          }

          // If we found an audio track, add it to the screen stream
          if (audioTrack) {
            screenStream.addTrack(audioTrack)
          }
        }
      }

      // Set up MediaRecorder with the screen stream
      const mimeType = getSupportedMimeType()
      const options = {
        mimeType,
        videoBitsPerSecond: 3000000, // 3 Mbps
      }

      const mediaRecorder = new MediaRecorder(screenStream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, processing recording...")

        // Create recording blob
        const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        setRecordedBlob(blob)

        // Create URL for the blob
        const url = URL.createObjectURL(blob)
        setRecordingUrl(url)

        console.log("Recording URL created:", url)

        // Stop all tracks in the screen stream
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop())
        }

        setIsCapturingScreen(false)
      }

      // Handle user stopping the screen share through the browser UI
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }

      return mediaRecorder
    } catch (error) {
      console.error("Error capturing screen:", error)
      toast({
        variant: "destructive",
        title: "Screen Capture Error",
        description: "Failed to capture your screen. Please try again.",
      })
      setIsCapturingScreen(false)
      return null
    }
  }

  const startRecording = async () => {
    if (!recordingName.trim()) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Please enter a name for the recording.",
      })
      return
    }

    setRecordingUrl(null)
    setRecordedBlob(null)
    setRecordingTime(0)

    const mediaRecorder = await startScreenCapture()
    if (!mediaRecorder) return

    try {
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      setShowDialog(false)

      toast({
        title: "Recording Started",
        description: "Your screen is now being recorded.",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
      })
    }
  }

  const pauseRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return

    if (isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      // Pause recording
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setIsRecording(false)
    setIsPaused(false)

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    toast({
      title: "Recording Stopped",
      description: "Your recording is ready to download.",
    })
  }

  const downloadRecording = () => {
    if (!recordedBlob) return

    const a = document.createElement("a")
    a.href = recordingUrl || URL.createObjectURL(recordedBlob)
    a.download = `${recordingName.trim() || "screen-recording"}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Effect to handle video preview when recording URL changes
  useEffect(() => {
    if (recordingUrl && videoPreviewRef.current) {
      console.log("Setting video source to:", recordingUrl)
      videoPreviewRef.current.src = recordingUrl

      // Force load and play
      const playPromise = videoPreviewRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing video:", error)
        })
      }
    }
  }, [recordingUrl])

  return (
    <>
      <div className="flex flex-col space-y-4">
        {isRecording ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-medium">Recording: {formatDuration(recordingTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={pauseRecording}>
                  {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button variant="destructive" size="sm" onClick={stopRecording}>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recordingUrl ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-md overflow-hidden">
                  <video ref={videoPreviewRef} className="w-full h-full" controls autoPlay playsInline />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (recordingUrl) {
                        URL.revokeObjectURL(recordingUrl)
                      }
                      setRecordingUrl(null)
                      setRecordedBlob(null)
                    }}
                  >
                    Discard
                  </Button>
                  <Button onClick={downloadRecording}>
                    <Download className="h-4 w-4 mr-1" />
                    Download Recording
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowDialog(true)}
                disabled={isCapturingScreen}
              >
                {isCapturingScreen ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <MonitorUp className="h-4 w-4 mr-2" />
                    Record Screen
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Your Screen</DialogTitle>
            <DialogDescription>
              Capture your screen for later viewing. You'll be prompted to select which screen or window to record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recording-name">Recording Name</Label>
              <Input
                id="recording-name"
                placeholder="Enter a name for this recording"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={includeAudio ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeAudio(true)}
                className="flex-1"
              >
                <Mic className="h-4 w-4 mr-1" />
                Include Audio
              </Button>
              <Button
                variant={!includeAudio ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeAudio(false)}
                className="flex-1"
              >
                <MicOff className="h-4 w-4 mr-1" />
                Video Only
              </Button>
            </div>

            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Note:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>You'll be asked which screen or window to share</li>
                <li>Recording will be saved locally on your device</li>
                <li>You can stop recording at any time</li>
                <li>Make sure all participants are aware of the recording</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={startRecording} disabled={!recordingName.trim() || isCapturingScreen}>
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SessionRecorder
