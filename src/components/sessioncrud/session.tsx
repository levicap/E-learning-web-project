import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  CalendarIcon,
  Clock,
  Users,
  Trash2,
  PencilIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import SidebarContent from './sidabar';

interface TutoringSession {
  _id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  maxStudents: number;
  price: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  tutor: {
    name: string;
    email?: string;
  } | null;
}

interface FormData {
  title: string;
  description: string;
  type: string;
  date: Date | null;
  time: string;
  duration: number;
  maxStudents: number;
  price: number;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  type: 'online',
  date: null,
  time: '',
  duration: 60,
  maxStudents: 1,
  price: 0,
};

const SessionForm = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) => (
  <div className="grid gap-4 py-4">
    <div className="grid gap-2">
      <Label htmlFor="title">Title *</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="type">Type *</Label>
      <Select
        value={formData.type}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, type: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="in-person">In-Person</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="grid gap-2">
      <Label>Date *</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !formData.date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={formData.date || undefined}
            onSelect={(date) =>
              setFormData((prev) => ({ ...prev, date: date || null }))
            }
          />
        </PopoverContent>
      </Popover>
    </div>
    <div className="grid gap-2">
      <Label htmlFor="time">Time *</Label>
      <Input
        id="time"
        type="time"
        value={formData.time}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, time: e.target.value }))
        }
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="duration">Duration (minutes) *</Label>
      <Input
        id="duration"
        type="number"
        min="30"
        step="15"
        value={formData.duration}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            duration: parseInt(e.target.value) || 60,
          }))
        }
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="maxStudents">Max Students *</Label>
      <Input
        id="maxStudents"
        type="number"
        min="1"
        value={formData.maxStudents}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            maxStudents: parseInt(e.target.value) || 1,
          }))
        }
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="price">Price ($) *</Label>
      <Input
        id="price"
        type="number"
        min="0"
        step="5"
        value={formData.price}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            price: parseInt(e.target.value) || 0,
          }))
        }
      />
    </div>
  </div>
);

function Sessioncrud() {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { toast } = useToast();
  const { user } = useUser();

  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const validateForm = () => {
    if (!formData.title || !formData.date || !formData.time || formData.price < 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      setError('Failed to fetch sessions');
      toast({
        title: 'Error',
        description: 'Failed to fetch sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...formData,
          date: formData.date ? formData.date.toISOString() : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create session');
      await fetchSessions();
      setCreateDialogOpen(false);
      resetFormData();
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSession = async () => {
    if (!selectedSession || !validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/sessions/${selectedSession._id}`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            ...formData,
            date: formData.date ? formData.date.toISOString() : null,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to update session');
      await fetchSessions();
      setEditDialogOpen(false);
      setSelectedSession(null);
      resetFormData();
      toast({
        title: 'Success',
        description: 'Session updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Failed to delete session');
      await fetchSessions();
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user]);

  const handleSelectSession = (session: TutoringSession) => {
    setSelectedSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      type: session.type,
      date: new Date(session.date),
      time: session.time,
      duration: session.duration,
      maxStudents: session.maxStudents,
      price: session.price,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 mt-20 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Tutoring Sessions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your tutoring sessions
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) resetFormData();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new tutoring session
                </DialogDescription>
              </DialogHeader>
              <SessionForm formData={formData} setFormData={setFormData} />
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSession} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) {
                setSelectedSession(null);
                resetFormData();
              }
            }}
          >
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Session</DialogTitle>
                <DialogDescription>
                  Update the details of your tutoring session
                </DialogDescription>
              </DialogHeader>
              <SessionForm formData={formData} setFormData={setFormData} />
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateSession} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && !sessions.length ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session._id} className="relative group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {session.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        session.status === 'scheduled'
                          ? 'default'
                          : session.status === 'completed'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(session.date), 'PPP')} at {session.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {session.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {session.maxStudents} students max
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSelectSession(session)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteSession(session._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default Sessioncrud;
