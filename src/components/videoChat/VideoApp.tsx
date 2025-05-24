"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import VideoChat from "./VideoChat"
import { useUser } from "@clerk/clerk-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, Users, FileText, Presentation, Calendar, User, X, AlertCircle, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Add this interface outside the VoiceChatApp component
interface SessionInfo {
  _id: string
  title: string
  time: string
  maxStudents: number
  enrolledStudents: {
    _id: string
    name: string
    clerkId: string
  }[]
  enrolledCount: number
  availableSpots: number
}

interface BanNotificationProps {
  roomName: string
  onClose: () => void
}

export function BanNotification({ roomName, onClose }: BanNotificationProps) {
  const clearBan = () => {
    localStorage.removeItem(`kicked_from_${roomName}`)
    onClose()
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>You cannot join the session "{roomName}". You have been banned by the host.</p>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearBan}>
            I understand
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface RoomFullNotificationProps {
  roomName: string
  onClose: () => void
}

export function RoomFullNotification({ roomName, onClose }: RoomFullNotificationProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Room Full</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>The session "{roomName}" has reached its maximum capacity and cannot accept more participants.</p>
        <p className="text-sm">Please try again later or contact the host for assistance.</p>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            I understand
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

function VoiceChatApp() {
  const { user, isLoaded } = useUser()
  const [inRoom, setInRoom] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [persistedState, setPersistedState] = useState<{ inRoom: boolean; roomName: string } | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [showBanNotification, setShowBanNotification] = useState(false)
  const [showRoomFullNotification, setShowRoomFullNotification] = useState(false)
  const [participantLimit, setParticipantLimit] = useState<number>(0)
  const [roomData, setRoomData] = useState<any>(null)
  const clerkId = user?.id

  // Add these state variables inside the VoiceChatApp component after the existing state declarations
  const [todaySessions, setTodaySessions] = useState<SessionInfo[]>([])
  const [showSessionsModal, setShowSessionsModal] = useState(false)

  // New state for room details dialog
  const [showRoomDetailsDialog, setShowRoomDetailsDialog] = useState(false)
  const [roomDetailsInput, setRoomDetailsInput] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState("")
  const [isSubmittingRoomDetails, setIsSubmittingRoomDetails] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkId) return
      try {
        const response = await fetch(`http://localhost:5000/api/users/${clerkId}`)
        const data = await response.json()
        setUserData(data)
      } catch (error) {
        console.error("Error fetching user details:", error)
      }
    }
    fetchUser()
  }, [clerkId])

  // Load persisted state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("voiceChatState")
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      setPersistedState(parsedState)
    }
  }, [])

  // Apply persisted state once user is loaded
  useEffect(() => {
    if (isLoaded && user && persistedState) {
      // Check if the user was banned from the persisted room
      if (checkIfKicked(persistedState.roomName)) {
        // Don't restore the session if they were banned
        localStorage.removeItem("voiceChatState")
      } else {
        setInRoom(persistedState.inRoom)
        setRoomName(persistedState.roomName)
      }
    }
  }, [isLoaded, user, persistedState])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem("voiceChatState", JSON.stringify({ inRoom, roomName }))
    }
  }, [inRoom, roomName, isLoaded, user])

  // Add this useEffect after the existing useEffects
  useEffect(() => {
    if (isLoaded && user && userData?.role === "teacher") {
      fetchTodaySessions()
      console.log("Teacher detected, fetching sessions")
    }
  }, [isLoaded, user, userData?.role])

  const fetchTodaySessions = async () => {
    if (!user?.id) return

    try {
      console.log("Fetching today's sessions for user ID:", user.id)
      const response = await fetch("http://localhost:5000/api/sessions/today-sessions", {
        headers: {
          "x-clerk-user-id": user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Today's sessions data:", data)
        setTodaySessions(data)
      } else {
        console.error("Failed to fetch today's sessions, status:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching today's sessions:", error)
    }
  }

  // Add this function to check if user was kicked before joining
  const checkIfKicked = useCallback((roomName: string) => {
    return localStorage.getItem(`kicked_from_${roomName}`) === "true"
  }, [])

  // Modify the handleJoinRoom function
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (roomName && user) {
      // Check if user was kicked from this room
      if (checkIfKicked(roomName)) {
        // Show ban notification
        setShowBanNotification(true)
        return
      }

      try {
        console.log(`Attempting to join room: ${roomName}`)

        // First check if room exists
        const checkRoomResponse = await fetch(`http://localhost:5000/api/rooms/${roomName}`)
        console.log(`Room check status: ${checkRoomResponse.status}`)

        // If room doesn't exist, create it
        if (checkRoomResponse.status === 404) {
          console.log("Room doesn't exist, creating it")

          // If user is a teacher, they can set a participant limit when creating the room
          const participantLimitValue = userData?.role === "teacher" ? participantLimit : 0

          const createResponse = await fetch("http://localhost:5000/api/rooms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: roomName,
              type: "live-session",
              participantLimit: participantLimitValue,
            }),
          })

          if (!createResponse.ok) {
            throw new Error("Failed to create room")
          }

          const roomData = await createResponse.json()
          setRoomData(roomData)
          console.log("Room created successfully with participant limit:", participantLimitValue)
        } else {
          // Room exists, get its data
          const roomData = await checkRoomResponse.json()
          setRoomData(roomData)
        }

        // Now join the room
        console.log("Joining room")
        const joinResponse = await fetch(`http://localhost:5000/api/rooms/${roomName}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            name: user.fullName || user.username,
            clerkId: user.id,
            // Explicitly set role based on user data
            role: userData?.role === "teacher" ? "host" : "participant",
          }),
        })

        console.log(`Join response status: ${joinResponse.status}`)

        // Check if join was successful
        if (!joinResponse.ok) {
          const errorData = await joinResponse.json()
          console.error("Join room error:", errorData)

          if (errorData.isKicked || errorData.isBanned) {
            localStorage.setItem(`kicked_from_${roomName}`, "true")
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: errorData.error || "You cannot join this session. You have been banned by the host.",
            })
            return
          }

          if (errorData.isFull) {
            setShowRoomFullNotification(true)
            return
          }

          throw new Error(errorData.error || "Failed to join room")
        }

        console.log("Successfully joined room, setting inRoom to true")
        setInRoom(true)
      } catch (error: any) {
        console.error("Error joining room:", error)

        // Check if the error message indicates a ban
        if (
          (error.message && (error.message.includes("banned") || error.message.includes("removed"))) ||
          (error.response && error.response.data && error.response.data.isBanned)
        ) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You cannot join this session. You have been banned by the host.",
          })
          // Store banned status in localStorage to prevent future join attempts
          localStorage.setItem(`kicked_from_${roomName}`, "true")
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to join room",
          })
        }
      }
    }
  }

  const handleLeaveRoom = () => {
    setInRoom(false)
    setRoomName("")
    localStorage.removeItem("voiceChatState")
  }

  const handleRoomSettingsUpdated = (settings: any) => {
    if (settings.participantLimit !== undefined) {
      setParticipantLimit(settings.participantLimit)
    }
  }

  // Modified: open dialog instead of using window.prompt
  const openRoomDetailsDialog = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setRoomDetailsInput("")
    setShowRoomDetailsDialog(true)
  }

  // New: handle room details submission
  const handleRoomDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomDetailsInput.trim() || !currentSessionId) return

    setIsSubmittingRoomDetails(true)

    try {
      const resp = await fetch("http://localhost:5000/api/sessions/send-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomDetailsInput, sessionId: currentSessionId }),
      })

      if (resp.ok) {
        toast({ title: "Room details sent", description: `Reminders sent for room "${roomDetailsInput}".` })
        setShowRoomDetailsDialog(false)
      } else {
        const err = await resp.json()
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to send reminders." })
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsSubmittingRoomDetails(false)
    }
  }

  // Sessions Modal component
  const SessionsModal = () => {
    if (!showSessionsModal) return null

    return (
      <div className=" fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Sessions</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSessionsModal(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sessions scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySessions.map((session) => (
                  <div key={session._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{session.title}</h3>
                      <Badge variant="outline">{session.time}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Users className="h-4 w-4" />
                      <span>
                        {session.enrolledCount}/{session.maxStudents} students enrolled
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-2">Enrolled Students:</h4>
                      {session.enrolledStudents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {session.enrolledStudents.map((student) => (
                            <div key={student._id} className="flex items-center gap-2 bg-muted/30 p-2 rounded">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm truncate">{student.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button size="sm" onClick={() => openRoomDetailsDialog(session._id)}>
                        Send Room Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => setShowSessionsModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 min-h-screen bg-background">
      {!inRoom ? (
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto">
            {showBanNotification && (
              <BanNotification roomName={roomName} onClose={() => setShowBanNotification(false)} />
            )}

            {showRoomFullNotification && (
              <RoomFullNotification roomName={roomName} onClose={() => setShowRoomFullNotification(false)} />
            )}

            {/* Add a button to view today's sessions for teachers */}
            {userData?.role === "teacher" && (
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    fetchTodaySessions()
                    setShowSessionsModal(true)
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Today's Sessions
                </Button>
              </div>
            )}

            <Card className="border-none shadow-md">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  {userData?.role === "teacher" ? "Create Live Session" : "Join Live Session"}
                </CardTitle>
                <CardDescription className="text-center">
                  {userData?.role === "teacher"
                    ? "Create and host a live session for your students"
                    : "Connect with instructors and peers in real-time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Name</Label>
                    <Input
                      id="room"
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter a room name"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Show participant limit input only for teachers (hosts) */}
                  {userData?.role === "teacher" && (
                    <div className="space-y-2">
                      <Label htmlFor="participantLimit">Participant Limit (Optional)</Label>
                      <Input
                        id="participantLimit"
                        type="number"
                        min="0"
                        value={participantLimit}
                        onChange={(e) => setParticipantLimit(Number.parseInt(e.target.value) || 0)}
                        placeholder="Maximum participants (0 for no limit)"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set the maximum number of participants allowed in this session (excluding hosts). Enter 0 for no
                        limit.
                      </p>
                    </div>
                  )}

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={
                            user?.imageUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || user?.username}`
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{user?.fullName || user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                        {userData && (
                          <p className="text-xs font-medium text-primary">
                            {userData.role === "teacher" ? "Teacher (Host)" : "Student (Participant)"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" onClick={handleJoinRoom}>
                  {userData?.role === "teacher" ? "Create Session" : "Join Session"}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-8 space-y-4">
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Interactive Learning</h3>
                      <p className="text-sm text-muted-foreground">
                        Join live sessions with instructors and peers for interactive learning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Presentation className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Screen Sharing</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your screen to present slides, demos, or code examples.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Collaborative Whiteboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the whiteboard to explain concepts and collaborate in real-time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <VideoChat
          channel={roomName}
          onLeave={handleLeaveRoom}
          username={user?.fullName || user?.username || "Anonymous"}
          userId={user?.id || ""}
          userRole={userData?.role || "student"}
          roomId={roomData?._id || ""}
          hostClerkId={roomData?.participants.find((p) => p.role === "host")?.clerkId || ""}
          hostName={roomData?.participants.find((p) => p.role === "host")?.name || "Host"}
          participantLimit={roomData?.participantLimit || 0}
          onSettingsUpdated={handleRoomSettingsUpdated}
          onViewSessions={() => {
            fetchTodaySessions()
            setShowSessionsModal(true)
          }}
        />
      )}

      {/* Room Details Dialog */}
      <Dialog open={showRoomDetailsDialog} onOpenChange={setShowRoomDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Room Details</DialogTitle>
            <DialogDescription>Enter the room name to send to enrolled students for this session.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRoomDetailsSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomDetails">Room Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="roomDetails"
                  value={roomDetailsInput}
                  onChange={(e) => setRoomDetailsInput(e.target.value)}
                  placeholder="Enter room name"
                  className="flex-1"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Students will receive a notification with this room name to join the session.
              </p>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRoomDetailsDialog(false)}
                disabled={isSubmittingRoomDetails}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingRoomDetails || !roomDetailsInput.trim()} className="gap-2">
                {isSubmittingRoomDetails && (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                <Send className="h-4 w-4 mr-1" />
                Send Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {userData?.role === "teacher" && <SessionsModal />}
    </div>
  )
}

export default function VideoApp() {
  return <VoiceChatApp />
}
