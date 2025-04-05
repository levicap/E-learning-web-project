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

type ExamType = 'professional' | 'academic' | 'general';
type Flashcard = {
  id: string;
  question: string;
  answer: string;
  category: string;
  mastered: boolean;
  aiGenerated?: boolean;
};

type Goal = {
  id: string;
  text: string;
  completed: boolean;
  deadline: Date;
  description?: string;
  priority: 'low' | 'medium' | 'high';
};

function Study() {
  const [examType, setExamType] = useState<ExamType>('professional');
  const [timer, setTimer] = useState(1800);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', content: string, downloadable?: boolean }[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ text: '', description: '', deadline: new Date(), priority: 'medium' as const });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCardMode, setNewCardMode] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', category: '' });
  const [date, setDate] = useState<Date>();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);

  const examTypes = {
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

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: '1', question: "What is CISSP?", answer: "Certified Information Systems Security Professional - A certification for IT security professionals", category: "Security", mastered: false },
    { id: '2', question: "What is the PMBOK?", answer: "Project Management Body of Knowledge - A comprehensive guide for project management", category: "Project Management", mastered: false },
    { id: '3', question: "What is Risk Management?", answer: "The process of identifying, assessing and controlling threats to an organization's capital and earnings", category: "Management", mastered: false },
  ]);

  // Use exam endpoints to generate flashcards for the exam.
  const generateExamFlashcards = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/ai/generate-exam", { examType });
      // Assume the API returns { examType, questions: string[] }
      const examQuestions: string[] = response.data.questions;
      const newCards: Flashcard[] = examQuestions.map((q, idx) => ({
        id: Date.now().toString() + idx,
        question: q,
        answer: "Your answer here", // Placeholder answer; you might allow users to edit later.
        category: examType,
        mastered: false,
        aiGenerated: true
      }));
      setFlashcards(prev => [...prev, ...newCards]);
    } catch (error) {
      console.error("Error generating exam flashcards", error);
    }
  };

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

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setChatMessages([...chatMessages, { role: 'user', content: message }]);
    setQuestionsAsked(prev => prev + 1);
    setStudyStreak(prev => prev + 1);
    
    // Simulated AI response with downloadable content
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

  const addGoal = () => {
    if (!newGoal.text.trim()) return;
    
    setGoals([...goals, {
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

  const handleCardFlip = () => {
    setIsCardFlipped(true);
    setShowAnswer(!showAnswer);
    setTimeout(() => setIsCardFlipped(false), 300);
  };

  const addNewCard = () => {
    if (!newCard.question.trim() || !newCard.answer.trim() || !newCard.category.trim()) return;
    
    setFlashcards([...flashcards, {
      id: Date.now().toString(),
      ...newCard,
      mastered: false
    }]);
    setNewCard({ question: '', answer: '', category: '' });
    setIsFlashcardDialogOpen(false);
  };

  const toggleCardMastery = (id: string) => {
    setFlashcards(cards => 
      cards.map(card => 
        card.id === id ? { ...card, mastered: !card.mastered } : card
      )
    );
  };

  const filteredFlashcards = selectedCategory === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.category === selectedCategory);

  const categories = ['all', ...new Set(flashcards.map(card => card.category))];

  const ExamIcon = examTypes[examType].icon;

  // Example: Replace the original AI flashcards generation with a call to the exam endpoint.
  // When the user clicks "Generate AI Cards," we call generateExamFlashcards.
  // You can also add similar functions to fetch hints using your exam hint endpoint.
  
  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <ExamIcon className={`w-10 h-10 bg-gradient-to-r ${examTypes[examType].color} text-white p-2 rounded-lg`} />
            <span className={`bg-gradient-to-r ${examTypes[examType].color} text-transparent bg-clip-text`}>
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
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2 p-6 shadow-lg">
                <div className="h-[600px] overflow-y-auto mb-4 space-y-4 scrollbar-thin">
                  <AnimatePresence>
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "p-4 rounded-lg flex items-start gap-3",
                          msg.role === 'user' 
                            ? "bg-gradient-to-r from-indigo-50 to-blue-50 ml-12" 
                            : "bg-gradient-to-r from-purple-50 to-pink-50 mr-12"
                        )}
                      >
                        {msg.role === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          {msg.content}
                          {msg.downloadable && (
                            <Button variant="outline" size="sm" className="mt-2">
                              <Download className="w-4 h-4 mr-2" />
                              Download Notes
                            </Button>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Ask about ${examTypes[examType].examples.join(', ')}...`}
                    className="focus:ring-2 focus:ring-indigo-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className={`bg-gradient-to-r ${examTypes[examType].color} hover:opacity-90 text-white`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              <Card className="p-6 space-y-6">
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Study Progress
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                    <div className="text-sm text-gray-600">Questions Asked</div>
                    <div className="text-2xl font-bold text-indigo-600">{questionsAsked}</div>
                    <Progress value={Math.min(questionsAsked * 5, 100)} className="h-1 mt-2" />
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                    <div className="text-sm text-gray-600">Study Streak</div>
                    <div className="text-2xl font-bold text-purple-600">{studyStreak} days</div>
                    <Progress value={Math.min(studyStreak * 10, 100)} className="h-1 mt-2" />
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                    <div className="text-sm text-gray-600">Mastered Flashcards</div>
                    <div className="text-2xl font-bold text-green-600">
                      {flashcards.filter(card => card.mastered).length} / {flashcards.length}
                    </div>
                    <Progress 
                      value={(flashcards.filter(card => card.mastered).length / flashcards.length) * 100} 
                      className="h-1 mt-2" 
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timer">
            <Card className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-6">
                  <div className="relative transform transition-all duration-300 hover:scale-105">
                    <div className="text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text font-mono">
                      {formatTime(timer)}
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 -z-10 rounded-xl opacity-50" />
                  </div>
                  <Progress 
                    value={(timer / 1800) * 100} 
                    className="h-3"
                  />
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={cn(
                        "w-40 transition-all duration-300 transform hover:scale-105",
                        isTimerRunning 
                          ? "bg-gradient-to-r from-red-500 to-pink-500" 
                          : "bg-gradient-to-r from-green-500 to-emerald-500"
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
                    {[{ time: 15, label: 'Quick Review' },
                      { time: 25, label: 'Pomodoro' },
                      { time: 45, label: 'Deep Focus' },
                      { time: 60, label: 'Full Session' }
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
          </TabsContent>

          <TabsContent value="flashcards">
            <Card className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    {/* Use exam endpoint to generate flashcards */}
                    <Button 
                      onClick={generateExamFlashcards} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Magic className="w-4 h-4 mr-2" />
                      Generate AI Cards
                    </Button>
                    <Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Flashcard</DialogTitle>
                          <DialogDescription>
                            Add a new flashcard to your study deck
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Question</Label>
                            <Input
                              placeholder="Enter your question"
                              value={newCard.question}
                              onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Answer</Label>
                            <Input
                              placeholder="Enter the answer"
                              value={newCard.answer}
                              onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                              placeholder="Enter a category"
                              value={newCard.category}
                              onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addNewCard} className="bg-gradient-to-r from-green-500 to-emerald-500">
                            <Save className="w-4 h-4 mr-2" />
                            Save Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <motion.div 
                  className={cn(
                    "relative perspective-1000 cursor-pointer",
                    isCardFlipped && "rotate-y-180"
                  )}
                  onClick={handleCardFlip}
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl shadow-lg min-h-[400px] flex flex-col justify-center items-center text-center transform transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {filteredFlashcards[currentCard]?.aiGenerated && (
                        <div className="px-2 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-medium flex items-center gap-1">
                          <Magic className="w-3 h-3" />
                          AI Generated
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardMastery(filteredFlashcards[currentCard].id);
                        }}
                        className={cn(
                          "transition-all duration-300",
                          filteredFlashcards[currentCard].mastered && "text-yellow-500"
                        )}
                      >
                        <Star className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="text-sm text-indigo-600 mb-4 font-semibold">
                      {filteredFlashcards[currentCard]?.category}
                    </div>
                    <div className="text-3xl font-semibold max-w-2xl">
                      {showAnswer ? filteredFlashcards[currentCard]?.answer : filteredFlashcards[currentCard]?.question}
                    </div>
                    <div className="absolute bottom-4 text-sm text-gray-500">
                      Click to flip
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentCard((prev) => prev === 0 ? filteredFlashcards.length - 1 : prev - 1);
                      setShowAnswer(false);
                    }}
                    className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500">
                    {currentCard + 1} of {filteredFlashcards.length}
                  </div>
                  <Button
                    onClick={() => {
                      setCurrentCard((prev) => prev === filteredFlashcards.length - 1 ? 0 : prev + 1);
                      setShowAnswer(false);
                    }}
                    className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
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
                            onValueChange={(value: 'low' | 'medium' | 'high') => 
                              setNewGoal({ ...newGoal, priority: value })
                            }
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
                          setGoals(goals.map(g => 
                            g.id === goal.id ? { ...g, completed: !g.completed } : g
                          ));
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
                          onClick={() => setGoals(goals.filter(g => g.id !== goal.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Study;
