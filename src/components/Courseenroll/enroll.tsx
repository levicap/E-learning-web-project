import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Twitter,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Youtube,
  Instagram,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Heart
} from "lucide-react";

function Enroll() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8 mb-8"
        >
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Advanced Web Development Masterclass
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="animate-pulse">New</Badge>
                <Badge variant="secondary">Frontend</Badge>
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                Master modern web development with React, TypeScript, and best practices. Build real-world applications and learn advanced concepts.
              </p>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>2,345 students</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>4.8/5 rating</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Clock className="w-5 h-5 text-green-500" />
                  <span>32 hours</span>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  Enroll Now - $99.99
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-96"
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60"
                    alt="Course Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center p-4">
                    <Button variant="secondary" size="sm">
                      Watch Preview
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="content" className="mt-12">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>32 lessons • 8 modules • 32 hours total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {modules.map((module, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{module.title}</h3>
                        <span className="text-sm text-muted-foreground">{module.duration}</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            key={lessonIndex}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>{lesson.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <Avatar className="w-24 h-24 border-4 border-primary">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-2 -right-2">Featured</Badge>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl">John Doe</CardTitle>
                    <CardDescription className="text-lg">Senior Web Developer & Lead Instructor</CardDescription>
                    <div className="flex gap-2 mt-2">
                      {instructorSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed">
                    With over 10 years of experience in web development, John has worked with Fortune 500
                    companies and has trained thousands of developers worldwide. He specializes in React,
                    TypeScript, and modern web development practices.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {instructorStats.map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-muted p-4 rounded-lg text-center"
                      >
                        {stat.icon}
                        <div className="text-2xl font-bold mt-2">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Connect with John</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {socialLinks.map((link, index) => (
                        <HoverCard key={index}>
                          <HoverCardTrigger>
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <Button variant="outline" size="icon" className="w-full">
                                {link.icon}
                              </Button>
                            </motion.div>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <div className="text-sm">
                              <div className="font-semibold">{link.platform}</div>
                              <div className="text-muted-foreground">{link.handle}</div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Experience & Achievements</h3>
                    <div className="space-y-4">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 bg-muted p-3 rounded-lg"
                        >
                          {achievement.icon}
                          <div>
                            <div className="font-semibold">{achievement.title}</div>
                            <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>See what our students are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className="space-y-4 bg-muted p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                        <Badge variant="outline" className="ml-auto">Verified Student</Badge>
                      </div>
                      <p className="text-sm italic">{review.content}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">• {review.rating}/5</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sample data
const modules = [
  {
    title: "Module 1: Introduction to Web Development",
    duration: "4 hours",
    progress: 100,
    lessons: [
      { title: "Getting Started with HTML5", duration: "45 min" },
      { title: "CSS3 Fundamentals", duration: "1 hour" },
      { title: "JavaScript Basics", duration: "1.5 hours" },
    ],
  },
  {
    title: "Module 2: React Fundamentals",
    duration: "6 hours",
    progress: 75,
    lessons: [
      { title: "Introduction to React", duration: "1 hour" },
      { title: "Components and Props", duration: "1.5 hours" },
      { title: "State and Lifecycle", duration: "2 hours" },
    ],
  },
  {
    title: "Module 3: Advanced React Concepts",
    duration: "8 hours",
    progress: 30,
    lessons: [
      { title: "Hooks in Depth", duration: "2 hours" },
      { title: "Context API", duration: "1.5 hours" },
      { title: "Performance Optimization", duration: "2 hours" },
    ],
  },
];

const instructorSkills = [
  "React Expert",
  "TypeScript",
  "System Design",
  "Performance",
  "UI/UX",
];

const instructorStats = [
  { icon: <Users className="w-6 h-6 mx-auto text-blue-500" />, value: "50K+", label: "Students" },
  { icon: <Star className="w-6 h-6 mx-auto text-yellow-500" />, value: "4.9", label: "Rating" },
  { icon: <BookOpen className="w-6 h-6 mx-auto text-green-500" />, value: "12", label: "Courses" },
  { icon: <Award className="w-6 h-6 mx-auto text-purple-500" />, value: "15+", label: "Awards" },
];

const socialLinks = [
  { platform: "Twitter", handle: "@johndoe", icon: <Twitter className="w-4 h-4" /> },
  { platform: "LinkedIn", handle: "john-doe", icon: <Linkedin className="w-4 h-4" /> },
  { platform: "GitHub", handle: "johndoe", icon: <Github className="w-4 h-4" /> },
  { platform: "YouTube", handle: "JohnDoeCode", icon: <Youtube className="w-4 h-4" /> },
  { platform: "Instagram", handle: "@johnthedev", icon: <Instagram className="w-4 h-4" /> },
  { platform: "Website", handle: "johndoe.dev", icon: <Globe className="w-4 h-4" /> },
];

const achievements = [
  {
    icon: <Award className="w-6 h-6 text-yellow-500" />,
    title: "Best Online Instructor 2024",
    description: "Awarded by eLearning Industry",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-blue-500" />,
    title: "Tech Lead at Google",
    description: "2018 - 2022",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-green-500" />,
    title: "MS in Computer Science",
    description: "Stanford University",
  },
  {
    icon: <Heart className="w-6 h-6 text-red-500" />,
    title: "Community Contributor",
    description: "500+ Open Source Contributions",
  },
];

const reviews = [
  {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60",
    date: "2 weeks ago",
    rating: 5,
    content: "This course exceeded my expectations. The instructor explains complex concepts in a very clear and engaging way.",
  },
  {
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    date: "1 month ago",
    rating: 4,
    content: "Great course content and structure. The practical examples really helped solidify my understanding.",
  },
  {
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60",
    date: "2 months ago",
    rating: 5,
    content: "The best web development course I've taken. The instructor's expertise really shows through.",
  },
];

export default Enroll;