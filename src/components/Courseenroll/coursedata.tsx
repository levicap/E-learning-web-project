import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Clock,
  Users,
  Star,
  Filter,
  Code2,
  GraduationCap,
  DollarSign,
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from '@clerk/clerk-react';

function CourseData() {
  // Filter state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [level, setLevel] = useState("all");
  const [duration, setDuration] = useState("all");

  const [favorites, setFavorites] = useState<number[]>([]);
  const [courses, setCourses] = useState([]);
  const { user } = useUser();
  console.log('Clerk user:', user);

  // Build headers only when user is available.
  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses/instructor-courses', {
        headers: authHeaders,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch courses');
      }
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Compute filtered courses based on filter state values
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Check search query match in title or description
      const queryMatch =
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!queryMatch) return false;

      // Category filter
      if (category !== "all" && course.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // Price filter
      const coursePrice = Number(course.price) || 0;
      if (price !== "all") {
        if (price === "free" && coursePrice !== 0) return false;
        if (price === "under-50" && !(coursePrice > 0 && coursePrice < 50)) return false;
        if (price === "50-100" && !(coursePrice >= 50 && coursePrice <= 100)) return false;
        if (price === "100-plus" && coursePrice <= 100) return false;
      }

      // Level filter (if available)
      if (level !== "all" && course.level && course.level.toLowerCase() !== level.toLowerCase()) {
        return false;
      }

      // Duration filter based on computed total duration from lessons (in minutes)
      const totalDuration =
        course.lessons?.reduce((acc, lesson) => acc + Number(lesson.duration || 0), 0) || 0;
      if (duration !== "all") {
        if (duration === "short" && totalDuration >= 60) return false;
        if (duration === "medium" && (totalDuration < 60 || totalDuration > 180)) return false;
        if (duration === "long" && totalDuration <= 180) return false;
      }
      return true;
    });
  }, [courses, searchQuery, category, price, level, duration]);
  

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        {/* Top Bar: Search and Filters Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 animate-fade-in">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              className="pl-10 hover:shadow-md transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 hover:shadow-md transition-shadow">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select onValueChange={setCategory} defaultValue="all">
                    <SelectTrigger className="w-full">
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
                </div>
                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Price Range</label>
                  <Select onValueChange={setPrice} defaultValue="all">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Price Range" />
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
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <Select onValueChange={setLevel} defaultValue="all">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Level" />
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
                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <Select onValueChange={setDuration} defaultValue="all">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="short">Short (&lt; 60 mins)</SelectItem>
                      <SelectItem value="medium">Medium (60-180 mins)</SelectItem>
                      <SelectItem value="long">Long (&gt; 180 mins)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetClose asChild>
                <Button className="mt-4 w-full">Apply Filters</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => {
              // Compute total duration (in minutes) by summing all lesson durations
              const totalDuration =
                course.lessons?.reduce((acc, lesson) => acc + Number(lesson.duration || 0), 0) || 0;
              return (
                <Card 
                  key={course.id || course._id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-lg dark:bg-gray-800/60"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`http://localhost:5000${course.image}`}
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
                              onClick={() => toggleFavorite(course.id || course._id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites.includes(course.id || course._id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-500"
                                }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {favorites.includes(course.id || course._id)
                              ? "Remove from favorites"
                              : "Add to favorites"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {course.icon ? (
                            <course.icon className="h-5 w-5 text-primary" />
                          ) : (
                            <Code2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{totalDuration} mins</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{course.students?.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">{course.rating}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Instructor:{" "}
                        {course.instructor?.name ? course.instructor.name : course.instructor}
                      </span>
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
              );
            })
          ) : (
            <p>No courses available.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default CourseData;
