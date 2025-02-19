import { useState } from 'react';
import {
  BookOpen, Users, Calendar, GraduationCap, Clock, Star,
  CheckCircle2, ArrowRight, CreditCard, Wallet, Timer,
  Award, MessageSquare, Video, DollarSign, ChevronRight,
  Sparkles, Globe, Languages, BookMarked, Trophy, Heart,
  Target, Zap, Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

function Teacher() {
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedPackage, setSelectedPackage] = useState('4');

  const instructor = {
    name: "Dr. Sarah Chen",
    subject: "Mathematics",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
    availability: "Mon-Fri",
    specialization: "Calculus, Linear Algebra",
    education: "Ph.D. in Mathematics from MIT",
    experience: "12 years of teaching experience",
    languages: ["English", "Mandarin"],
    achievements: [
      "Published researcher in Mathematical Education",
      "Award-winning educator",
      "98% student satisfaction rate"
    ],
    testimonials: [
      {
        name: "Alex Thompson",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100",
        text: "Dr. Chen's teaching methods are exceptional. I improved my calculus grade significantly.",
        rating: 5
      },
      {
        name: "Maria Rodriguez",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        text: "The best math tutor I've ever had. She explains complex concepts so clearly.",
        rating: 5
      },
      {
        name: "James Wilson",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
        text: "Thanks to Dr. Chen, I aced my Linear Algebra course. Highly recommended!",
        rating: 5
      }
    ],
    certifications: [
      "Advanced Mathematics Teaching Certification",
      "Online Education Excellence Award",
      "STEM Education Leadership Certificate"
    ]
  };

  const packages = {
    "4": { sessions: 4, pricePerSession: 75, discount: "5%" },
    "8": { sessions: 8, pricePerSession: 70, discount: "10%" },
    "12": { sessions: 12, pricePerSession: 65, discount: "15%" }
  };

  const selectedPackageDetails = packages[selectedPackage as keyof typeof packages];
  const totalPrice = selectedPackageDetails.sessions * selectedPackageDetails.pricePerSession;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground animate-fade-in">
            <span>Instructors</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Dr. Sarah Chen</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">Enrollment</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Instructor Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden animate-slide-up">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative group">
                      <img
                        src={instructor.image}
                        alt={instructor.name}
                        className="w-32 h-32 rounded-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold">{instructor.name}</h1>
                          <p className="text-muted-foreground">{instructor.subject} Expert</p>
                          <div className="flex items-center mt-2 space-x-2">
                            {instructor.languages.map((lang) => (
                              <Badge key={lang} variant="outline" className="animate-fade-in">
                                <Globe className="h-3 w-3 mr-1" />
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Badge variant="secondary" className="flex items-center cursor-help">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {instructor.rating}
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Rating Breakdown</h4>
                              <div className="text-sm">
                                Based on 150+ student reviews
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center">
                                    <span className="w-20">Teaching</span>
                                    <div className="flex-1 h-2 bg-secondary rounded-full">
                                      <div className="h-full w-[98%] bg-primary rounded-full" />
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="w-20">Knowledge</span>
                                    <div className="flex-1 h-2 bg-secondary rounded-full">
                                      <div className="h-full w-[95%] bg-primary rounded-full" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{instructor.education}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{instructor.experience}</span>
                        </div>
                        <div className="flex items-center">
                          <BookMarked className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{instructor.specialization}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Available {instructor.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials Carousel */}
              <Card className="animate-slide-up [animation-delay:200ms]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary" />
                    Student Testimonials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {instructor.testimonials.map((testimonial, index) => (
                        <CarouselItem key={index}>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <Avatar>
                                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">{testimonial.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{testimonial.text}</p>
                                  <div className="flex mt-2">
                                    {Array(testimonial.rating).fill(null).map((_, i) => (
                                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>

              <Card className="animate-slide-up [animation-delay:400ms]">
                <CardHeader>
                  <CardTitle>Session Options</CardTitle>
                  <CardDescription>Choose your preferred session duration and package</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base">Session Duration</Label>
                      <RadioGroup
                        defaultValue="60"
                        className="grid grid-cols-3 gap-4 mt-2"
                        onValueChange={setSelectedDuration}
                      >
                        {[
                          { value: "30", label: "30 mins", price: "$45", icon: Timer },
                          { value: "60", label: "60 mins", price: "$75", icon: Timer },
                          { value: "90", label: "90 mins", price: "$110", icon: Timer },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer transition-all duration-200 ${
                              selectedDuration === option.value 
                                ? "border-primary bg-primary/5 scale-[1.02]" 
                                : "border-muted hover:scale-[1.01]"
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              className="sr-only"
                            />
                            <option.icon className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-sm text-muted-foreground">
                              {option.price}
                            </span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base">Session Package</Label>
                      <RadioGroup
                        defaultValue="4"
                        className="grid grid-cols-3 gap-4 mt-2"
                        onValueChange={setSelectedPackage}
                      >
                        {Object.entries(packages).map(([key, pkg]) => (
                          <Label
                            key={key}
                            className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer transition-all duration-200 ${
                              selectedPackage === key 
                                ? "border-primary bg-primary/5 scale-[1.02]" 
                                : "border-muted hover:scale-[1.01]"
                            }`}
                          >
                            <RadioGroupItem
                              value={key}
                              className="sr-only"
                            />
                            <span className="text-lg font-semibold mb-1">
                              {pkg.sessions} Sessions
                            </span>
                            <span className="text-sm text-muted-foreground mb-2">
                              ${pkg.pricePerSession}/session
                            </span>
                            <Badge variant="secondary" className="animate-pulse">
                              Save {pkg.discount}
                            </Badge>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-up [animation-delay:600ms]">
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Choose your payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <RadioGroup defaultValue="card" className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2" />
                          PayPal
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="grid gap-4">
                      <Input placeholder="Card Number" className="transition-all duration-200 focus:scale-[1.02]" />
                      <div className="grid grid-cols-3 gap-4">
                        <Input placeholder="MM/YY" className="transition-all duration-200 focus:scale-[1.02]" />
                        <Input placeholder="CVC" className="transition-all duration-200 focus:scale-[1.02]" />
                        <Input placeholder="ZIP" className="transition-all duration-200 focus:scale-[1.02]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary & Features */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 animate-slide-left">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {selectedPackageDetails.sessions} sessions × ${selectedPackageDetails.pricePerSession}
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${(totalPrice * parseFloat(selectedPackageDetails.discount) / 100).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        ${(totalPrice * (1 - parseFloat(selectedPackageDetails.discount) / 100)).toFixed(2)}
                      </span>
                    </div>

                    <Button className="w-full group" size="lg">
                      <span className="flex items-center">
                        Complete Booking
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By completing this booking, you agree to our Terms of Service and Cancellation Policy
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 animate-slide-left [animation-delay:200ms]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: Video, text: "Live 1-on-1 video sessions", description: "High-quality video conferencing" },
                      { icon: MessageSquare, text: "24/7 messaging support", description: "Get help anytime you need" },
                      { icon: Award, text: "Personalized study materials", description: "Tailored to your learning style" },
                      { icon: Target, text: "Progress tracking", description: "Monitor your improvement" },
                      { icon: Zap, text: "Instant feedback", description: "Real-time performance assessment" }
                    ].map((feature, index) => (
                      <HoverCard key={index}>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center text-sm cursor-help transition-colors hover:text-primary">
                            <feature.icon className="h-4 w-4 mr-2 text-primary" />
                            <span>{feature.text}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="left">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{feature.text}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full pt-4 border-t">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>100% Satisfaction Guaranteed</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teacher;