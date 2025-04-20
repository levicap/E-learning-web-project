import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Clock, MessageSquare, Target, Award, ChevronRight, RotateCcw, CheckCircle, XCircle, Timer, Sparkles, ArrowLeft, ArrowRight, Hourglass, GraduationCap, Briefcase, Book, Plus, Save, Trash2, Star, Calendar as CalendarIcon, Bot, Download, Lightbulb, Magnet as Magic, CalendarDays 
} from "lucide-react";
import { cn } from '@/lib/utils';
export default function GoalsComponent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ text: '', description: '', deadline: new Date(), priority: 'medium' as const });
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  
  const addGoal = () => {
    if (!newGoal.text.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now().toString(),
      text: newGoal.text,
      description: newGoal.description,
      deadline: newGoal.deadline,
      completed: false,
      priority: newGoal.priority
    }]);
    setNewGoal({ text: '', description: '', deadline: new Date(), priority: 'medium' });
    setIsGoalDialogOpen(false);
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex gap-2">
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Study Goal</DialogTitle>
                <DialogDescription>
                  Set a new goal for your study journey
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="Enter your goal"
                    value={newGoal.text}
                    onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Add more details"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal({ ...newGoal, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newGoal.deadline ? format(newGoal.deadline, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newGoal.deadline}
                        onSelect={(date) => date && setNewGoal({ ...newGoal, deadline: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addGoal} className="bg-gradient-to-r from-green-500 to-emerald-500">
                  <Save className="w-4 h-4 mr-2" />
                  Save Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg transform transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                goal.priority === 'high' 
                  ? "bg-gradient-to-r from-red-50 to-orange-50"
                  : goal.priority === 'medium'
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50"
                  : "bg-gradient-to-r from-green-50 to-teal-50"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g));
                }}
                className={cn(
                  "transition-all duration-300",
                  goal.completed && "text-green-500"
                )}
              >
                <CheckCircle className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className={cn(
                  "font-semibold",
                  goal.completed && "line-through text-gray-500"
                )}>
                  {goal.text}
                </div>
                {goal.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {goal.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  goal.priority === 'high' 
                    ? "bg-red-100 text-red-600"
                    : goal.priority === 'medium'
                    ? "bg-purple-100 text-purple-600"
                    : "bg-green-100 text-green-600"
                )}>
                  {goal.priority}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4" />
                  {format(goal.deadline, "MMM d, yyyy")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-red-500"
                  onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
