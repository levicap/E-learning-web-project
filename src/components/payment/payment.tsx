"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, CheckCircle2, ArrowRight, BookOpen, Timer, Users, MapPin, Info } from "lucide-react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useLocation } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

function Payment() {
  const { state } = useLocation()
  // Check if state contains a course or a session
  const course = state?.course
  const session = state?.session
  const navigate = useNavigate()

  // Determine the payment amount based on whether a course or session is being purchased
  const amount = course ? Math.round(course.price * 100) : session ? Math.round(session.price * 100) : 49900 // default fallback amount

  const [paymentStep, setPaymentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [cardName, setCardName] = useState("")
  const controls = useAnimation()
  const { toast } = useToast()

  const stripe = useStripe()
  const elements = useElements()
  const { user } = useUser()

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    })
  }, [controls])

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Stripe not loaded",
        description: "Please wait until Stripe.js loads.",
        variant: "destructive",
      })
      return
    }
    setIsProcessing(true)
    console.log("Starting payment process...")
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your payment...",
    })

    try {
      // Create Payment Intent on your server with the dynamic amount
      const response = await fetch("http://localhost:5000/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      console.log("Payment Intent response:", data)
      if (!response.ok) {
        throw new Error(data.error || "Payment intent creation failed")
      }
      const clientSecret = data.clientSecret
      console.log("Client Secret received:", clientSecret)

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Confirm the card payment using the client secret
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardName || "John Doe" },
        },
      })
      console.log("Stripe confirmCardPayment result:", result)

      // Check if payment was successful
      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        })
        setIsProcessing(false)
      } else if (result.paymentIntent?.status === "succeeded") {
        console.log("Payment was successful:", result.paymentIntent)

        // Retrieve Clerk user id from the Clerk hook
        if (!user || !user.id) {
          toast({
            title: "Authentication Error",
            description: "User not authenticated. Please log in again.",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }
        console.log("Clerk User ID:", user.id)

        // Determine the enrollment endpoint and payload based on purchase type
        const enrollmentEndpoint = course
          ? "http://localhost:5000/api/students/courses"
          : "http://localhost:5000/api/students/sessions"
        const payload = course ? { courseId: course._id } : { sessionId: session._id }

        // Enroll the student by calling your enrollment endpoint with the Clerk user id in header
        try {
          const enrollResponse = await fetch(enrollmentEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-clerk-user-id": user.id,
            },
            body: JSON.stringify(payload),
          })
          const enrollData = await enrollResponse.json()
          console.log("Enrollment response:", enrollData)
          if (!enrollResponse.ok) {
            throw new Error(enrollData.error || "Enrollment failed")
          }
        } catch (enrollError) {
          console.error("Error during enrollment:", enrollError)
          // Optionally, you may display a warning toast while proceeding.
        }

        setPaymentStep(3)
        setIsProcessing(false)
        setShowConfetti(true)
        toast({
          title: "Payment Successful! 🎉",
          description: course
            ? "Welcome to the course! Your journey begins now."
            : "You have been enrolled in the session.",
        })
      }
    } catch (error) {
      console.error("Error during payment process:", error)
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Steps labels for the progress indicator
  const steps = {
    1: "Payment Details",
    2: "Review Your Order",
    3: "Success",
  }

  // Keep the CardElement mounted even when not visible
  const persistentCardStyle =
    paymentStep === 1 ? {} : { opacity: 0, pointerEvents: "none", height: 0, overflow: "hidden" }

  return (
    <div className="mt-20 min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50 to-white p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold mb-2 gradient-text">Transform Your Career</h1>
          <p className="text-muted-foreground">Join thousands of successful developers who started here</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            {Object.entries(steps).map(([step, label]) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                    Number(step) <= paymentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                  } ${Number(step) === paymentStep ? "pulse-ring" : ""}`}
                  animate={{
                    scale: Number(step) === paymentStep ? 1.1 : 1,
                    transition: { duration: 0.2 },
                  }}
                >
                  {Number(step) < paymentStep ? <CheckCircle2 className="w-5 h-5" /> : step}
                </motion.div>
                {step !== "3" && (
                  <div className="w-20 h-[2px] mx-2 bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: Number(step) < paymentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground">{steps[paymentStep]}</p>
        </div>

        {/* Payment Section – always mounted so CardElement remains available */}
        <div style={persistentCardStyle}>
          <Card className="hover-card-effect mb-8">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Complete your payment using Card, Cheque, D17, Ba9chich, Flouci, or mobile payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Updated TabsList: Card, Cheque, D17 */}
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                  <TabsTrigger value="card">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="cheque">
                    <MapPin className="w-4 h-4 mr-2" />
                    Cheque
                  </TabsTrigger>
                  <TabsTrigger value="d17">
                    <Info className="w-4 h-4 mr-2" />
                    D17
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ba9chich">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Ba9chich
                  </TabsTrigger>
                  <TabsTrigger value="flouci">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Flouci
                  </TabsTrigger>
                  <TabsTrigger value="telecom">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Telecom
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name on Card</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="transition-all focus:scale-[1.02]"
                      />
                    </div>
                    <div className="border p-2 rounded">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#424770",
                              "::placeholder": { color: "#aab7c4" },
                            },
                            invalid: { color: "#9e2146" },
                          },
                        }}
                      />
                    </div>
                  </motion.div>
                </TabsContent>
                <TabsContent value="cheque">
                  <motion.div
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-red-600" />
                    <p className="text-muted-foreground mb-2">Please meet at our payment center to pay by cheque</p>
                    <p className="text-sm font-medium">Location: 123 Payment Street, Finance City, XY 12345</p>
                  </motion.div>
                </TabsContent>
                <TabsContent value="d17">
                  <motion.div
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Info className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground mb-2">Please transfer your payment using D17</p>
                    <p className="text-sm font-medium">D17 Number: 123-456-7890</p>
                  </motion.div>
                </TabsContent>
                <TabsContent value="ba9chich">
                  <motion.div
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-muted-foreground mb-2">Pay using Ba9chich digital wallet</p>
                    <p className="text-sm font-medium">Ba9chich ID: 123-456-7890</p>
                    <Badge variant="outline" className="mt-4">
                      Coming Soon
                    </Badge>
                  </motion.div>
                </TabsContent>
                <TabsContent value="flouci">
                  <motion.div
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <p className="text-muted-foreground mb-2">Pay using Flouci digital payment</p>
                    <p className="text-sm font-medium">Scan the QR code or enter our merchant ID</p>
                    <Badge variant="outline" className="mt-4">
                      Coming Soon
                    </Badge>
                  </motion.div>
                </TabsContent>
                <TabsContent value="telecom">
                  <motion.div
                    className="p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-2">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-medium">Orange</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-2">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-medium">Ooredoo</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">Pay using your telecom provider</p>
                    <p className="text-sm font-medium">Send payment to: *123*1234#</p>
                    <Badge variant="outline" className="mt-4">
                      Coming Soon
                    </Badge>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full" size="lg" onClick={() => setPaymentStep(2)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Continue to Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </div>

        {/* Steps Content */}
        <AnimatePresence mode="wait">
          {paymentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Course or Session Summary */}
              <Card className="h-full hover-card-effect">
                <CardHeader>
                  <Badge variant="secondary" className="mb-2 animate-pulse">
                    FEATURED {course ? "COURSE" : "SESSION"}
                  </Badge>
                  <CardTitle>{course ? course.title : session.title}</CardTitle>
                  <CardDescription>
                    {course ? "Master modern web development from scratch" : "Join our interactive learning session"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden mb-6 relative group">
                    <motion.div
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      whileHover={{ opacity: 1 }}
                    >
                      <BookOpen className="w-12 h-12 text-white" />
                    </motion.div>
                    <img
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="glass-effect">
                        <Timer className="w-4 h-4 mr-1" />
                        50+ Hours
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div className="bg-muted/50 p-4 rounded-lg hover-card-effect" whileHover={{ scale: 1.05 }}>
                      <Users className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-medium">5,000+</p>
                      <p className="text-sm text-muted-foreground">Students Enrolled</p>
                    </motion.div>
                    <motion.div className="bg-muted/50 p-4 rounded-lg hover-card-effect" whileHover={{ scale: 1.05 }}>
                      <Timer className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-medium">50+ Hours</p>
                      <p className="text-sm text-muted-foreground">Content</p>
                    </motion.div>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                      <motion.div className="flex items-start gap-2" whileHover={{ x: 5 }}>
                        <Timer className="w-4 h-4 mt-1 text-green-500" />
                        <div>
                          <p className="font-medium">30-Day Money-Back Guarantee</p>
                          <p className="text-sm text-muted-foreground">Risk-free learning experience</p>
                        </div>
                      </motion.div>
                      <Separator />
                      <motion.div className="flex items-start gap-2" whileHover={{ x: 5 }}>
                        <Timer className="w-4 h-4 mt-1 text-blue-500" />
                        <div>
                          <p className="font-medium">Lifetime Access</p>
                          <p className="text-sm text-muted-foreground">Including all future updates</p>
                        </div>
                      </motion.div>
                      <Separator />
                      <motion.div className="flex items-start gap-2" whileHover={{ x: 5 }}>
                        <BookOpen className="w-4 h-4 mt-1 text-purple-500" />
                        <div>
                          <p className="font-medium">Exclusive Bonuses</p>
                          <p className="text-sm text-muted-foreground">
                            • Premium Discord Community Access • Resume Builder Tool • Project Templates
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <div className="flex items-center gap-2">
                      <motion.p className="text-2xl font-bold" initial={{ scale: 1 }} whileHover={{ scale: 1.1 }}>
                        ${course ? course.price.toFixed(2) : session.price.toFixed(2)}
                      </motion.p>
                      <Badge variant="secondary" className="uppercase animate-pulse">
                        Save 50%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Original Price</p>
                    <p className="text-lg line-through text-muted-foreground">$999.00</p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {paymentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-lg mx-auto"
            >
              <Card className="hover-card-effect">
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                  <CardDescription>Please confirm your purchase details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    className="bg-muted/50 p-4 rounded-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-medium mb-2">{course ? course.title : session.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course ? "Professional Plan - One-time Payment" : "Session Enrollment - One-time Payment"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Amount</span>
                      <motion.span className="font-medium" initial={{ scale: 1 }} whileHover={{ scale: 1.1 }}>
                        ${course ? course.price.toFixed(2) : session.price.toFixed(2)}
                      </motion.span>
                    </div>
                  </motion.div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      By clicking "Complete Payment", you agree to our Terms of Service and Privacy Policy.
                    </AlertDescription>
                  </Alert>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full animate-shimmer" />
                      <p className="text-sm text-center text-muted-foreground">Processing your payment...</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPaymentStep(1)}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Complete Payment"}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {paymentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <Card className="hover-card-effect">
                <CardHeader>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                  >
                    <motion.div
                      className="absolute inset-0 bg-green-100 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardTitle className="text-2xl gradient-text">Payment Successful!</CardTitle>
                    <CardDescription>
                      {course ? "Your course access has been activated" : "You are now enrolled in the session"}
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.p
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You will receive a confirmation email shortly with your access details.
                  </motion.p>
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div className="bg-muted/50 p-4 rounded-lg hover-card-effect" whileHover={{ scale: 1.05 }}>
                      <BookOpen className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-medium">Start Learning</p>
                      <p className="text-sm text-muted-foreground">
                        {course ? "Access your course now" : "View session details"}
                      </p>
                    </motion.div>
                    <motion.div className="bg-muted/50 p-4 rounded-lg hover-card-effect" whileHover={{ scale: 1.05 }}>
                      <Users className="w-5 h-5 mb-2 text-primary" />
                      <p className="font-medium">Join Community</p>
                      <p className="text-sm text-muted-foreground">Connect with peers</p>
                    </motion.div>
                  </motion.div>
                  {/* Confetti animation */}
                  {showConfetti && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {[...Array(50)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-primary rounded-full"
                          initial={{ x: "50%", y: "50%", scale: 0 }}
                          animate={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            scale: [0, 1, 0],
                            opacity: [1, 1, 0],
                          }}
                          transition={{ duration: 2, delay: i * 0.02, ease: "easeOut" }}
                        />
                      ))}
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter>
                  <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" size="lg" onClick={() => navigate("/student-dashboard")}>
                      Go to Dashboard
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Payment
