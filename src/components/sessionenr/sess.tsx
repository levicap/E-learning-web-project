"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Timer,
  DollarSign,
  Sparkles,
  GraduationCap,
  BookOpen,
  Star,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Building2,
} from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useUser } from "@clerk/clerk-react"
import { useToast } from "@/hooks/use-toast"

function SesEnrollment() {
  // Access the passed session data from navigation
  const location = useLocation()
  const sessionData = location.state?.session || {
    title: "Default Session Title",
    description: "Default session description.",
    type: "online",
    date: new Date(),
    time: "00:00",
    duration: 0,
    maxStudents: 0,
    price: 0,
    tutor: { _id: "", name: "Default Tutor" },
  }

  // Set the default selected date using the session data.
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(sessionData.date))
  const navigate = useNavigate()
  const { user } = useUser()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Function to handle direct enrollment for free sessions
  const handleDirectEnrollment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to enroll in this session.",
        variant: "destructive",
      })
      return
    }

    setIsEnrolling(true)
    try {
      const response = await fetch("http://localhost:5000/api/students/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user.id,
        },
        body: JSON.stringify({ sessionId: sessionData._id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Enrollment Successful",
          description: "You have been enrolled in this session.",
          variant: "default",
        })
        // You could navigate to a success page or dashboard here
      } else {
        toast({
          title: "Enrollment Failed",
          description: data.message || "Failed to enroll in this session.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error enrolling in session:", error)
      toast({
        title: "Enrollment Failed",
        description: "An error occurred while enrolling in this session.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  // Update handleEnroll to check if session is free
  const handleEnroll = () => {
    if (sessionData.price === 0) {
      handleDirectEnrollment()
    } else {
      console.log("Proceeding to payment with session:", sessionData)
      navigate("/payment", { state: { session: sessionData } })
    }
  }

  return (
    <div className="mt-20 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="card-hover-effect backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2 slide-in">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse-slow" />
                  <CardTitle className="text-4xl font-bold gradient-text">{sessionData.title}</CardTitle>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="secondary" className="text-lg cursor-pointer">
                      {sessionData.type === "online" ? (
                        <Globe2 className="w-4 h-4 mr-1 inline animate-float" />
                      ) : (
                        <Building2 className="w-4 h-4 mr-1 inline" />
                      )}
                      {sessionData.type === "online" ? "Online Session" : "In-person Session"}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    {sessionData.type === "online"
                      ? "Join from anywhere in the world! Virtual classroom link will be provided upon enrollment."
                      : "Physical classroom session with hands-on learning experience."}
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className="flex flex-col items-end slide-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Expert Instructor</span>
                </div>
                <span className="font-semibold text-lg">{sessionData.tutor.name}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Session Details
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 slide-in">
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <p className="text-muted-foreground leading-relaxed">{sessionData.description}</p>
                </ScrollArea>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 transition-all hover:bg-secondary/70">
                    <Users className="w-5 h-5 text-primary animate-float" />
                    <div>
                      <p className="font-medium">Max Students</p>
                      <p className="text-sm text-muted-foreground">{sessionData.maxStudents} spots</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 transition-all hover:bg-secondary/70">
                    <Timer className="w-5 h-5 text-primary animate-float" style={{ animationDelay: "0.2s" }} />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{sessionData.duration} minutes</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="slide-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md"
                      defaultMonth={new Date(sessionData.date)}
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 transition-all hover:bg-secondary/70">
                      <Clock className="w-5 h-5 text-primary animate-float" />
                      <div>
                        <p className="font-medium">Start Time</p>
                        <p className="text-sm text-muted-foreground">{sessionData.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50 transition-all hover:bg-secondary/70">
                      <MapPin className="w-5 h-5 text-primary animate-float" style={{ animationDelay: "0.3s" }} />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {sessionData.type === "online" ? "Virtual Classroom" : "Campus Center"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <Separator className="my-4" />

          <CardFooter className="flex justify-between items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <DollarSign className="w-6 h-6 text-primary absolute animate-pulse-slow" />
                <Star className="w-6 h-6 text-yellow-400/50 icon-spin" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold gradient-text">
                  {sessionData.price === 0 ? "Free" : `$${sessionData.price.toFixed(2)}`}
                </span>
                <span className="text-sm text-muted-foreground">One-time payment</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 hover:scale-105"
                  disabled={isEnrolling}
                >
                  <span className="flex items-center gap-2">
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    {!isEnrolling && <ArrowRight className="w-5 h-5 animate-float" />}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Confirm Enrollment
                  </DialogTitle>
                  <DialogDescription>
                    <div className="mt-4 space-y-4">
                      <div className="p-4 rounded-lg bg-secondary/30">
                        <p className="font-medium text-lg mb-2">"{sessionData.title}"</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span>{format(new Date(sessionData.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{sessionData.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span>{sessionData.price === 0 ? "Free" : `$${sessionData.price.toFixed(2)}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    onClick={handleEnroll}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                    disabled={isEnrolling}
                  >
                    <span className="flex items-center gap-2">
                      {sessionData.price === 0 ? "Enroll Now" : "Proceed to Payment"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default SesEnrollment
