import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  GraduationCap,
  Search,
  Clock,
  DollarSign,
  Star,
  Filter,
  MapPin,
  Globe,
  Award,
  Calendar,
  MessageCircle,
  Verified,
  Languages,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const tutors = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    subjects: ['Mathematics', 'Physics', 'Calculus'],
    rating: 4.9,
    totalReviews: 128,
    hourlyRate: 75,
    groupRate: 45,
    type: ['1:1', 'Group'],
    availability: '20+ hrs/week',
    experience: '8 years',
    description: 'PhD in Mathematics with extensive teaching experience at university level. Specialized in advanced calculus and theoretical physics.',
    location: 'New York, USA',
    languages: ['English', 'French'],
    certifications: ['PhD Mathematics', 'Teaching Excellence Award'],
    specializations: ['Advanced Calculus', 'Quantum Physics', 'Linear Algebra'],
    successRate: 98,
    totalStudents: 450,
    responseTime: '< 2 hours',
    verified: true,
    nextAvailable: 'Today',
  },
  {
    id: 2,
    name: 'Prof. James Wilson',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    subjects: ['Computer Science', 'Programming', 'Data Structures'],
    rating: 4.8,
    totalReviews: 95,
    hourlyRate: 85,
    groupRate: 55,
    type: ['1:1', 'Group'],
    availability: '15 hrs/week',
    experience: '12 years',
    description: 'Senior Software Engineer and Computer Science Professor. Expert in algorithms and software architecture.',
    location: 'San Francisco, USA',
    languages: ['English', 'Spanish'],
    certifications: ['MSc Computer Science', 'AWS Certified'],
    specializations: ['Algorithms', 'Web Development', 'System Design'],
    successRate: 95,
    totalStudents: 320,
    responseTime: '< 1 hour',
    verified: true,
    nextAvailable: 'Tomorrow',
  },
  {
    id: 3,
    name: 'Dr. Emily Chen',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    subjects: ['Chemistry', 'Biology', 'Biochemistry'],
    rating: 4.7,
    totalReviews: 156,
    hourlyRate: 70,
    groupRate: 40,
    type: ['1:1', 'Group'],
    availability: '25 hrs/week',
    experience: '6 years',
    description: 'Research scientist with a passion for teaching life sciences. Published researcher in molecular biology.',
    location: 'Boston, USA',
    languages: ['English', 'Mandarin'],
    certifications: ['PhD Biochemistry', 'Research Excellence'],
    specializations: ['Organic Chemistry', 'Molecular Biology', 'Genetics'],
    successRate: 94,
    totalStudents: 280,
    responseTime: '< 3 hours',
    verified: true,
    nextAvailable: 'Today',
  },
  {
    id: 4,
    name: 'Dr. manel',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    subjects: ['Chemistry', 'Biology', 'Biochemistry'],
    rating: 4.7,
    totalReviews: 156,
    hourlyRate: 70,
    groupRate: 40,
    type: ['1:1', 'Group'],
    availability: '25 hrs/week',
    experience: '6 years',
    description: 'Research scientist with a passion for teaching life sciences. Published researcher in molecular biology.',
    location: 'Boston, USA',
    languages: ['English', 'Mandarin'],
    certifications: ['PhD Biochemistry', 'Research Excellence'],
    specializations: ['Organic Chemistry', 'Molecular Biology', 'Genetics'],
    successRate: 94,
    totalStudents: 280,
    responseTime: '< 3 hours',
    verified: true,
    nextAvailable: 'Today',
  }
];

function Tutor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);
    const matchesType = selectedType === 'all' || tutor.type.includes(selectedType);
    const matchesPriceRange = priceRange === 'all' ||
      (priceRange === 'under-50' && tutor.hourlyRate < 50) ||
      (priceRange === '50-100' && tutor.hourlyRate >= 50 && tutor.hourlyRate <= 100) ||
      (priceRange === 'over-100' && tutor.hourlyRate > 100);

    return matchesSearch && matchesSubject && matchesType && matchesPriceRange;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Find Your Perfect Tutor
          </h1>
         
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-lg p-4 rounded-lg border">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or subject..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Tutors</SheetTitle>
                  <SheetDescription>
                    Refine your search with these filters
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="1:1">1:1 Sessions</SelectItem>
                        <SelectItem value="Group">Group Sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-50">Under $50/hr</SelectItem>
                        <SelectItem value="50-100">$50-$100/hr</SelectItem>
                        <SelectItem value="over-100">Over $100/hr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="group hover:shadow-2xl transition-all duration-300 bg-card border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/50"
                    />
                    {tutor.verified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <Verified className="h-4 w-4 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Verified Tutor
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {tutor.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                        <span className="ml-1">{tutor.rating}</span>
                      </div>
                      <span>·</span>
                      <span>{tutor.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">{tutor.description}</CardDescription>
                
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Success Rate</span>
                    </div>
                    <Progress value={tutor.successRate} className="h-2" />
                    <span className="text-xs text-muted-foreground">{tutor.successRate}% success rate</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Students Taught</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{tutor.totalStudents}+</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <div>1:1 Session: ${tutor.hourlyRate}/hr</div>
                      {tutor.type.includes('Group') && (
                        <div>Group: ${tutor.groupRate}/hr</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>{tutor.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Next: {tutor.nextAvailable}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Specializations</div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">
                  Book Session
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tutor;