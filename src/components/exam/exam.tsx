import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Brain, Send, ChevronLeft, ChevronRight, Clock, CheckCircle2, Download, Sparkles, Notebook as Robot, Trophy, Zap, CircuitBoard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  type: "quiz";
  answer: string;
  options: string[];
  timeLimit: number;
}

function Exam() {
  // Retrieve both courseId and courseName passed from the course content page.
  const { state } = useLocation();
  const courseId = state?.courseId;
  const initialCourseName = state?.courseName || "ReactJS Course";

  // Exam state variables.
  const [questions, setQuestions] = useState<Question[]>([]);
  // Set the course name based on the passed state.
  const [courseName, setCourseName] = useState(initialCourseName);
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(180);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  // Start a question timer.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && !completed && questionTimer > 0) {
      timer = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            handleNextQuestion();
            return questions[currentQuestion + 1]?.timeLimit || 180;
          }
          return prev - 1;
        });
      }, 1000);

      // Show warning at 30 seconds remaining.
      if (questionTimer === 30) {
        setShowWarning(true);
        toast({
          title: "Time running out!",
          description: "30 seconds remaining for this question",
          variant: "destructive"
        });
      }
    }
    return () => clearInterval(timer);
  }, [started, completed, questionTimer, currentQuestion, questions, toast]);

  // Compute the percentage score.
  const calculatePercentageScore = () => {
    return Math.round((score / questions.length) * 100);
  };

  // Format seconds to m:ss.
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Fetch quiz questions from the backend.
  const fetchExamQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/exam/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Use the dynamic courseId from the location state.
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      // Map the received questions to your internal format.
      const fetchedQuestions = data.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        type: q.type,
        answer: q.answer,
        options: q.options,
        timeLimit: 180  // or use a provided timeLimit if available.
      }));

      setQuestions(fetchedQuestions);
      setQuestionTimer(fetchedQuestions[0]?.timeLimit || 180);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exam questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to generate the certificate.
  const generateCertificateDownload = async () => {
    try {
      // Now pass the dynamic courseName as well.
      const res = await fetch("http://localhost:5000/api/certificates/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: studentName, course: courseName })
      });

      if (!res.ok) {
        throw new Error("Failed to generate certificate");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  // Handle exam start.
  const handleStart = async () => {
    if (!studentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name to start the exam",
        variant: "destructive"
      });
      return;
    }
    await fetchExamQuestions();
    setStarted(true);
  };

  // Handle an answer submission.
  const handleAnswer = (selectedOption: string) => {
    const currentQ = questions[currentQuestion];
    const qId = currentQ.id;

    // If the question has not been answered yet.
    if (!answeredQuestions[qId]) {
      if (selectedOption.trim().toLowerCase() === currentQ.answer.trim().toLowerCase()) {
        setScore(prev => prev + 1);
      }
      setAnsweredQuestions(prev => ({ ...prev, [qId]: true }));
      toast({
        title: "Answer saved",
        description: "Your answer has been recorded",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      });
    }
  };

  // Move to the next question.
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionTimer(questions[currentQuestion + 1].timeLimit);
      setShowWarning(false);
    } else {
      handleSubmit();
    }
  };

  // Submit the exam.
  const handleSubmit = async () => {
    const finalPercentage = calculatePercentageScore();
    setCompleted(true);

    toast({
      title: "Exam Completed!",
      description: `Your score: ${finalPercentage}%`,
      icon: <Trophy className="h-4 w-4 text-yellow-500" />
    });

    // Generate a certificate if the score is above or equal to 50%.
    if (finalPercentage >= 50) {
      await generateCertificateDownload();
    }
  };

  // Render the welcome screen before exam begins.
  if (!started) {
    return (
      <div className="min-h-screen ai-grid-bg p-4 mt-20">
        <div className="max-w-md mx-auto">
          <Card className="glass-effect glow card-hover border-none">
            <CardHeader>
              <motion.div className="flex items-center justify-center space-x-4 mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <CircuitBoard className="h-10 w-10 text-blue-500" />
                <Brain className="h-10 w-10 text-purple-500" />
                <Zap className="h-10 w-10 text-pink-500" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                AI-Powered Examination
              </CardTitle>
              <CardDescription className="text-center mt-4 text-lg text-primary/60">
                Experience next-generation adaptive testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg text-primary/80">Student Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="glass-effect border-none text-black placeholder:text-black/50 py-6"
                  />
                </div>
                <Button
                  onClick={handleStart}
                  className="w-full glass-effect hover:bg-primary/20 border-none text-white py-6 group transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Begin AI Assessment
                </Button>
                {loading && <p className="text-center text-primary mt-4">Loading questions...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the results screen after exam completion.
  if (completed) {
    return (
      <div className="min-h-screen ai-grid-bg p-4 mt-20">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect glow card-hover border-none">
            <CardHeader className="text-center">
              <motion.div className="flex justify-center mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 360] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <Trophy className="h-20 w-20 text-yellow-500 floating" />
              </motion.div>
              <CardTitle className="text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Exam Completed!
              </CardTitle>
              <CardDescription className="text-xl mt-4 text-primary/80">
                Congratulations, {studentName}!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <motion.div className="text-center space-y-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <div className="relative">
                  <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    {calculatePercentageScore()}%
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg opacity-20 blur"></div>
                </div>
                <p className="text-lg text-primary/60">Final Score</p>
              </motion.div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => {
                    // Reset exam state for another attempt.
                    setStarted(false);
                    setCompleted(false);
                    setCurrentQuestion(0);
                    setAnsweredQuestions({});
                    setQuestions([]);
                    setScore(0);
                  }}
                  variant="outline"
                  className="glass-effect hover:bg-primary/10 border-none text-black/80 py-6 group transition-all duration-300"
                >
                  <Robot className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Take Another Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the main exam view.
  return (
    <div className="min-h-screen ai-grid-bg p-4 mt-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect glow card-hover border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="text-primary/60">Candidate</p>
                  <p className="text-xl font-medium text-black">{studentName}</p>
                </div>
                <motion.div className={`flex items-center gap-3 ${showWarning ? 'text-red-500' : 'text-primary'}`}
                  animate={{ scale: showWarning ? [1, 1.1, 1] : 1, opacity: showWarning ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: showWarning ? Infinity : 0 }}>
                  <Clock className="w-6 h-6" />
                  <span className="font-mono text-xl">{formatTime(questionTimer)}</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-3">
          <div className="flex justify-between text-primary/60">
            <span>Progress</span>
            <span>{currentQuestion + 1} of {questions.length}</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-3 progress-bar" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}>
            <Card className="glass-effect glow card-hover border-none">
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div>
                    <p className="text-primary/60 mb-2">Question {currentQuestion + 1}</p>
                    <h2 className="text-2xl font-semibold text-black">{questions[currentQuestion].question}</h2>
                  </div>
                  <RadioGroup value={undefined} onValueChange={handleAnswer} className="space-y-4">
                    {questions[currentQuestion].options.map(option => (
                      <motion.div key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-effect rounded-lg p-4 hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="text-lg text-black/90">{option}</Label>
                        </div>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-6">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => {
              setCurrentQuestion(prev => prev - 1);
              setQuestionTimer(questions[currentQuestion - 1].timeLimit);
            }}
            className="glass-effect hover:bg-primary/10 border-none text-black/80 py-6 px-8 group transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit}
              className="glass-effect hover:bg-green-500/20 border-none text-white py-6 px-8 group transition-all duration-300">
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              Submit Exam
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}
              className="glass-effect hover:bg-primary/20 border-none text-white py-6 px-8 group transition-all duration-300">
              Next
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;
