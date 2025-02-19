import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CircuitBoard as ChalkBoard, 
  Users, 
  GraduationCap, 
  Search,
  Plus,
  MoreHorizontal,
  BookOpen,
  Star,
  Trophy,
  Clock,
  Mail,
  Phone,
  Building,
  Calendar,
  Filter,
  Briefcase,
  Award,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ChevronDown,
  Sparkles,
  Target,
  BarChart3,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock data for teachers
const teachers = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@edu.com",
    phone: "+1 (555) 123-4567",
    subject: "Computer Science",
    department: "Engineering",
    students: 145,
    rating: 4.8,
    courses: 12,
    status: "Active",
    joinDate: "2022-09-15",
    certifications: ["PhD in Computer Science", "AWS Certified Developer"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    email: "michael.chen@edu.com",
    phone: "+1 (555) 234-5678",
    subject: "Mathematics",
    department: "Sciences",
    students: 198,
    rating: 4.9,
    courses: 8,
    status: "Active",
    joinDate: "2021-06-20",
    certifications: ["PhD in Mathematics", "Advanced Statistics Certification"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Dr. Emily Brooks",
    email: "emily.brooks@edu.com",
    phone: "+1 (555) 345-6789",
    subject: "Physics",
    department: "Sciences",
    students: 112,
    rating: 4.7,
    courses: 6,
    status: "On Leave",
    joinDate: "2023-01-10",
    certifications: ["PhD in Physics", "Research Excellence Award"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Dr. James Martinez",
    email: "james.martinez@edu.com",
    phone: "+1 (555) 456-7890",
    subject: "Biology",
    department: "Life Sciences",
    students: 167,
    rating: 4.6,
    courses: 9,
    status: "Active",
    joinDate: "2022-03-15",
    certifications: ["PhD in Biology", "Excellence in Teaching Award"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop"
  },
];

type TeacherFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  status: string;
};

function TeacherForm({ defaultValues, onSubmit }: { 
  defaultValues?: TeacherFormData;
  onSubmit: (data: TeacherFormData) => void;
}) {
  const [formData, setFormData] = useState<TeacherFormData>(
    defaultValues || {
      name: "",
      email: "",
      phone: "",
      subject: "",
      department: "",
      status: "Active",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sciences">Sciences</SelectItem>
              <SelectItem value="Life Sciences">Life Sciences</SelectItem>
              <SelectItem value="Humanities">Humanities</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}

function FilterSection({ onFilter }: { onFilter: (filters: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    rating: "",
    joinDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center space-x-2 text-sm">
          <Filter className="h-4 w-4" />
          <h4 className="font-semibold">Filters</h4>
          {Object.values(filters).some(Boolean) && (
            <Badge variant="secondary" className="ml-2">
              {Object.values(filters).filter(Boolean).length} active
            </Badge>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-4">
        <div className="grid gap-4 px-4 pt-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => handleFilterChange("department", value)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sciences">Sciences</SelectItem>
                <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                <SelectItem value="Humanities">Humanities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Select
              value={filters.rating}
              onValueChange={(value) => handleFilterChange("rating", value)}
            >
              <SelectTrigger id="rating">
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All ratings</SelectItem>
                <SelectItem value="4.5+">4.5 and above</SelectItem>
                <SelectItem value="4.0+">4.0 and above</SelectItem>
                <SelectItem value="3.5+">3.5 and above</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinDate">Join Date</Label>
            <Select
              value={filters.joinDate}
              onValueChange={(value) => handleFilterChange("joinDate", value)}
            >
              <SelectTrigger id="joinDate">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="last-quarter">Last quarter</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters({
                department: "",
                status: "",
                rating: "",
                joinDate: "",
              });
              onFilter({});
            }}
          >
            Reset filters
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend,
  trendColor = "text-green-500"
}: { 
  title: string;
  value: string;
  change: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`flex items-center text-xs ${trendColor}`}>
            {trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeacherStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    "Active": {
      icon: CheckCircle2,
      className: "bg-green-50 text-green-700",
    },
    "On Leave": {
      icon: PauseCircle,
      className: "bg-yellow-50 text-yellow-700",
    },
    "Inactive": {
      icon: XCircle,
      className: "bg-red-50 text-red-700",
    },
  }[status] || {
    icon: Clock,
    className: "bg-gray-50 text-gray-700",
  };

  const StatusIcon = statusConfig.icon;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusConfig.className}`}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {status}
    </span>
  );
}

function CrudTeacher() {
  const [editingTeacher, setEditingTeacher] = useState<TeacherFormData | null>(null);
  const [filters, setFilters] = useState({});

  const handleCreateTeacher = (data: TeacherFormData) => {
    console.log("Creating teacher:", data);
    // Add API call here
  };

  const handleEditTeacher = (data: TeacherFormData) => {
    console.log("Updating teacher:", data);
    // Add API call here
  };

  const handleDeleteTeacher = (teacherId: number) => {
    console.log("Deleting teacher:", teacherId);
    // Add API call here
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    console.log("Applying filters:", newFilters);
    // Add filter logic here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
     

      <div className="container px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Teachers"
            value="245"
            change="+4 from last month"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Active Courses"
            value="873"
            change="+18 this week"
            icon={BookOpen}
            trend="up"
          />
          <StatsCard
            title="Average Rating"
            value="4.8"
            change="+0.2 this month"
            icon={Star}
            trend="up"
            trendColor="text-yellow-500"
          />
          <StatsCard
            title="Total Students"
            value="12,454"
            change="+2,345 this month"
            icon={GraduationCap}
            trend="up"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Top Performing Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engineering</span>
                  <span className="text-sm font-medium">4.9</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sciences</span>
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Life Sciences</span>
                  <span className="text-sm font-medium">4.7</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">5 Teachers received Excellence Awards</div>
                <div className="text-sm">3 New Research Publications</div>
                <div className="text-sm">10 Teachers completed Advanced Training</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engineering</span>
                  <span className="text-sm font-medium">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sciences</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Humanities</span>
                  <span className="text-sm font-medium">24%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Table Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Teachers</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage and monitor teacher profiles and performance
                </p>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search teachers..." className="pl-8 w-[250px]" />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Teacher</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new teacher to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    <TeacherForm onSubmit={handleCreateTeacher} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FilterSection onFilter={handleFilter} />
            <Separator className="my-4" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <img
                          src={teacher.image}
                          alt={teacher.name}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {teacher.subject}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Award className="h-3 w-3 mr-1" />
                            {teacher.certifications[0]}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {teacher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {teacher.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {teacher.rating}/5.0
                        </div>
                        <div className="flex items-center text-sm">
                          <Trophy className="h-3 w-3 mr-1 text-blue-500" />
                          {teacher.courses} Courses
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1 text-green-500" />
                          {teacher.students} Students
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(teacher.joinDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TeacherStatusBadge status={teacher.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Edit Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Teacher</DialogTitle>
                                <DialogDescription>
                                  Make changes to the teacher's information.
                                </DialogDescription>
                              </DialogHeader>
                              <TeacherForm
                                defaultValues={{
                                  name: teacher.name,
                                  email: teacher.email,
                                  phone: teacher.phone,
                                  subject: teacher.subject,
                                  department: teacher.department,
                                  status: teacher.status,
                                }}
                                onSubmit={handleEditTeacher}
                              />
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                Delete Teacher
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this teacher? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CrudTeacher;