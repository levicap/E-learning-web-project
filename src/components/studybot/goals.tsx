import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StudyGoal } from '@/types';

interface StudyGoalsProps {
  goals: StudyGoal[];
  onAddGoal: (goal: Omit<StudyGoal, 'id'>) => void;
  onToggleGoal: (id: string) => void;
}

export function StudyGoals({ goals, onAddGoal, onToggleGoal }: StudyGoalsProps) {
  const [newGoal, setNewGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim() && targetDate) {
      onAddGoal({
        title: newGoal.trim(),
        targetDate: new Date(targetDate),
        completed: false,
      });
      setNewGoal('');
      setTargetDate('');
    }
  };

  return (
    <Card className="border-2 border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Study Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New goal..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <Button onClick={handleAddGoal} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 w-6", goal.completed && "bg-green-100")}
                  onClick={() => onToggleGoal(goal.id)}
                >
                  {goal.completed ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
                <span className={cn(goal.completed && "line-through text-gray-500")}>
                  {goal.title}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}