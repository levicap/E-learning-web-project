import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cpu, Code, Microscope, Stethoscope, Scale, Palette, GraduationCap, Building2, Users, 
  Rocket, Sparkles, Send, RefreshCw, Trophy, Clock, Sun, Moon, Robot, MessageSquare
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

const interviewTypes = {
  coding: { icon: <Code className="w-5 h-5" /> },
  science: { icon: <Microscope className="w-5 h-5" /> },
  medical: { icon: <Stethoscope className="w-5 h-5" /> },
  legal: { icon: <Scale className="w-5 h-5" /> },
  creative: { icon: <Palette className="w-5 h-5" /> },
  academic: { icon: <GraduationCap className="w-5 h-5" /> },
  business: { icon: <Building2 className="w-5 h-5" /> },
  behavioral: { icon: <Users className="w-5 h-5" /> },
};

function Interview() {
  // Main States
  const [interviewType, setInterviewType] = useState("coding");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [overallEvaluation, setOverallEvaluation] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for Timer, Hints, and Notifications
  const [timeLeft, setTimeLeft] = useState(60);
  const [notification, setNotification] = useState("");
  const [hint, setHint] = useState("");
  const [runningCode, setRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");

  // Virtual Coach State
  const [coachMessage, setCoachMessage] = useState("Welcome! Let's ace this interview together!");

  // Theme State
  const [theme, setTheme] = useState("light"); // "light" or "dark"

  // Toast State for notifications (includes an icon)
  const [toast, setToast] = useState({ visible: false, message: "", icon: null });

  // Ref for timer
  const timerRef = useRef(null);

  // Load Interview when interviewType changes
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await axios.post("http://localhost:5000/api/ai/generate-interview", { interviewType });
        setQuestions(res.data.questions);
        setCurrentQuestionIndex(0);
        setChatHistory([]);
        setAnswers([]);
        setOverallEvaluation("");
        setIsComplete(false);
        setUserResponse("");
        setHint("");
        setCodeOutput("");
        setTimeLeft(60); // Reset timer
        setCoachMessage("New interview started. You got this!");
      } catch (error) {
        console.error("Error fetching interview questions:", error);
      }
    }
    fetchQuestions();
  }, [interviewType]);

  // Timer logic: Reset timer for each new question
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isComplete) {
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          if (prev <= 11) setNotification("Hurry up! Time is almost up.");
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, isComplete]);

  // Auto-submit when timer ends
  const handleAutoSubmit = async () => {
    // Create a default response if userResponse is empty
    const defaultResponse = userResponse.trim() ? userResponse : "[No Response]";
    // Display toast with icon (using Cpu icon here)
    setToast({ 
      visible: true, 
      message: "Time's up! Moving to next question.", 
      icon: <Cpu className="w-6 h-6 text-blue-500" /> 
    });
    // Hide the toast after 3 seconds
    setTimeout(() => setToast({ visible: false, message: "", icon: null }), 3000);

    await handleSubmit(defaultResponse);
    setCoachMessage("Time's up! Let's move on to the next question.");
  };

  // Modified handleSubmit accepts an optional overrideResponse
  const handleSubmit = async (overrideResponse = null) => {
    const responseToUse = overrideResponse !== null ? overrideResponse : userResponse;
    // Remove the guard so auto-submission works as expected
    if (!responseToUse.trim()) return;
    setLoading(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const res = await axios.post("http://localhost:5000/api/ai/evaluate-response", {
        interviewType,
        question: currentQuestion,
        response: responseToUse,
      });
      const immediateFeedback = res.data.feedback;

      setChatHistory((prev) => [
        ...prev,
        { type: "question", content: currentQuestion },
        { type: "answer", content: responseToUse },
        { type: "feedback", content: immediateFeedback },
      ]);

      setAnswers((prevAnswers) => {
        const updatedAnswers = [
          ...prevAnswers,
          { question: currentQuestion, response: responseToUse, feedback: immediateFeedback },
        ];

        if (currentQuestionIndex === questions.length - 1) {
          axios.post("http://localhost:5000/api/ai/evaluate-interview", {
            interviewType,
            answers: updatedAnswers,
          })
            .then((overallEvalRes) => {
              setOverallEvaluation(overallEvalRes.data.overallEvaluation);
              setIsComplete(true);
              setCoachMessage("Interview complete! Review your performance below.");
            })
            .catch((error) => {
              console.error("Error evaluating interview:", error);
            });
        }
        return updatedAnswers;
      });

      // Clear inputs and update coach message
      setUserResponse("");
      setHint("");
      setCodeOutput("");
      setCoachMessage("Well done! Let's proceed to the next question.");

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error evaluating response:", error);
    }
    setLoading(false);
  };

  // Save interview state for later resumption
  const saveInterview = () => {
    const interviewState = {
      interviewType,
      questions,
      currentQuestionIndex,
      chatHistory,
      answers,
      overallEvaluation,
      isComplete,
      userResponse,
      hint,
      codeOutput,
      timeLeft,
    };
    localStorage.setItem("savedInterview", JSON.stringify(interviewState));
    alert("Interview saved! You can resume it later.");
    setCoachMessage("Your progress has been saved. Come back anytime!");
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setCoachMessage("Theme updated!");
  };
  const handleRunCode = async () => {
    setRunningCode(true);
    try {
      const res = await axios.post("http://localhost:5000/api/execute-code", { code: userResponse });
      setCodeOutput(res.data.output);
      setCoachMessage("Great! Let's see how your code performs.");
    } catch (error) {
      console.error("Error running code:", error);
      setCodeOutput("Error running code.");
    }
    setRunningCode(false);
  };
// Fetch hint from API
const fetchHint = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/ai/get-hint", {
        interviewType,
        question: questions[currentQuestionIndex],
      });
      setHint(res.data.hint);
      setCoachMessage("Here's a hint to help you out!");
    } catch (error) {
      console.error("Error fetching hint:", error);
      setHint("No hint available at this time.");
    }
  };
    

  // Calculate progress percentage
  const progressPercent = questions.length ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  return (
    <div className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen p-4 relative overflow-hidden`}>
      {/* Main container with increased width and top margin */}
      <div className="w-full max-w-8xl mx-auto flex flex-col items-center justify-center mt-20">
        <Card className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} w-full max-w-4xl backdrop-blur-xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} shadow-xl relative z-10`}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Cpu className="w-12 h-12 text-indigo-600" />
                <motion.div 
                  className="absolute inset-0" 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                  transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="w-12 h-12 text-blue-500" />
                </motion.div>
              </div>
              <div>
                <CardTitle className="text-4xl font-bold">AI Interview Nexus</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Advanced interview simulation powered by AI
                </CardDescription>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <Tabs value={interviewType} onValueChange={(value) => setInterviewType(value)}>
                <TabsList className="inline-flex w-auto p-1 bg-gray-100/80 rounded-lg">
                  {Object.entries(interviewTypes).map(([key, value]) => (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {value.icon}
                      <span className="capitalize">{key}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            {/* Progress Bar and Timer */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-sm mt-1">
                {currentQuestionIndex} / {questions.length} questions answered
              </p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm font-bold text-red-600">Time Left: {timeLeft}s</p>
                {notification && <p className="text-sm text-yellow-600">{notification}</p>}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <AnimatePresence>
                {chatHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: item.type === "answer" ? 20 : -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 ${item.type === "question" ? "bg-gray-50 p-4 rounded-lg border" : item.type === "answer" ? "bg-blue-50 p-4 rounded-lg ml-4 border" : "bg-green-50 p-4 rounded-lg border"}`}
                  >
                    <p>{item.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Current Question */}
              {!isComplete && questions.length > 0 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <p>{questions[currentQuestionIndex]}</p>
                  {hint && (
                    <div className="mt-2 p-2 bg-yellow-100 border rounded">
                      <p className="text-sm">{hint}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Overall Evaluation */}
              {isComplete && overallEvaluation && (
                <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex gap-3">
                    <Trophy className="w-6 h-6 text-blue-600" />
                    <div>
                      <AlertTitle className="text-2xl font-bold">Interview Complete! 🎉</AlertTitle>
                      <AlertDescription>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                          <p className="whitespace-pre-line">{overallEvaluation}</p>
                          <div className="flex items-center justify-end mt-4">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="ml-2">Interview Duration: 15 minutes</span>
                          </div>
                        </motion.div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {!isComplete ? (
              <>
                {interviewType === "coding" ? (
                  <>
                    <Textarea
                      placeholder="Write your code here..."
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      className="w-full bg-gray-900 text-green-300 font-mono border-gray-700 placeholder:text-gray-500"
                      rows={10}
                    />
                    <div className="flex gap-4">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white"
                        onClick={handleRunCode}
                        disabled={runningCode}
                      >
                        {runningCode ? "Running Code..." : "Run Code"}
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white"
                        onClick={() => handleSubmit()}
                        disabled={loading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? "Evaluating..." : "Submit Response"}
                      </Button>
                    </div>
                    {codeOutput && (
                      <div className="mt-4 bg-gray-800 text-green-200 p-3 rounded-lg">
                        <pre>{codeOutput}</pre>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Textarea
                      placeholder="Type your response here..."
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
                    />
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white"
                      onClick={() => handleSubmit()}
                      disabled={loading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? "Evaluating..." : "Submit Response"}
                    </Button>
                  </>
                )}
                <div className="mt-4 flex justify-between">
                  <Button className="bg-gray-300 hover:bg-gray-400 text-gray-900" onClick={fetchHint}>
                    Show Hint
                  </Button>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={saveInterview}>
                    Save Interview
                  </Button>
                </div>
              </>
            ) : (
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start New Interview
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Virtual Coach Avatar and Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 p-4 bg-white rounded-lg shadow-lg border"
      >
        <Cpu className="w-12 h-12 text-indigo-600" />
        <p className="text-sm">{coachMessage}</p>
      </motion.div>

      {/* Toast Notification - Positioned on left with a bot icon */}
      {toast.visible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg"
        >
          <MessageSquare className="w-6 h-6 text-green-500" />
          {toast.icon}
          <span>{toast.message}</span>
        </motion.div>
      )}

      {/* Performance Summary Placeholder */}
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold mb-2">Performance Summary</h3>
          <p>Here you can integrate interactive charts and badges to review your performance.</p>
        </motion.div>
      )}
    </div>
  );
}

export default Interview;
