import {
    Search,
    BookOpen,
    Users,
    Filter,
    Clock,
    Calendar,
    Trophy,
    Star,
    BookMarked,
    GraduationCap,
    Code,
    Palette,
    Music,
    Database,
    Moon,
    Sun,
    Bookmark,
    Timer,
    Award,
    TrendingUp,
    SlidersHorizontal,
    ChevronDown,
  } from 'lucide-react';
  import { useState, useEffect } from 'react';
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuCheckboxItem,
  } from "@/components/ui/dropdown-menu";
  import { Progress } from "@/components/ui/progress";
  import { Badge } from "@/components/ui/badge";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Skeleton } from "@/components/ui/skeleton";
  
  // Enhanced mock data with more details
  const courses = [
    {
      id: 1,
      title: "Advanced JavaScript Patterns",
      type: "course",
      instructor: "Sarah Johnson",
      instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      progress: 65,
      lastAccessed: "2024-03-20",
      category: "Programming",
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&q=80",
      totalModules: 12,
      completedModules: 8,
      rating: 4.8,
      studentsEnrolled: 1234,
      estimatedHours: 24,
      difficulty: "Advanced",
      icon: <Code className="h-4 w-4" />
    },
    {
      id: 2,
      title: "React Architecture & Best Practices",
      type: "course",
      instructor: "Mike Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      progress: 32,
      lastAccessed: "2024-03-19",
      category: "Web Development",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80",
      totalModules: 10,
      completedModules: 3,
      rating: 4.9,
      studentsEnrolled: 2156,
      estimatedHours: 20,
      difficulty: "Intermediate",
      icon: <Code className="h-4 w-4" />
    },
    {
      id: 3,
      type: "session",
      title: "Data Structures Tutoring",
      instructor: "Dr. Emily White",
      instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      datetime: "2024-03-25 14:00",
      category: "Computer Science",
      image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=500&q=80",
      duration: "60 mins",
      topic: "Binary Trees & Graphs",
      price: 50,
      icon: <Database className="h-4 w-4" />
    },
    {
      id: 4,
      title: "UI/UX Design Fundamentals",
      type: "course",
      instructor: "Alex Rivera",
      instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      progress: 88,
      lastAccessed: "2024-03-21",
      category: "Design",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80",
      totalModules: 8,
      completedModules: 7,
      rating: 4.7,
      studentsEnrolled: 1876,
      estimatedHours: 16,
      difficulty: "Beginner",
      icon: <Palette className="h-4 w-4" />
    },
    {
      id: 5,
      title: "Music Theory Basics",
      type: "course",
      instructor: "Lisa Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      progress: 45,
      lastAccessed: "2024-03-18",
      category: "Music",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&q=80",
      totalModules: 15,
      completedModules: 7,
      rating: 4.6,
      studentsEnrolled: 943,
      estimatedHours: 30,
      difficulty: "Intermediate",
      icon: <Music className="h-4 w-4" />
    },
    {
      id: 6,
      type: "session",
      title: "Portfolio Review Session",
      instructor: "James Wilson",
      instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      datetime: "2024-03-26 15:30",
      category: "Design",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=500&q=80",
      duration: "45 mins",
      topic: "UX Portfolio Feedback",
      price: 75,
      icon: <Palette className="h-4 w-4" />
    }
  ];
  
  const categoryIcons = {
    "Programming": <Code />,
    "Web Development": <Code />,
    "Computer Science": <GraduationCap />,
    "Design": <Palette />,
    "Music": <Music />,
    "all": <BookMarked />
  };
  
  interface Filters {
    category: string;
    difficulty: string[];
    progress: string;
    rating: number | null;
    duration: string;
  }
  
  function Learning() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [filters, setFilters] = useState<Filters>({
      category: "all",
      difficulty: [],
      progress: "all",
      rating: null,
      duration: "all"
    });
  
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }, []);
  
    useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
  
    const filteredItems = courses.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                           item.instructor.toLowerCase().includes(search.toLowerCase());
      const matchesType = activeTab === "all" || 
                         (activeTab === "courses" && item.type === "course") ||
                         (activeTab === "sessions" && item.type === "session");
      const matchesCategory = filters.category === "all" || item.category === filters.category;
      
      const matchesDifficulty = item.type === "session" || 
                               filters.difficulty.length === 0 || 
                               filters.difficulty.includes(item.difficulty);
  
      const matchesProgress = filters.progress === "all" ||
                             (filters.progress === "inProgress" && item.type === "course" && item.progress > 0 && item.progress < 100) ||
                             (filters.progress === "completed" && item.type === "course" && item.progress === 100) ||
                             (filters.progress === "notStarted" && item.type === "course" && item.progress === 0);
  
      const matchesRating = !filters.rating || 
                           (item.type === "course" && item.rating >= filters.rating);
  
      const matchesDuration = filters.duration === "all" ||
                             (filters.duration === "short" && item.estimatedHours <= 20) ||
                             (filters.duration === "medium" && item.estimatedHours > 20 && item.estimatedHours <= 40) ||
                             (filters.duration === "long" && item.estimatedHours > 40);
      
      return matchesSearch && matchesType && matchesCategory && matchesDifficulty && 
             matchesProgress && matchesRating && matchesDuration;
    });
  
    const categories = ["all", ...new Set(courses.map(item => item.category))];
    const difficulties = ["Beginner", "Intermediate", "Advanced"];
    
    const totalHoursLearned = courses
      .filter(course => course.type === "course")
      .reduce((acc, course) => acc + (course.estimatedHours || 0) * (course.progress / 100), 0);
  
    const totalSessions = courses.filter(item => item.type === "session").length;
    const totalCourses = courses.filter(item => item.type === "course").length;
    const averageProgress = courses
      .filter(course => course.type === "course")
      .reduce((acc, course) => acc + (course.progress || 0), 0) / totalCourses;
  
    const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
  
    const LoadingCard = () => (
      <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  
    const getActiveFiltersCount = () => {
      let count = 0;
      if (filters.category !== "all") count++;
      if (filters.difficulty.length > 0) count++;
      if (filters.progress !== "all") count++;
      if (filters.rating !== null) count++;
      if (filters.duration !== "all") count++;
      return count;
    };
  
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-8 w-8" />
                  My Learning Dashboard
                </h1>
                <p className="text-muted-foreground">Track your progress and upcoming sessions</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 md:min-w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses and sessions..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px]">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
                    {categories.map(category => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => setFilters(prev => ({ ...prev, category }))}
                        className="capitalize flex items-center gap-2"
                      >
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        {category}
                        {filters.category === category && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Difficulty</DropdownMenuLabel>
                    {difficulties.map(difficulty => (
                      <DropdownMenuCheckboxItem
                        key={difficulty}
                        checked={filters.difficulty.includes(difficulty)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            difficulty: checked
                              ? [...prev.difficulty, difficulty]
                              : prev.difficulty.filter(d => d !== difficulty)
                          }));
                        }}
                      >
                        {difficulty}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
  
                  <DropdownMenuSeparator />
  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Progress</DropdownMenuLabel>
                    {[
                      { value: "all", label: "All" },
                      { value: "notStarted", label: "Not Started" },
                      { value: "inProgress", label: "In Progress" },
                      { value: "completed", label: "Completed" }
                    ].map(option => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, progress: option.value }))}
                      >
                        {option.label}
                        {filters.progress === option.value && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
  
                  <DropdownMenuSeparator />
  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Rating</DropdownMenuLabel>
                    {[4, 4.5].map(rating => (
                      <DropdownMenuItem
                        key={rating}
                        onClick={() => setFilters(prev => ({ ...prev, rating }))}
                        className="flex items-center"
                      >
                        {rating}+ <Star className="h-3 w-3 ml-1 text-yellow-400" />
                        {filters.rating === rating && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
  
                  <DropdownMenuSeparator />
  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">Duration</DropdownMenuLabel>
                    {[
                      { value: "all", label: "All" },
                      { value: "short", label: "Short (≤20h)" },
                      { value: "medium", label: "Medium (20-40h)" },
                      { value: "long", label: "Long (>40h)" }
                    ].map(option => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, duration: option.value }))}
                      >
                        {option.label}
                        {filters.duration === option.value && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
  
                  <DropdownMenuSeparator />
  
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setFilters({
                      category: "all",
                      difficulty: [],
                      progress: "all",
                      rating: null,
                      duration: "all"
                    })}
                  >
                    Reset Filters
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{Math.round(totalHoursLearned)}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Progress</p>
                <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </Card>
          </div>
  
          <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2">
                <Users className="h-4 w-4" />
                Tutoring Sessions
              </TabsTrigger>
            </TabsList>
  
            <ScrollArea className="h-[calc(100vh-400px)]">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => <LoadingCard key={i} />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <Card className="p-8 text-center">
                      <CardTitle className="mb-2">No results found</CardTitle>
                      <CardDescription>
                        Try adjusting your filters or search terms
                      </CardDescription>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Badge variant={item.type === 'course' ? 'default' : 'secondary'} className="opacity-90">
                                {item.type}
                              </Badge>
                              {item.type === 'course' && (
                                <Badge variant="outline" className="opacity-90 bg-background/50 backdrop-blur-sm">
                                  {item.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                  {item.title}
                                </CardTitle>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <CardDescription className="flex items-center gap-2 cursor-pointer">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={item.instructorAvatar} />
                                        <AvatarFallback>{item.instructor[0]}</AvatarFallback>
                                      </Avatar>
                                      {item.instructor}
                                    </CardDescription>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="flex justify-between space-x-4">
                                      <Avatar>
                                        <AvatarImage src={item.instructorAvatar} />
                                        <AvatarFallback>{item.instructor[0]}</AvatarFallback>
                                      </Avatar>
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">{item.instructor}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Expert in {item.category}
                                        </p>
                                        {item.type === 'course' && (
                                          <div className="flex items-center pt-2">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                            <span className="text-sm font-medium">{item.rating}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                              <div className="bg-primary/10 p-2 rounded-full">
                                {item.icon}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {item.type === 'course' ? (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {item.completedModules}/{item.totalModules} Modules
                                  </span>
                                  <span>{item.progress}%</span>
                                </div>
                                <Progress value={item.progress} className="transition-all duration-300" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {item.studentsEnrolled.toLocaleString()} students
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    {item.estimatedHours}h total
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {item.rating} rating
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Last accessed: {new Date(item.lastAccessed).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(item.datetime).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4" />
                                  Duration: {item.duration}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Bookmark className="h-4 w-4" />
                                  Topic: {item.topic}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Trophy className="h-4 w-4" />
                                  Price: ${item.price}
                                </div>
                              </div>
                            )}
                            <Button className="w-full group-hover:bg-primary/90 transition-colors">
                              {item.type === 'course' ? 'Continue Learning' : 'Join Session'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    );
  }
  
  export default Learning;