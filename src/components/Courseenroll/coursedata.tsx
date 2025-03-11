import { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  Filter,
  Briefcase,
  Code2,
  Palette,
  LineChart,
  Binary,
  GraduationCap,
  DollarSign,
  Languages,
  Trophy,
  Timer,
  Heart,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const courses = [
  {
    id: 1,
    title: "Advanced Web Development",
    description: "Master modern web technologies and frameworks",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    students: 1234,
    rating: 4.8,
    price: 99.99,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    category: "Development",
    level: "Advanced",
    icon: Code2,
    language: "English",
    certificate: true,
    lastUpdated: "2024-03-15",
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    description: "Create stunning user interfaces and experiences",
    instructor: "Michael Chen",
    duration: "8 weeks",
    students: 856,
    rating: 4.9,
    price: 89.99,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80",
    category: "Design",
    level: "Intermediate",
    icon: Palette,
    language: "English",
    certificate: true,
    lastUpdated: "2024-03-10",
  },
  {
    id: 3,
    title: "Data Science Fundamentals",
    description: "Learn data analysis and machine learning basics",
    instructor: "Emily Brown",
    duration: "10 weeks",
    students: 2156,
    rating: 4.7,
    price: 129.99,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    category: "Data Science",
    level: "Beginner",
    icon: LineChart,
    language: "Spanish",
    certificate: true,
    lastUpdated: "2024-03-01",
  },
  {
    id: 4,
    title: "Blockchain Development",
    description: "Build decentralized applications and smart contracts",
    instructor: "Alex Turner",
    duration: "14 weeks",
    students: 645,
    rating: 4.6,
    price: 149.99,
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80",
    category: "Development",
    level: "Advanced",
    icon: Binary,
    language: "English",
    certificate: true,
    lastUpdated: "2024-02-28",
  },
];

function CourseData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="min-h-screen mt-96 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
     

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              className="pl-10 hover:shadow-md transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] hover:shadow-md transition-shadow">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Refine your course search with these filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="under-50">Under $50</SelectItem>
                        <SelectItem value="50-100">$50 - $100</SelectItem>
                        <SelectItem value="100-plus">$100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Level</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Duration</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Duration</SelectItem>
                        <SelectItem value="short">0-4 weeks</SelectItem>
                        <SelectItem value="medium">4-8 weeks</SelectItem>
                        <SelectItem value="long">8+ weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Language</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <Trophy className="mr-2 h-4 w-4" /> Certificate
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Timer className="mr-2 h-4 w-4" /> Self-Paced
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-lg dark:bg-gray-800/60"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {course.category}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => toggleFavorite(course.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.includes(course.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                            }`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {favorites.includes(course.id) ? "Remove from favorites" : "Add to favorites"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <course.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{course.language}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Instructor: {course.instructor}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold">{course.price}</span>
                </div>
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform">
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default CourseData;

