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
export default function TimerComponent() {
    const [timer, setTimer] = useState(1800);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
  
    useEffect(() => {
      if (isTimerRunning && timer > 0) {
        const interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
      } else if (timer === 0) {
        setIsTimerRunning(false);
      }
    }, [isTimerRunning, timer]);
  
    const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    return (
      <Card className="p-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center space-y-6">
            <div className="relative transform transition-all duration-300 hover:scale-105">
              <div className="text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text font-mono">
                {formatTime(timer)}
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 -z-10 rounded-xl opacity-50" />
            </div>
            <Progress value={(timer / 1800) * 100} className="h-3" />
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={cn(
                  "w-40 transition-all duration-300 transform hover:scale-105",
                  isTimerRunning ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-gradient-to-r from-green-500 to-emerald-500"
                )}
              >
                <Timer className="w-4 h-4 mr-2" />
                {isTimerRunning ? 'Pause' : 'Start'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setTimer(1800)} 
                className="w-40 transform transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Study Session Presets</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { time: 15, label: 'Quick Review' },
                { time: 25, label: 'Pomodoro' },
                { time: 45, label: 'Deep Focus' },
                { time: 60, label: 'Full Session' },
              ].map(({ time, label }) => (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => setTimer(time * 60)}
                  className="h-24 flex flex-col items-center justify-center transform transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                >
                  <Hourglass className="w-6 h-6 mb-2" />
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-500">{time} min</div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }