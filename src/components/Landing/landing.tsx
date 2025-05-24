import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/ui/course-card";
import { StatsCard } from "@/components/ui/stats-card";
import Footer from './footer';
import { AISearch } from './aisearch';
import Pricing from './pricing';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Video, 
  Award, 
  Zap, 
  ChevronRight, 
  CheckCircle, 
  ArrowRight,
  BarChart,
  Clock,
  Globe,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  
  const featuredCourses = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      description: "Learn the core concepts of machine learning and build your first models",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop",
      instructor: { name: "Dr. Sarah Chen", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
      duration: "8 weeks",
      level: "Intermediate" as const,
      studentsCount: 1245,
      lessonsCount: 42,
      rating: 4.8,
      price: "$89.99",
      isFeatured: true
    },
    {
      id: 2,
      title: "Web Development Bootcamp",
      description: "Comprehensive guide to modern web development with React, Node.js and more",
      image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop",
      instructor: { name: "Mark Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      duration: "12 weeks",
      level: "Beginner" as const,
      studentsCount: 3567,
      lessonsCount: 86,
      rating: 4.9,
      price: "$129.99",
      isPopular: true
    },
    {
      id: 3,
      title: "Data Science with Python",
      description: "Master data analysis, visualization and machine learning with Python",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      instructor: { name: "Alex Rivera", avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
      duration: "10 weeks",
      level: "Advanced" as const,
      studentsCount: 2189,
      lessonsCount: 64,
      rating: 4.7,
      price: "$99.99"
    }
  ];

  const testimonials = [
    {
      id: 1,
      content: "LearnHub transformed my career. I went from knowing nothing about programming to landing a job as a full-stack developer in just 6 months.",
      author: "Michael T.",
      role: "Software Developer",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      id: 2,
      content: "The instructors are world-class and the community support is amazing. I've tried other platforms but nothing compares to the quality here.",
      author: "Jessica K.",
      role: "Data Scientist",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      id: 3,
      content: "As someone switching careers in my 40s, I was worried about keeping up. The step-by-step approach made learning accessible and enjoyable.",
      author: "Robert M.",
      role: "UX Designer",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  const stats = [
    { title: "Active Students", value: "25,000+", icon: <Users className="h-4 w-4" />, trend: { value: 12, isPositive: true } },
    { title: "Courses", value: "300+", icon: <BookOpen className="h-4 w-4" />, trend: { value: 8, isPositive: true } },
    { title: "Expert Instructors", value: "120+", icon: <GraduationCap className="h-4 w-4" /> },
    { title: "Completion Rate", value: "94%", icon: <Award className="h-4 w-4" />, trend: { value: 3, isPositive: true } }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">New Courses Available</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Unlock Your Potential with <span className="text-primary">Expert-Led</span> Learning
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of students mastering in-demand skills with our comprehensive courses, live sessions, and supportive community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/register')}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/courses')}>
                  Explore Courses
                </Button>
              </div>
              
              <div className="flex items-center mt-8 space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-background w-8 h-8">
                      <AvatarImage src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 20}.jpg`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">1,200+ students</span> joined this week
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Students learning" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Explore our most popular and highly-rated courses</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0" onClick={() => navigate('/courses')}>
              View all courses <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onClick={() => navigate(`/course/${course.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose LearnHub</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines expert instruction, interactive learning, and a supportive community to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Video className="h-10 w-10 text-primary" />,
                title: "Live Interactive Sessions",
                description: "Join real-time classes with instructors and peers for an immersive learning experience."
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "Learn at Your Own Pace",
                description: "Access course materials anytime, anywhere, and progress through lessons on your schedule."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Supportive Community",
                description: "Connect with fellow learners, share insights, and collaborate on projects."
              },
              {
                icon: <Award className="h-10 w-10 text-primary" />,
                title: "Industry-Recognized Certificates",
                description: "Earn credentials that showcase your skills to potential employers."
              },
              {
                icon: <BarChart className="h-10 w-10 text-primary" />,
                title: "Progress Tracking",
                description: "Monitor your advancement with detailed analytics and personalized feedback."
              },
              {
                icon: <Sparkles className="h-10 w-10 text-primary" />,
                title: "AI-Enhanced Learning",
                description: "Benefit from personalized recommendations and adaptive learning paths."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader>
                  <div className="mb-4 p-2 w-fit rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from learners who have transformed their skills and careers with LearnHub.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="mb-4 text-muted-foreground">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="inline-block h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
<AISearch/>
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students already learning on LearnHub. Get started today with free access to select courses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" onClick={() => navigate('/courses')}>
              Browse Courses
            </Button>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
      {children}
    </div>
  );
}

function AvatarImage({ src, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img src={src} className={cn("aspect-square h-full w-full", className)} {...props} />
  );
}

function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils";