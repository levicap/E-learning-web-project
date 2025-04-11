import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Laptop,
  Sparkles,
  GraduationCap,
  SlidersHorizontal,
  BookOpen,
  Clock3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook


function Allsessions() {
  const navigate = useNavigate();

  // Filter state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sessions state (fetched from backend)
  const [sessions, setSessions] = useState<any[]>([]);
  const { user } = useUser();
  const handleBookSession = (session:any) => {
    console.log('Navigating with session:', session);
    navigate('/sessionenroll', { state: { session } });
  };

  // Build auth headers only when user is available.
  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  // Fetch sessions from the admin endpoint
  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions/admin', {
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user]);

  // Compute filtered sessions based on filter state values
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Search query filter (checks title and description)
      const queryMatch =
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!queryMatch) return false;

      // Session type filter
      if (selectedType !== "all" && session.type?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Price range filter
      const sessionPrice = Number(session.price) || 0;
      if (sessionPrice < priceRange[0] || sessionPrice > priceRange[1]) return false;

      // Subject filter (if available)
      if (selectedSubject !== "all" && session.subject && session.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // Level filter (if available)
      if (selectedLevel !== "all" && session.level && session.level.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }

      // Duration filter (if available)
      if (selectedDuration !== "all" && session.duration) {
        const duration = Number(session.duration);
        if (selectedDuration === "60" && duration !== 60) return false;
        if (selectedDuration === "90" && duration !== 90) return false;
        if (selectedDuration === "120" && duration !== 120) return false;
      }
      return true;
    });
  }, [sessions, searchQuery, selectedType, priceRange, selectedSubject, selectedLevel, selectedDuration]);

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Find your perfect session</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 mb-4">
                All Learning Sessions
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Browse sessions created by our expert teachers.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 max-w-3xl mx-auto w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, subject, or tutor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px]">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <SheetHeader className="space-y-4 sticky top-0 bg-background pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <SheetTitle>Filter Sessions</SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedType("all");
                          setPriceRange([0, 100]);
                          setSelectedSubject("all");
                          setSelectedLevel("all");
                          setSelectedDuration("all");
                        }}
                      >
                        Reset all
                      </Button>
                    </div>
                    <SheetDescription>
                      Customize your search with advanced filters
                    </SheetDescription>
                    <Separator />
                  </SheetHeader>
                  <div className="space-y-6 px-1 pb-8">
                    {/* Subject Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Subject Area
                      </h4>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Session Format Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Session Format
                      </h4>
                      <Tabs value={selectedType} onValueChange={setSelectedType}>
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="online">Online</TabsTrigger>
                          <TabsTrigger value="in-person">In-Person</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <Separator />

                    {/* Duration Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        Duration
                      </h4>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Duration</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Price Range Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Price Range
                      </h4>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm font-medium">${priceRange[0]}</span>
                          <span className="text-sm font-medium">${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Difficulty Level Filter */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Difficulty Level
                      </h4>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>
                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
                  <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"  
          >
            {filteredSessions.map((session) => (
              <Card key={session._id} className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl bg-background/50 backdrop-blur-sm border-primary/10">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {session.level || "N/A"}
                    </Badge>
                    <Badge variant={session.type === 'online' ? 'outline' : 'default'} className="ml-2">
                      {session.type === 'online' ? <Laptop className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      {session.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {session.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>{session.time} ({session.duration}min)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{session.maxStudents} spots</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>{session.tutor?.rating || "N/A"} ({session.tutor?.reviews || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-primary/10" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={session.tutor?.image || 'https://via.placeholder.com/150'}
                          alt={session.tutor?.name}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                        />
                        <span className="text-sm font-medium">{session.tutor?.name}</span>
                      </div>
                      <div className="flex items-center text-lg font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        {session.price}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                <Button 
  onClick={() => {
    console.log('Button clicked');
    console.log('Navigating with session:', session); 
    
    if (!session) {
      console.error("No session data available.");
      return;
    }
    
    navigate('/sessionenroll', { state: { session } });
  }}
  style={{ position: 'relative', zIndex: 10 }} // Ensure it's not covered by other elements
>
  Book Session
</Button>


            
             
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Allsessions;
