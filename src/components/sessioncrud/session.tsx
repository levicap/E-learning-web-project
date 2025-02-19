import { useState } from "react";
import {
  PlusCircle,
  GraduationCap,
  Pencil,
  Trash2,
  Users,
  Clock,
  Calendar,
  DollarSign,
  BookOpen,
  Tag,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Textarea } from "@/components/ui/textarea";
import { mockSessions, type TutoringSession } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SessionFormData {
  title: string;
  description: string;
  type: "one-on-one" | "group";
  date: string;
  time: string;
  duration: number;
  maxStudents: number;
  price: number;
}

function SessionForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Partial<SessionFormData>;
  onSubmit: (data: SessionFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<SessionFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "group",
    date: initialData?.date || "",
    time: initialData?.time || "",
    duration: initialData?.duration || 60,
    maxStudents: initialData?.maxStudents || 5,
    price: initialData?.price || 45,
  });

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor="title" className="font-medium">
          Title
        </label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Session title"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="description" className="font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Session description"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="type" className="font-medium">
          Session Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: "one-on-one" | "group") =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-on-one">One-on-One</SelectItem>
            <SelectItem value="group">Group</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="date" className="font-medium">
            Date
          </label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="time" className="font-medium">
            Time
          </label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label htmlFor="duration" className="font-medium">
            Duration (min)
          </label>
          <Input
            id="duration"
            type="number"
            min="30"
            step="15"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duration: parseInt(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="maxStudents" className="font-medium">
            Max Students
          </label>
          <Input
            id="maxStudents"
            type="number"
            min="1"
            value={formData.maxStudents}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxStudents: parseInt(e.target.value),
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="price" className="font-medium">
            Price ($)
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) }))
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(formData)}>Save Session</Button>
      </DialogFooter>
    </div>
  );
}

function SessionCard({
  session,
  onEdit,
  onDelete,
}: {
  session: TutoringSession;
  onEdit: (session: TutoringSession) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="group relative w-full overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute right-0 top-0 z-10 p-4">
        <Badge
          variant={
            session.status === "scheduled"
              ? "default"
              : session.status === "completed"
              ? "secondary"
              : "destructive"
          }
          className="capitalize shadow-sm"
        >
          {session.status}
        </Badge>
      </div>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              {session.type === "one-on-one" ? "1-on-1" : "Group"}
            </Badge>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {session.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 text-muted-foreground">
          <BookOpen className="mt-1 h-4 w-4 shrink-0" />
          <p className="text-sm leading-relaxed">{session.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.tutor.expertise.map((skill) => (
            <Badge key={skill} variant="secondary" className="shadow-sm">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{session.date}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {session.time} ({session.duration} min)
              </span>
            </div>
          </div>
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-end gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-bold">${session.price}</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {session.students.length}/{session.maxStudents} students
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-4">
        <ScrollArea className="flex max-w-[200px] -space-x-2">
          {session.students.map((student) => (
            <TooltipProvider key={student.id}>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="border-2 border-background transition-all hover:translate-y-[-2px]">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </ScrollArea>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(session)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this session? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => onDelete(session.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

function Sessioncrud() {
  const [sessions, setSessions] = useState(mockSessions);
  const [filter, setFilter] = useState<string>("all");
  const [editingSession, setEditingSession] = useState<TutoringSession | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    if (filter === "one-on-one") return session.type === "one-on-one";
    if (filter === "group") return session.type === "group";
    return true;
  });

  const handleCreateSession = (data: SessionFormData) => {
    const newSession: TutoringSession = {
      id: Date.now().toString(),
      ...data,
      status: "scheduled",
      tutor: mockSessions[0].tutor,
      students: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleEditSession = (data: SessionFormData) => {
    if (!editingSession) return;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === editingSession.id
          ? { ...session, ...data }
          : session
      )
    );
    setEditingSession(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>
                    Set up a new tutoring session. Fill in all the details below.
                  </DialogDescription>
                </DialogHeader>
                <SessionForm
                  onSubmit={handleCreateSession}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Tutoring Sessions
            </h2>
            <p className="text-muted-foreground">
              Manage your upcoming and past tutoring sessions
            </p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="one-on-one">One-on-One</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={setEditingSession}
              onDelete={handleDeleteSession}
            />
          ))}
        </div>
      </main>

      {editingSession && (
        <Dialog open={true} onOpenChange={() => setEditingSession(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Session</DialogTitle>
              <DialogDescription>
                Update the session details below.
              </DialogDescription>
            </DialogHeader>
            <SessionForm
              initialData={editingSession}
              onSubmit={handleEditSession}
              onCancel={() => setEditingSession(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Sessioncrud;