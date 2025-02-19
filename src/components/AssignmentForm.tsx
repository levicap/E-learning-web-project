import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Assignment } from '@/types';

interface AssignmentFormProps {
  lessonId: string;
  assignment?: Assignment | null;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
}

export default function AssignmentForm({
  lessonId,
  assignment,
  onClose,
  onSave,
}: AssignmentFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState('100');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description);
      setDueDate(assignment.dueDate);
      setPoints(assignment.points.toString());
      setStatus(assignment.status);
    }
  }, [assignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: assignment?.id || Math.random().toString(36).substr(2, 9),
      lessonId,
      title,
      description,
      due
    }
  }
}