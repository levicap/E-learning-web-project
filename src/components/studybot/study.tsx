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
import GoalsComponent from './goals';
import ExamChatFlowContainer from './chatexam';
import TimerComponent from './timer';
import FlashcardsComponent from './flashcard';
import Nodes from './nodes';


/* ===================================================
   TimerComponent
   =================================================== */


/* ===================================================
   FlashcardsComponent
   =================================================== */

/* ===================================================
   GoalsComponent
   =================================================== */

/* ===================================================
   Main Study Component
   =================================================== */
function Study() {
  const [examType, setExamType] = useState<ExamType>('professional');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', content: string, downloadable?: boolean }[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', question: "What is CISSP?", answer: "Certified Information Systems Security Professional - A certification for IT security professionals", category: "Security", mastered: false },
    { id: '2', question: "What is the PMBOK?", answer: "Project Management Body of Knowledge - A comprehensive guide for project management", category: "Project Management", mastered: false },
    { id: '3', question: "What is Risk Management?", answer: "The process of identifying, assessing and controlling threats to an organization's capital and earnings", category: "Management", mastered: false },
  ]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);

  const examTypesData = {
    professional: {
      icon: Briefcase,
      examples: ['CISSP', 'PMP', 'CFA', 'AWS Certified'],
      color: 'from-blue-600 to-indigo-600'
    },
    academic: {
      icon: GraduationCap,
      examples: ['Mathematics', 'Physics', 'Computer Science'],
      color: 'from-green-600 to-teal-600'
    },
    general: {
      icon: Book,
      examples: ['Language', 'Skills', 'Knowledge'],
      color: 'from-purple-600 to-pink-600'
    }
  };

  const ExamIcon = examTypesData[examType].icon;

  // Example simple chat function (this part remains from your original code)
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setQuestionsAsked(prev => prev + 1);
    setStudyStreak(prev => prev + 1);
    setTimeout(() => {
      const responses = [
        {
          role: 'bot' as const,
          content: `Here's a detailed explanation for ${examType} certification:`,
          downloadable: true
        },
        {
          role: 'bot' as const,
          content: "Would you like me to generate practice flashcards for this topic?",
          downloadable: false
        }
      ];
      setChatMessages(prev => [...prev, ...responses]);
    }, 1000);
    setMessage('');
  };

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <ExamIcon className={`w-10 h-10 bg-gradient-to-r ${examTypesData[examType].color} text-white p-2 rounded-lg`} />
            <span className={`bg-gradient-to-r ${examTypesData[examType].color} text-transparent bg-clip-text`}>
              Professional Exam Prep AI
            </span>
          </h1>
          <Select value={examType} onValueChange={(value: ExamType) => setExamType(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional Certifications</SelectItem>
              <SelectItem value="academic">Academic Exams</SelectItem>
              <SelectItem value="general">General Knowledge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {[ 
              { value: 'chat', icon: MessageSquare, label: 'AI Chat' },
              { value: 'timer', icon: Clock, label: 'Timer' },
              { value: 'flashcards', icon: Award, label: 'Flashcards' },
              { value: 'goals', icon: Target, label: 'Goals' },
              { value: 'Nodes', icon: Target, label: 'Nodes' },

            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 transition-all duration-200 hover:bg-indigo-50"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="chat">
            <ExamChatFlowContainer />
          </TabsContent>

          <TabsContent value="timer">
            <TimerComponent />
          </TabsContent>

          <TabsContent value="flashcards">
            <FlashcardsComponent examType={examType} flashcards={flashcards} setFlashcards={setFlashcards} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsComponent />
          </TabsContent>
          <TabsContent value="Nodes">
            <Nodes/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Study;
