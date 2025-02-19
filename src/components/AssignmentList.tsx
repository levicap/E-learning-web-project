import { Pencil, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { Assignment } from '@/types';
import { format } from 'date-fns';

interface AssignmentListProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-500',
  draft: 'bg-yellow-500',
  archived: 'bg-gray-500',
};

export default function AssignmentList({
  assignments,
  onEdit,
  onDelete,
}: AssignmentListProps) {
  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No assignments available for this lesson.
            </p>
          </CardContent>
        </Card>
      ) : (
        assignments.map((assignment) => (
          <Card key={assignment.id} className="group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg font-semibold">
                    {assignment.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[assignment.status]} text-white`}
                  >
                    {assignment.status}
                  </Badge>
                </div>
                <CardDescription className="mt-1 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {assignment.points} points
                  </div>
                </CardDescription>
              </div>
              <div className="flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(assignment)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this assignment? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(assignment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{assignment.description}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}