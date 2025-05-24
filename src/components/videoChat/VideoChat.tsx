"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IScreenVideoTrack,
} from "agora-rtc-sdk-ng"
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MessageSquare,
  Users,
  Settings,
  ScreenShare,
  PhoneOff,
  Maximize,
  Minimize,
  Hand,
  FlagOffIcon as HandOff,
  FileText,
  Video,
  Clock,
  PenLine,
  ZoomIn,
  ZoomOut,
  Flag,
} from "lucide-react"
import axios from "axios"
import Chat from "./Chat"
import ParticipantsList from "./ParticipantsList"
import Whiteboard from "./whiteboard"
import Notes from "./Notes"
import SessionRecorder from "./SessionRecorder"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResizeHandle from "./resizehandle"
import { useNavigate } from "react-router-dom" // If you're using React Router
import { toast } from "@/components/ui/use-toast" // If you're using the toast component
import { io } from "socket.io-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoChatProps {
  channel: string
  onLeave: () => void
  username: string
  userId: string
  userRole?: string // Add userRole prop to receive from parent
}

const AGORA_APP_ID = "6e95e9bc2f2644fc97950ea2d9f6aee3"

const VideoChat: React.FC<VideoChatProps> = ({
  channel,
  onLeave,
  username,
  userId,
  userRole: initialUserRole = "student",
}) => {
  const { user } = useUser()
  const [localTracks, setLocalTracks] = useState<{
    audioTrack: IMicrophoneAudioTrack | null
    videoTrack: ICameraVideoTrack | null
    screenTrack: IScreenVideoTrack | null
  }>({
    audioTrack: null,
    videoTrack: null,
    screenTrack: null,
  })
  const [remoteUsers, setRemoteUsers] = useState<
    {
      uid: string
      videoTrack?: ICameraVideoTrack | null
      audioTrack?: IMicrophoneAudioTrack | null
      isScreenShare?: boolean
      username?: string
      role?: string
      isHandRaised?: boolean
    }[]
  >([])
  const [micMuted, setMicMuted] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [showSelfView, setShowSelfView] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [layout, setLayout] = useState<"grid" | "focus">("grid")
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "whiteboard" | "notes" | "recorder" | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDialog, setRecordingDialog] = useState(false)
  const [recordingName, setRecordingName] = useState("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [userRole, setUserRole] = useState<"host" | "participant">(
    // Set initial role based on the user's role from props
    initialUserRole === "teacher" ? "host" : "participant",
  )
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [isKicked, setIsKicked] = useState(false)
  const [kickReason, setKickReason] = useState("")
  const [raisedHands, setRaisedHands] = useState<string[]>([])
  const [remoteScreenShares, setRemoteScreenShares] = useState<{ uid: string; track: any }[]>([])
  const [screenShareZoom, setScreenShareZoom] = useState(1)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportCategory, setReportCategory] = useState("inappropriate")
  const [isVideoFullScreen, setIsVideoFullScreen] = useState(false)
  const [fullScreenVideoId, setFullScreenVideoId] = useState<string | null>(null)
  const navigate = useNavigate() // If using React Router

  const rtcClient = useRef<IAgoraRTCClient | null>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const localScreenRef = useRef<HTMLDivElement>(null)
  const remoteVideoRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const remoteScreenRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)
  const screenShareContainerRef = useRef<HTMLDivElement>(null)
  const fullScreenVideoRef = useRef<HTMLDivElement>(null)

  // Log the initial user role for debugging
  useEffect(() => {
    console.log("Initial user role:", initialUserRole)
    console.log("Setting user as:", initialUserRole === "teacher" ? "host" : "participant")
  }, [initialUserRole])

  useEffect(() => {
    const initializeSession = async () => {
      try {
        await axios.post("http://localhost:5000/api/rooms", {
          name: channel,
          type: "live-session",
        })
        setSessionStartTime(new Date())
      } catch (error) {
        console.error("Failed to create room:", error)
        setError("Failed to create room. Please try again.")
      }
    }

    initializeSession()
  }, [channel])

  useEffect(() => {
    const wasKicked = localStorage.getItem(`kicked_from_${channel}`) === "true"
    if (wasKicked) {
      toast({
        variant: "destructive",
        title: "Cannot join session",
        description: "You were removed from this session and cannot rejoin.",
      })
      onLeave()
    }
  }, [channel, onLeave])

  useEffect(() => {
    // Set up socket listener for kick events and hand raising
    // Try to use the environment variable first, then fall back to localhost
    const socketUrl = "http://localhost:5000"
    console.log("Connecting to socket at:", socketUrl)

    const socket = io(socketUrl)
    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Socket connected successfully")
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setError(`Failed to connect to chat server: ${error.message}`)
    })

    // Register for user-specific messages
    socket.emit("register-user", {
      userId,
      clerkId: user?.id,
    })

    // Listen for kicked event
    socket.on("kicked", ({ room, reason, isBanned }) => {
      if (room === channel) {
        console.log("You have been kicked from the room")

        // Clean up resources
        localTracks.audioTrack?.close()
        localTracks.videoTrack?.close()
        localTracks.screenTrack?.close()
        rtcClient.current?.leave()

        // Store kicked status in localStorage to prevent rejoining
        localStorage.setItem(`kicked_from_${channel}`, "true")
        localStorage.removeItem("voiceChatState") // Remove persisted state

        // Redirect to join page
        onLeave()

        // Show toast notification with appropriate message
        toast({
          variant: "destructive",
          title: isBanned ? "Access Denied" : "Removed from session",
          description:
            reason ||
            (isBanned
              ? "You have been banned from this session and cannot rejoin."
              : "You have been removed from this session by the host."),
        })
      }
    })

    // Listen for hand raise events
    socket.on("hand-raised", ({ userId: raisedUserId, isRaised, username: raisedUsername }) => {
      // Update remote users with hand raised status
      setRemoteUsers((prev) =>
        prev.map((user) => {
          // Only update hand raised status for participants, not hosts
          if (user.uid === raisedUserId && user.role !== "host") {
            return { ...user, isHandRaised: isRaised }
          }
          return user
        }),
      )

      // Update raised hands list
      if (isRaised) {
        setRaisedHands((prev) => [...prev, raisedUserId])

        // Notify host of raised hand
        if (userRole === "host") {
          toast({
            title: "Hand Raised",
            description: `${raisedUsername || "A participant"} has a question.`,
          })
        }
      } else {
        setRaisedHands((prev) => prev.filter((id) => id !== raisedUserId))
      }
    })

    // Listen for screen share status updates
    socket.on("screen-share-update", ({ userId: sharingUserId, isSharing }) => {
      console.log(
        `Received screen share update: User ${sharingUserId} is ${isSharing ? "sharing" : "not sharing"} screen`,
      )

      // Update UI to reflect screen sharing status
      if (isSharing) {
        toast({
          title: "Screen Share Started",
          description: "A user has started sharing their screen.",
        })
      } else {
        toast({
          title: "Screen Share Ended",
          description: "Screen sharing has ended.",
        })
      }
    })

    return () => {
      socket.off("kicked")
      socket.off("hand-raised")
      socket.off("screen-share-update")
      socket.disconnect()
    }
  }, [channel, userId, onLeave, localTracks, user?.id, userRole])

  useEffect(() => {
    const initAgoraClient = async () => {
      rtcClient.current = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
        role: "host",
      })

      try {
        const uid = Math.floor(Math.random() * 10000)

        // Join channel directly with App ID
        await rtcClient.current.join(AGORA_APP_ID, channel, null, uid)
        console.log(`Joined Agora channel: ${channel} with UID: ${uid}`)

        // Create audio and video tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128,
          },
        })

        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000,
          },
        })

        // Set initial states
        audioTrack.setEnabled(!micMuted)
        videoTrack.setEnabled(videoEnabled)

        // Publish tracks to channel
        await rtcClient.current.publish([audioTrack, videoTrack])
        console.log("Published local audio and video tracks")

        setLocalTracks({
          audioTrack,
          videoTrack,
          screenTrack: null,
        })
        setIsConnected(true)

        // REMOVED: No longer setting host based on first joiner
        // Instead, we use the userRole from props which is based on the user's role in the database

        if (localVideoRef.current && videoEnabled) {
          videoTrack.play(localVideoRef.current)
        }

        // Handle remote users

        rtcClient.current.on("exception", (event) => {
          console.warn("Agora exception:", event)
          setError(`Connection issue: ${event.code}`)
        })
      } catch (error) {
        console.error("Failed to initialize Agora client:", error)
        setIsConnected(false)
        setError("Failed to connect to video chat. Please try again.")
      }
    }

    initAgoraClient()

    return () => {
      // Clean up resources
      localTracks.audioTrack?.close()
      localTracks.videoTrack?.close()
      localTracks.screenTrack?.close()
      rtcClient.current?.leave()

      // Clear recording timer if active
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [channel, micMuted, videoEnabled, initialUserRole])

  // Effect to play remote video tracks when refs are updated
  useEffect(() => {
    remoteUsers.forEach((user) => {
      const refElement = remoteVideoRefs.current[user.uid]
      if (refElement && user.videoTrack) {
        // Stop any existing playback first to prevent duplicates
        user.videoTrack.stop()
        // Play the video track in the ref element
        user.videoTrack.play(refElement)
      }
    })
  }, [remoteUsers])

  // Effect to play remote screen shares when refs are updated
  useEffect(() => {
    remoteScreenShares.forEach((screenShare) => {
      const refElement = remoteScreenRefs.current[screenShare.uid]
      if (refElement && screenShare.track) {
        // Stop any existing playback first to prevent duplicates
        screenShare.track.stop()
        // Play the screen share track in the ref element
        screenShare.track.play(refElement)
      }
    })
  }, [remoteScreenShares])

  // Effect to handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        setRecordingTime(0)
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  // Add resize event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && sidebarRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width

        // Calculate new width based on mouse position
        const newWidth = containerWidth - (e.clientX - containerRect.left)

        // Apply min and max constraints
        const minWidth = 280
        const maxWidth = Math.min(600, containerWidth * 0.6)
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))

        setSidebarWidth(constrainedWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      const newMutedState = !micMuted
      await localTracks.audioTrack.setEnabled(!newMutedState)
      setMicMuted(newMutedState)
    }
  }

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      const newVideoState = !videoEnabled
      await localTracks.videoTrack.setEnabled(newVideoState)
      setVideoEnabled(newVideoState)

      if (newVideoState && localVideoRef.current) {
        localTracks.videoTrack.play(localVideoRef.current)
      }

      // Re-publish video track to ensure other participants can see the change
      if (rtcClient.current) {
        if (newVideoState) {
          await rtcClient.current.unpublish([localTracks.videoTrack])
          await rtcClient.current.publish([localTracks.videoTrack])
        }
      }
    }
  }

  // Replace the toggleScreenShare function with this updated version that unpublishes the camera track before publishing the screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (localTracks.screenTrack) {
        console.log("Stopping screen share")
        await rtcClient.current?.unpublish(localTracks.screenTrack)
        localTracks.screenTrack.close()

        setLocalTracks((prev) => ({
          ...prev,
          screenTrack: null,
        }))

        // Re-publish camera track if it was enabled
        if (videoEnabled && localTracks.videoTrack) {
          console.log("Re-publishing camera track")
          await rtcClient.current?.publish([localTracks.videoTrack])

          if (localVideoRef.current) {
            localTracks.videoTrack.play(localVideoRef.current)
          }
        }

        setIsScreenSharing(false)
        setScreenShareZoom(1) // Reset zoom level

        // Notify others that screen sharing has stopped
        socketRef.current?.emit("screen-share-status", {
          room: channel,
          isSharing: false,
          userId,
        })

        toast({
          title: "Screen Sharing Stopped",
          description: "You have stopped sharing your screen.",
        })
      }
    } else {
      // Start screen sharing
      try {
        console.log("Starting screen share")
        toast({
          title: "Starting Screen Share",
          description: "Preparing to share your screen...",
        })

        // Create screen track
        const screenTrack = await AgoraRTC.createScreenVideoTrack(
          {
            encoderConfig: {
              width: 1920,
              height: 1080,
              frameRate: 15,
              bitrateMin: 600,
              bitrateMax: 2000,
            },
          },
          "auto",
        )

        // Log screen track info for debugging
        console.log("Created screen track:", Array.isArray(screenTrack) ? screenTrack[0] : screenTrack)

        // Unpublish camera track first to avoid the multiple video tracks error
        if (localTracks.videoTrack) {
          console.log("Unpublishing camera track before screen share")
          await rtcClient.current?.unpublish([localTracks.videoTrack])
        }

        // Publish screen track
        const trackToPublish = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack

        console.log("Publishing screen track")
        await rtcClient.current?.publish(trackToPublish)
        console.log("Screen track published successfully")

        setLocalTracks((prev) => ({
          ...prev,
          screenTrack: trackToPublish,
        }))

        setIsScreenSharing(true)

        // Play screen share in local ref
        if (localScreenRef.current) {
          trackToPublish.play(localScreenRef.current)
        }

        // Notify others that screen sharing has started
        socketRef.current?.emit("screen-share-status", {
          room: channel,
          isSharing: true,
          userId,
        })

        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared with participants.",
        })

        // Handle screen share stopped by user through browser UI
        trackToPublish.on("track-ended", async () => {
          console.log("Screen share track ended by browser")
          await toggleScreenShare()
        })
      } catch (error) {
        console.error("Error sharing screen:", error)
        setError("Failed to share screen. Please try again.")
        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Failed to share your screen. Please try again.",
        })
      }
    }
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch((err) => {
            setError(`Error attempting to enable fullscreen: ${err.message}`)
          })
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch((err) => {
            setError(`Error attempting to exit fullscreen: ${err.message}`)
          })
      }
    }
  }

  // Function to toggle fullscreen for screen share
  const toggleScreenShareFullscreen = (uid: string) => {
    const screenShareElement = screenShareContainerRef.current

    if (!screenShareElement) return

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (screenShareElement.requestFullscreen) {
        screenShareElement.requestFullscreen().catch((err) => {
          setError(`Error attempting to enable fullscreen: ${err.message}`)
        })
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          setError(`Error attempting to exit fullscreen: ${err.message}`)
        })
      }
    }
  }

  // Function to toggle fullscreen for a participant video
  const toggleVideoFullScreen = (uid: string | null) => {
    if (isVideoFullScreen && fullScreenVideoId === uid) {
      // Exit fullscreen if already in fullscreen for this video
      setIsVideoFullScreen(false)
      setFullScreenVideoId(null)

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error exiting fullscreen: ${err.message}`)
        })
      }
    } else {
      // Enter fullscreen for this video
      setIsVideoFullScreen(true)
      setFullScreenVideoId(uid)

      // Find the video element and make it fullscreen
      const videoElement = uid ? remoteVideoRefs.current[uid]?.parentElement : localVideoRef.current?.parentElement

      if (videoElement && !document.fullscreenElement) {
        videoElement.requestFullscreen().catch((err) => {
          console.error(`Error entering fullscreen: ${err.message}`)
          setIsVideoFullScreen(false)
          setFullScreenVideoId(null)
        })
      }
    }
  }

  const toggleHandRaise = () => {
    // Only allow participants to raise hands, not hosts
    if (userRole === "host") {
      toast({
        title: "Host Notice",
        description: "As a host, you don't need to raise your hand.",
      })
      return
    }

    const newHandRaiseState = !isHandRaised
    setIsHandRaised(newHandRaiseState)

    // Emit hand raise event to other participants
    socketRef.current?.emit("hand-raised", {
      room: channel,
      userId,
      isRaised: newHandRaiseState,
      username,
    })

    if (newHandRaiseState) {
      toast({
        title: "Hand Raised",
        description: "Your hand is raised. The host will see your question.",
      })
    } else {
      toast({
        title: "Hand Lowered",
        description: "Your hand has been lowered.",
      })
    }
  }

  const handleLeave = async () => {
    try {
      // If recording is active, stop it first
      if (isRecording) {
        await stopRecording()
      }

      localTracks.audioTrack?.close()
      localTracks.videoTrack?.close()
      localTracks.screenTrack?.close()
      await rtcClient.current?.leave()

      await axios.delete(`http://localhost:5000/api/rooms/${channel}`)

      onLeave()
    } catch (error) {
      console.error("Error leaving room:", error)
      setError("Error leaving room. Please try again.")
    }
  }

  const toggleSidebar = (tab: "chat" | "participants" | "whiteboard" | "notes" | "recorder") => {
    if (activeTab === tab) {
      setActiveTab(null)
    } else {
      setActiveTab(tab)
    }
  }

  // Function to set remote video ref
  const setRemoteVideoRef = (uid: string, element: HTMLDivElement | null) => {
    remoteVideoRefs.current[uid] = element

    // If we have the element and the user, play the video
    const user = remoteUsers.find((u) => u.uid === uid)
    if (element && user && user.videoTrack) {
      user.videoTrack.play(element)
    }
  }

  // Function to set remote screen share ref
  const setRemoteScreenRef = (uid: string, element: HTMLDivElement | null) => {
    remoteScreenRefs.current[uid] = element

    // If we have the element and the screen share, play it
    const screenShare = remoteScreenShares.find((s) => s.uid === uid)
    if (element && screenShare && screenShare.track) {
      screenShare.track.play(element)
    }
  }

  const startRecording = async () => {
    if (!recordingName.trim()) {
      setError("Please enter a name for the recording")
      return
    }

    try {
      // In a real implementation, this would call a backend API to start cloud recording
      // For now, we'll just simulate it
      setIsRecording(true)
      setRecordingDialog(false)

      // In a real implementation, you would store the recording ID returned from the API
      const mockRecordingResponse = {
        recordingId: `rec-${Date.now()}`,
        status: "recording",
      }

      console.log("Started recording:", mockRecordingResponse)
    } catch (error) {
      console.error("Failed to start recording:", error)
      setError("Failed to start recording. Please try again.")
    }
  }

  const stopRecording = async () => {
    try {
      // In a real implementation, this would call a backend API to stop cloud recording
      // For now, we'll just simulate it
      setIsRecording(false)

      // In a real implementation, you would use the stored recording ID
      const mockStopResponse = {
        status: "stopped",
        recordingUrl: "https://example.com/recordings/123",
      }

      console.log("Stopped recording:", mockStopResponse)
    } catch (error) {
      console.error("Failed to stop recording:", error)
      setError("Failed to stop recording. Please try again.")
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  const getSessionDuration = () => {
    if (!sessionStartTime) return "00:00:00"

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
    return formatRecordingTime(diffInSeconds)
  }

  // Prepare streams for recording
  const getStreamsForRecording = () => {
    const streams: MediaStream[] = []

    // Create a MediaStream from local tracks
    if (localTracks.videoTrack || localTracks.audioTrack) {
      const localStream = new MediaStream()
      if (localTracks.videoTrack) {
        localStream.addTrack(localTracks.videoTrack.getMediaStreamTrack())
      }
      if (localTracks.audioTrack) {
        localStream.addTrack(localTracks.audioTrack.getMediaStreamTrack())
      }
      streams.push(localStream)
    }

    // Add remote streams
    remoteUsers.forEach((user) => {
      const remoteStream = new MediaStream()
      if (user.videoTrack) {
        remoteStream.addTrack(user.videoTrack.getMediaStreamTrack())
      }
      if (user.audioTrack) {
        remoteStream.addTrack(user.audioTrack.getMediaStreamTrack())
      }
      streams.push(remoteStream)
    })

    return streams
  }

  // Function to handle screen share zoom
  const handleZoomChange = (zoomIn: boolean) => {
    setScreenShareZoom((prev) => {
      const newZoom = zoomIn ? prev + 0.1 : prev - 0.1
      // Limit zoom between 0.5 and 2.5
      return Math.max(0.5, Math.min(2.5, newZoom))
    })
  }

  // Function to handle report submission
  const handleReportSubmit = () => {
    if (!reportReason.trim()) {
      toast({
        variant: "destructive",
        title: "Report Error",
        description: "Please provide a reason for your report.",
      })
      return
    }

    // In a real implementation, this would send the report to your backend
    console.log("Submitting report:", {
      channel,
      userId,
      reportCategory,
      reportReason,
    })

    toast({
      title: "Report Submitted",
      description: "Your report has been submitted to the administrators.",
    })

    setShowReportDialog(false)
    setReportReason("")
    setReportCategory("inappropriate")
  }

  // Update the useEffect for remote user handling to better handle screen shares
  useEffect(() => {
    if (!rtcClient.current) return

    // Handle remote users
    const handleUserPublished = async (user, mediaType) => {
      console.log(`Remote user ${user.uid} published ${mediaType} track`)

      await rtcClient.current!.subscribe(user, mediaType)
      console.log(`Subscribed to ${mediaType} track of user ${user.uid}`)

      if (mediaType === "audio") {
        user.audioTrack?.play()
      }

      if (mediaType === "video" && user.videoTrack) {
        // Improved screen share detection
        const trackLabel = user.videoTrack.getMediaStreamTrack().label
        const isScreenShare =
          trackLabel.toLowerCase().includes("screen") ||
          trackLabel.toLowerCase().includes("display") ||
          trackLabel.toLowerCase().includes("tab") ||
          (user._videoTrack && user._videoTrack.trackMediaType === "screen") // Use Agora's internal property

        console.log("Remote track published:", {
          uid: user.uid.toString(),
          trackLabel,
          isScreenShare,
        })

        if (isScreenShare) {
          // Handle screen share track separately
          console.log(`User ${user.uid} is sharing screen`)

          // Add to remote screen shares
          setRemoteScreenShares((prev) => {
            // Check if already exists
            if (prev.some((s) => s.uid === user.uid.toString())) {
              return prev.map((s) =>
                s.uid === user.uid.toString() ? { uid: user.uid.toString(), track: user.videoTrack } : s,
              )
            } else {
              return [...prev, { uid: user.uid.toString(), track: user.videoTrack }]
            }
          })

          // Play the screen share in its ref if available
          const screenRef = remoteScreenRefs.current[user.uid.toString()]
          if (screenRef) {
            user.videoTrack.play(screenRef)
          }

          // Notify about screen share
          toast({
            title: "Screen Share Started",
            description: "A user has started sharing their screen.",
          })
        } else {
          // Update remote users state for camera video
          setRemoteUsers((prev) => {
            // Check if user already exists
            const existingUserIndex = prev.findIndex((p) => p.uid === user.uid.toString())

            if (existingUserIndex >= 0) {
              // Update existing user
              const updatedUsers = [...prev]
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                videoTrack: user.videoTrack!,
                isScreenShare: false,
              }
              return updatedUsers
            } else {
              // Add new user
              return [
                ...prev,
                {
                  uid: user.uid.toString(),
                  videoTrack: user.videoTrack!,
                  audioTrack: user.audioTrack!,
                  isScreenShare: false,
                  username: `User ${user.uid.toString().slice(0, 4)}`,
                  role: "participant",
                  isHandRaised: false,
                },
              ]
            }
          })

          // Play the video track immediately if the ref exists
          const refElement = remoteVideoRefs.current[user.uid.toString()]
          if (refElement) {
            user.videoTrack.play(refElement)
          }
        }
      }
    }

    const handleUserUnpublished = (user, mediaType) => {
      console.log(`Remote user ${user.uid} unpublished ${mediaType} track`)

      if (mediaType === "video") {
        // Check if this was a screen share
        const isScreenShare = remoteScreenShares.some((s) => s.uid === user.uid.toString())

        if (isScreenShare) {
          // Remove from screen shares
          setRemoteScreenShares((prev) => prev.filter((s) => s.uid !== user.uid.toString()))

          // Notify about screen share end
          toast({
            title: "Screen Share Ended",
            description: "Screen sharing has ended.",
          })
        } else {
          // Update state to reflect that the user's video is no longer available
          setRemoteUsers((prev) => {
            const existingUserIndex = prev.findIndex((p) => p.uid === user.uid.toString())

            if (existingUserIndex >= 0 && user.hasAudio) {
              // Keep the user in the list but update their state
              const updatedUsers = [...prev]
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                videoTrack: null,
              }
              return updatedUsers
            } else {
              // Remove the user completely if they have no audio either
              return prev.filter((u) => u.uid !== user.uid.toString())
            }
          })
        }
      }
    }

    // Add event listeners
    rtcClient.current.on("user-published", handleUserPublished)
    rtcClient.current.on("user-unpublished", handleUserUnpublished)

    // Clean up
    return () => {
      if (rtcClient.current) {
        rtcClient.current.off("user-published", handleUserPublished)
        rtcClient.current.off("user-unpublished", handleUserUnpublished)
      }
    }
  }, [])

  // Update the video grid layout to better organize participants and screen shares
  return (
    <div
      ref={containerRef}
      className={cn("h-screen flex flex-col bg-background", isFullScreen && "fixed inset-0 z-50")}
    >
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Session: {channel}</h2>
            <Badge variant={isConnected ? "success" : "destructive"} className="h-6">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="h-6 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white"></span>
                Recording {formatRecordingTime(recordingTime)}
              </Badge>
            )}
            {isHandRaised && (
              <Badge variant="warning" className="h-6 bg-yellow-500">
                Hand Raised
              </Badge>
            )}
            <Badge variant="outline" className="h-6">
              <Clock className="h-3 w-3 mr-1" /> {getSessionDuration()}
            </Badge>
            <Badge variant="secondary" className="h-6">
              {userRole === "host" ? "Host" : "Participant"}
            </Badge>
            {isScreenSharing && (
              <Badge variant="default" className="h-6 bg-green-600">
                Sharing Screen
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userRole === "participant" && (
              <Button variant="outline" size="sm" onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setLayout(layout === "grid" ? "focus" : "grid")}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Layout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="destructive" size="sm" onClick={handleLeave} className="gap-1">
              <PhoneOff className="h-4 w-4" />
              <span>Leave</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-4 h-full">
            {/* Screen shares section - always takes full width and more height when active */}
            <div
              ref={screenShareContainerRef}
              className={cn("col-span-full", remoteScreenShares.length > 0 ? "h-[70vh]" : "h-auto")}
            >
              {/* Local screen share */}
              {isScreenSharing && (
                <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden shadow-md relative">
                  <div ref={localScreenRef} className="w-full h-full" />
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                    Your Screen Share
                  </div>
                </div>
              )}

              {/* Remote screen shares with zoom controls and full screen button */}
              {remoteScreenShares.map((screenShare) => (
                <div
                  key={`screen-${screenShare.uid}`}
                  className="mb-4 aspect-video bg-black rounded-lg overflow-hidden shadow-md relative h-full"
                >
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      transform: `scale(${screenShareZoom})`,
                      transformOrigin: "center",
                      transition: "transform 0.2s ease-out",
                    }}
                  >
                    <div className="w-full h-full" ref={(el) => setRemoteScreenRef(screenShare.uid, el)} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                    Screen Share from Host
                  </div>
                  {userRole === "participant" && (
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => handleZoomChange(true)}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => handleZoomChange(false)}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => setScreenShareZoom(1)}
                      >
                        1:1
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => toggleScreenShareFullscreen(screenShare.uid)}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Video grid layout for participants */}
            <div
              className={cn(
                "grid gap-4",
                layout === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
                isScreenSharing || remoteScreenShares.length > 0 ? "max-h-[30vh] overflow-y-auto" : "h-full",
                isVideoFullScreen && "hidden", // Hide grid when in fullscreen video mode
              )}
            >
              {/* Host video - always show first for participants */}
              {userRole === "participant" && (
                <>
                  {remoteUsers
                    .filter((user) => user.role === "host")
                    .map((user) => (
                      <div
                        key={user.uid}
                        className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md group"
                      >
                        <div className="w-full h-full" ref={(el) => setRemoteVideoRef(user.uid, el)} />
                        {!user.videoTrack && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <CameraOff size={48} className="text-muted-foreground opacity-50" />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                          <span>Host</span>
                          {user.isHandRaised && <Hand size={14} className="text-yellow-500" />}
                          <Badge variant="secondary" className="h-5 text-xs ml-1">
                            Host
                          </Badge>
                        </div>

                        {/* Fullscreen button for participant view */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                          onClick={() => toggleVideoFullScreen(user.uid)}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </>
              )}

              {/* Local video - always visible */}
              {showSelfView && (
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md group">
                  <div ref={localVideoRef} className="w-full h-full" />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <CameraOff size={48} className="text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                    <span>You</span>
                    {micMuted && <MicOff size={14} className="text-destructive" />}
                    {isHandRaised && <Hand size={14} className="text-yellow-500" />}
                    {userRole === "host" && (
                      <Badge variant="secondary" className="h-5 text-xs ml-1">
                        Host
                      </Badge>
                    )}
                  </div>

                  {/* Fullscreen button for self view */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                    onClick={() => toggleVideoFullScreen(null)}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Other participants (excluding host if you're a participant) */}
              {remoteUsers
                .filter((user) => userRole === "host" || (user.role !== "host" && user.uid !== userId))
                .map((user) => (
                  <div
                    key={user.uid}
                    className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md group"
                  >
                    <div className="w-full h-full" ref={(el) => setRemoteVideoRef(user.uid, el)} />
                    {!user.videoTrack && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <CameraOff size={48} className="text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                      <span>{user.role === "host" ? "Host" : `Participant ${user.uid.slice(0, 4)}`}</span>
                      {user.isHandRaised && <Hand size={14} className="text-yellow-500" />}
                      {user.role === "host" && (
                        <Badge variant="secondary" className="h-5 text-xs ml-1">
                          Host
                        </Badge>
                      )}
                    </div>

                    {/* Fullscreen button for participant videos */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                      onClick={() => toggleVideoFullScreen(user.uid)}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

              {remoteUsers.length === 0 && !showSelfView && (
                <div className="col-span-full flex items-center justify-center h-64 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No participants with video enabled</p>
                </div>
              )}
            </div>

            {/* Fullscreen video view */}
            {isVideoFullScreen && (
              <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="relative w-full h-full">
                  {fullScreenVideoId === null ? (
                    // Local video fullscreen
                    <div className="w-full h-full" ref={fullScreenVideoRef}>
                      {localVideoRef.current && (
                        <div className="w-full h-full flex items-center justify-center">
                          {localTracks.videoTrack && videoEnabled ? (
                            <div className="w-full h-full" ref={localVideoRef} />
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <CameraOff size={64} className="text-white opacity-50 mb-4" />
                              <p className="text-white">Your camera is off</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Remote video fullscreen
                    <div className="w-full h-full" ref={fullScreenVideoRef}>
                      {remoteVideoRefs.current[fullScreenVideoId] && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full h-full" ref={(el) => setRemoteVideoRef(fullScreenVideoId, el)} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Exit fullscreen button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 h-10 w-10 bg-background/80 backdrop-blur-sm"
                    onClick={() => toggleVideoFullScreen(fullScreenVideoId)}
                  >
                    <Minimize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with resizable handle for whiteboard */}
        {activeTab && (
          <div
            ref={sidebarRef}
            className={cn(
              "border-l bg-card/50 backdrop-blur-sm relative",
              activeTab === "whiteboard" || activeTab === "notes" ? "transition-all duration-100 ease-in-out" : "w-80",
            )}
            style={activeTab === "whiteboard" || activeTab === "notes" ? { width: `${sidebarWidth}px` } : undefined}
          >
            {(activeTab === "whiteboard" || activeTab === "notes") && (
              <ResizeHandle
                onResize={() => {}}
                onMouseDown={handleResizeStart}
                className="left-0 transform -translate-x-1/2 z-10"
              />
            )}

            <Tabs value={activeTab} className="w-full">
              <TabsList className="w-full">
                {activeTab === "chat" && <TabsTrigger value="chat">Chat</TabsTrigger>}
                {activeTab === "participants" && <TabsTrigger value="participants">Participants</TabsTrigger>}
                {activeTab === "whiteboard" && <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>}
                {activeTab === "notes" && <TabsTrigger value="notes">Notes</TabsTrigger>}
                {activeTab === "recorder" && <TabsTrigger value="recorder">Recorder</TabsTrigger>}
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
                <Chat channel={channel} username={username} userId={userId} />
              </TabsContent>

              <TabsContent value="participants" className="h-[calc(100vh-12rem)]">
                <ParticipantsList
                  channel={channel}
                  userId={userId}
                  userRole={userRole}
                  onPromoteUser={(uid) => {
                    // In a real implementation, this would update the user's role on the server
                    setRemoteUsers((prev) => prev.map((user) => (user.uid === uid ? { ...user, role: "host" } : user)))
                  }}
                />
              </TabsContent>

              <TabsContent value="whiteboard" className="h-[calc(100vh-12rem)]">
                <Whiteboard roomId={channel} userId={userId} userRole={userRole} />
              </TabsContent>

              <TabsContent value="notes" className="h-[calc(100vh-12rem)]">
                <Notes roomId={channel} userId={userId} username={username} />
              </TabsContent>

              <TabsContent value="recorder" className="h-[calc(100vh-12rem)]">
                <div className="p-4">
                  <SessionRecorder
                    localStream={
                      localTracks.videoTrack
                        ? new MediaStream([
                            localTracks.videoTrack.getMediaStreamTrack(),
                            ...(localTracks.audioTrack ? [localTracks.audioTrack.getMediaStreamTrack()] : []),
                          ])
                        : null
                    }
                    remoteStreams={getStreamsForRecording()}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t bg-card/80 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={micMuted ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleMic}
                    className="h-12 w-12 rounded-full"
                  >
                    {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{micMuted ? "Unmute" : "Mute"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={!videoEnabled ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleVideo}
                    className="h-12 w-12 rounded-full"
                  >
                    {!videoEnabled ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{videoEnabled ? "Turn off camera" : "Turn on camera"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8 mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="icon"
                    onClick={toggleScreenShare}
                    className="h-10 w-10"
                  >
                    <ScreenShare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Hand raise button - only for participants */}
            {userRole === "participant" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isHandRaised ? "default" : "outline"}
                      size="icon"
                      onClick={toggleHandRaise}
                      className="h-10 w-10"
                    >
                      {isHandRaised ? <HandOff className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isHandRaised ? "Lower hand" : "Raise hand"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isFullScreen ? "default" : "outline"}
                    size="icon"
                    onClick={toggleFullScreen}
                    className="h-10 w-10"
                  >
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8 mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "chat" ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar("chat")}
                    className="h-10 w-10"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === "chat" ? "Hide chat" : "Show chat"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "participants" ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar("participants")}
                    className="h-10 w-10"
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === "participants" ? "Hide participants" : "Show participants"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "whiteboard" ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar("whiteboard")}
                    className="h-10 w-10"
                  >
                    <PenLine className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === "whiteboard" ? "Hide whiteboard" : "Show whiteboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "notes" ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar("notes")}
                    className="h-10 w-10"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === "notes" ? "Hide notes" : "Show notes"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === "recorder" ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar("recorder")}
                    className="h-10 w-10"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === "recorder" ? "Hide recorder" : "Show recorder"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Report inappropriate behavior or technical issues to the administrators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-category">Issue Category</Label>
              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">Inappropriate Behavior</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="quality">Poor Quality</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-reason">Description</Label>
              <Textarea
                id="report-reason"
                placeholder="Please describe the issue in detail"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReportSubmit} disabled={!reportReason.trim()}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideoChat
