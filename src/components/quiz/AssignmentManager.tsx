import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AssignmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  files: AssignmentFile[];
}

interface AssignmentManagerProps {
  lessonId: string;
}

export default function AssignmentManager({ lessonId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Build a Portfolio',
      description: 'Create a personal portfolio website using HTML and CSS',
      dueDate: '2024-04-01',
      maxPoints: 100,
      allowedFileTypes: ['.pdf', '.zip', '.html'],
      maxFileSize: 10,
      files: [],
    },
  ]);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(
    null
  );
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    allowedFileTypes: ['.pdf', '.zip', '.html'],
    maxFileSize: 10,
    files: [],
  });

  const handleAddAssignment = () => {
    if (newAssignment.title && newAssignment.description) {
      setAssignments([
        ...assignments,
        {
          id: Date.now().toString(),
          ...newAssignment,
        },
      ]);
      setNewAssignment({
        title: '',
        description: '',
        dueDate: '',
        maxPoints: 100,
        allowedFileTypes: ['.pdf', '.zip', '.html'],
        maxFileSize: 10,
        files: [],
      });
    }
  };

  const handleUpdateAssignment = () => {
    if (editingAssignment) {
      setAssignments(
        assignments.map((assignment) =>
          assignment.id === editingAssignment.id
            ? editingAssignment
            : assignment
        )
      );
      setEditingAssignment(null);
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
    setDeleteAssignmentId(null);
  };

  const handleFileTypeChange = (value: string) => {
    const types = value.split(',').map((type) => type.trim());
    setNewAssignment({
      ...newAssignment,
      allowedFileTypes: types,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assignments</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Set up a new assignment with file submission requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          dueDate: e.target.value,
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPoints">Maximum Points</Label>
                    <Input
                      id="maxPoints"
                      type="number"
                      value={newAssignment.maxPoints}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          maxPoints: parseInt(e.target.value),
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allowedFileTypes">
                      Allowed File Types (comma-separated)
                    </Label>
                    <Input
                      id="allowedFileTypes"
                      value={newAssignment.allowedFileTypes.join(', ')}
                      onChange={(e) => handleFileTypeChange(e.target.value)}
                      placeholder=".pdf, .zip, .html"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize">
                      Maximum File Size (MB)
                    </Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={newAssignment.maxFileSize}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          maxFileSize: parseInt(e.target.value),
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAssignment}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">{assignment.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {assignment.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center px-2 py-1 bg-primary/10 rounded-md">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due: {assignment.dueDate}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-md">
                    {assignment.maxPoints} points
                  </span>
                  <span className="flex items-center px-2 py-1 bg-primary/10 rounded-md">
                    <FileText className="w-4 h-4 mr-1" />
                    {assignment.allowedFileTypes.join(', ')}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-md">
                    Max {assignment.maxFileSize}MB
                  </span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="h-20 w-full border-dashed">
                    <Upload className="w-4 h-4 mr-2" />
                    Drop files here or click to upload
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingAssignment(assignment)}
                  className="hover:bg-primary/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteAssignmentId(assignment.id)}
                  className="hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteAssignmentId}
        onOpenChange={() => setDeleteAssignmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteAssignmentId && handleDeleteAssignment(deleteAssignmentId)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingAssignment && (
        <Dialog
          open={!!editingAssignment}
          onOpenChange={() => setEditingAssignment(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingAssignment.title}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      title: e.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingAssignment.description}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      description: e.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingAssignment.dueDate}
                    onChange={(e) =>
                      setEditingAssignment({
                        ...editingAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxPoints">Maximum Points</Label>
                  <Input
                    id="edit-maxPoints"
                    type="number"
                    value={editingAssignment.maxPoints}
                    onChange={(e) =>
                      setEditingAssignment({
                        ...editingAssignment,
                        maxPoints: parseInt(e.target.value),
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-allowedFileTypes">
                    Allowed File Types (comma-separated)
                  </Label>
                  <Input
                    id="edit-allowedFileTypes"
                    value={editingAssignment.allowedFileTypes.join(', ')}
                    onChange={(e) => {
                      const types = e.target.value
                        .split(',')
                        .map((type) => type.trim());
                      setEditingAssignment({
                        ...editingAssignment,
                        allowedFileTypes: types,
                      });
                    }}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxFileSize">
                    Maximum File Size (MB)
                  </Label>
                  <Input
                    id="edit-maxFileSize"
                    type="number"
                    value={editingAssignment.maxFileSize}
                    onChange={(e) =>
                      setEditingAssignment({
                        ...editingAssignment,
                        maxFileSize: parseInt(e.target.value),
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}