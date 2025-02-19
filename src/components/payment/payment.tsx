import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  GoalIcon as PaypalIcon, 
  AppleIcon, 
  CirclePlayIcon as GooglePayIcon, 
  Lock, 
  Shield, 
  Clock, 
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Timer,
  Star,
  Zap,
  Award,
  Heart,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

function Payment() {
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const controls = useAnimation();
  const { toast } = useToast();

  useEffect(() => {
    // Animate elements on mount
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    });
  }, [controls]);

  const handlePayment = async () => {
    setIsProcessing(true);
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your payment...",
    });

    // Simulate payment processing
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(i);
    }

    setTimeout(() => {
      setPaymentStep(3);
      setIsProcessing(false);
      setShowConfetti(true);
      toast({
        title: "Payment Successful! 🎉",
        description: "Welcome to the course! Your journey begins now.",
      });
    }, 3000);
  };

  const steps = {
    1: "Payment Details",
    2: "Confirmation",
    3: "Success"
  };

  const features = [
    { icon: Star, title: "4.9/5 Rating", description: "From 1000+ reviews" },
    { icon: Zap, title: "Instant Access", description: "Start learning today" },
    { icon: Award, title: "Certificate", description: "Upon completion" },
    { icon: Heart, title: "Mentorship", description: "1-on-1 guidance" },
    { icon: TrendingUp, title: "Job Ready", description: "Industry aligned" },
    { icon: MessageCircle, title: "Community", description: "Active support" }
  ];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50 to-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
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
                    Number(step) <= paymentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  } ${Number(step) === paymentStep ? 'pulse-ring' : ''}`}
                  animate={{
                    scale: Number(step) === paymentStep ? 1.1 : 1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {Number(step) < paymentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </motion.div>
                {step !== "3" && (
                  <div className="w-20 h-[2px] mx-2 bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{
                        width: Number(step) < paymentStep ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground">{steps[paymentStep as keyof typeof steps]}</p>
        </div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-effect p-4 rounded-lg hover-card-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <feature.icon className="w-6 h-6 text-primary mb-2 animate-float" />
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {paymentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Course Summary */}
              <Card className="h-full hover-card-effect">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="mb-2 animate-pulse">FEATURED COURSE</Badge>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                  </div>
                  <CardTitle>Complete Web Development Bootcamp 2025</CardTitle>
                  <CardDescription>Master modern web development from scratch</CardDescription>
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
                      alt="Course Preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Badge variant="secondary" className="glass-effect">
                        <Clock className="w-4 h-4 mr-1" />
                        50+ Hours
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div 
                      className="bg-muted/50 p-4 rounded-lg hover-card-effect"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Users className="w-5 h-5 mb-2 text-primary animate-float" />
                      <p className="font-medium">5,000+</p>
                      <p className="text-sm text-muted-foreground">Students Enrolled</p>
                    </motion.div>
                    <motion.div 
                      className="bg-muted/50 p-4 rounded-lg hover-card-effect"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Timer className="w-5 h-5 mb-2 text-primary animate-float" />
                      <p className="font-medium">50+ Hours</p>
                      <p className="text-sm text-muted-foreground">Course Content</p>
                    </motion.div>
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-start gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <Shield className="w-4 h-4 mt-1 text-green-500" />
                        <div>
                          <p className="font-medium">30-Day Money-Back Guarantee</p>
                          <p className="text-sm text-muted-foreground">Risk-free learning experience</p>
                        </div>
                      </motion.div>
                      <Separator />
                      <motion.div 
                        className="flex items-start gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <Clock className="w-4 h-4 mt-1 text-blue-500" />
                        <div>
                          <p className="font-medium">Lifetime Access</p>
                          <p className="text-sm text-muted-foreground">Including all future updates</p>
                        </div>
                      </motion.div>
                      <Separator />
                      <motion.div 
                        className="flex items-start gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <Gift className="w-4 h-4 mt-1 text-purple-500" />
                        <div>
                          <p className="font-medium">Exclusive Bonuses</p>
                          <p className="text-sm text-muted-foreground">
                            • Premium Discord Community Access
                            • Resume Builder Tool
                            • Project Templates
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
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        $499.00
                      </motion.p>
                      <Badge variant="secondary" className="uppercase animate-pulse">Save 50%</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Original Price</p>
                    <p className="text-lg line-through text-muted-foreground">$999.00</p>
                  </div>
                </CardFooter>
              </Card>

              {/* Payment Section */}
              <Card className="hover-card-effect">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose your preferred payment option</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="card" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="card">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="paypal">
                        <PaypalIcon className="w-4 h-4 mr-2" />
                        PayPal
                      </TabsTrigger>
                      <TabsTrigger value="apple">
                        <AppleIcon className="w-4 h-4 mr-2" />
                        Apple
                      </TabsTrigger>
                      <TabsTrigger value="google">
                        <GooglePayIcon className="w-4 h-4 mr-2" />
                        Google
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="card">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 mt-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input 
                            id="card-number" 
                            placeholder="1234 5678 9012 3456"
                            className="transition-all focus:scale-[1.02]" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input 
                              id="expiry" 
                              placeholder="MM/YY"
                              className="transition-all focus:scale-[1.02]" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input 
                              id="cvc" 
                              placeholder="123"
                              className="transition-all focus:scale-[1.02]" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name on Card</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe"
                            className="transition-all focus:scale-[1.02]" 
                          />
                        </div>
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="paypal">
                      <motion.div 
                        className="p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <PaypalIcon className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-float" />
                        <p className="text-muted-foreground">You will be redirected to PayPal to complete your purchase</p>
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="apple">
                      <motion.div 
                        className="p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <AppleIcon className="w-16 h-16 mx-auto mb-4 animate-float" />
                        <p className="text-muted-foreground">Complete your purchase with Apple Pay</p>
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="google">
                      <motion.div 
                        className="p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <GooglePayIcon className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
                        <p className="text-muted-foreground">Complete your purchase with Google Pay</p>
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-4">
                    <div className="border rounded-lg p-4">
                      <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                        <motion.div 
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                        >
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly" className="flex-1">
                            <div className="flex justify-between items-center">
                              <span>Monthly Payment</span>
                              <span className="text-sm text-muted-foreground">$49.99/mo for 12 months</span>
                            </div>
                          </Label>
                        </motion.div>
                        <Separator className="my-4" />
                        <motion.div 
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                        >
                          <RadioGroupItem value="onetime" id="onetime" />
                          <Label htmlFor="onetime" className="flex-1">
                            <div className="flex justify-between items-center">
                              <span>One-time Payment</span>
                              <div className="text-right">
                                <span className="block font-medium">$499 (Save $100)</span>
                                <span className="text-sm text-green-600">Best Value</span>
                              </div>
                            </div>
                          </Label>
                        </motion.div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <motion.div 
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setPaymentStep(2)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Continue to Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
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
                    <h3 className="font-medium mb-2">Complete Web Development Bootcamp 2025</h3>
                    <p className="text-sm text-muted-foreground mb-4">Professional Plan - {selectedPlan === 'monthly' ? 'Monthly Payment' : 'One-time Payment'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Amount</span>
                      <motion.span 
                        className="font-medium"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {selectedPlan === 'monthly' ? '$49.99/mo' : '$499.00'}
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
                  <motion.div 
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full" 
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Payment'}
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
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20 
                    }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                  >
                    <motion.div
                      className="absolute inset-0 bg-green-100 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardTitle className="text-2xl gradient-text">Payment Successful!</CardTitle>
                    <CardDescription>Your course access has been activated</CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You will receive a confirmation email shortly with your course access details.
                  </motion.p>
                  <motion.div 
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div 
                      className="bg-muted/50 p-4 rounded-lg hover-card-effect"
                      whileHover={{ scale: 1.05 }}
                    >
                      <BookOpen className="w-5 h-5 mb-2 text-primary animate-float" />
                      <p className="font-medium">Start Learning</p>
                      <p className="text-sm text-muted-foreground">Access your course now</p>
                    </motion.div>
                    <motion.div 
                      className="bg-muted/50 p-4 rounded-lg hover-card-effect"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Users className="w-5 h-5 mb-2 text-primary animate-float" />
                      <p className="font-medium">Join Community</p>
                      <p className="text-sm text-muted-foreground">Connect with peers</p>
                    </motion.div>
                  </motion.div>

                  {showConfetti && (
                    <motion.div 
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Confetti animation elements */}
                      {[...Array(50)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-primary rounded-full"
                          initial={{
                            x: "50%",
                            y: "50%",
                            scale: 0
                          }}
                          animate={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            scale: [0, 1, 0],
                            opacity: [1, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.02,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </CardContent>
                <CardFooter>
                  <motion.div 
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full" size="lg">
                      Go to Course Dashboard
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Payment;