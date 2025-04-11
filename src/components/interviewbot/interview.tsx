import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Cpu, Rocket, Sparkles, Send, RefreshCw, Trophy, Clock, MessageSquare, Brain, Lightbulb, Save, HelpCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

function renderOverallEvaluation(evaluation) {
  const lines = evaluation.split('\n').filter(line => line.trim() !== '');
  return lines.map((line, idx) => {
    const cleanedLine = line.replace(/\*\*/g, "");
    if (cleanedLine.startsWith("Key Strengths:")) {
      return (
        <motion.p 
          key={idx} 
          className="text-emerald-600 font-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          {cleanedLine}
        </motion.p>
      );
    }
    if (cleanedLine.startsWith("Weaknesses:")) {
      return (
        <motion.p 
          key={idx} 
          className="text-rose-600 font-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          {cleanedLine}
        </motion.p>
      );
    }
    return (
      <motion.p 
        key={idx}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.1 }}
      >
        {cleanedLine}
      </motion.p>
    );
  });
}

function Interview() {
  const [cvForm, setCvForm] = useState({
    jobRole: "",
    experience: "",
    education: "",
    projects: "",
    skills: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [useUpload, setUseUpload] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [overallEvaluation, setOverallEvaluation] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [notification, setNotification] = useState("");
  const [hint, setHint] = useState("");
  const [runningCode, setRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [coachMessage, setCoachMessage] = useState("Welcome! Let's ace this interview together!");
  const [theme, setTheme] = useState("light");
  const [toast, setToast] = useState({ visible: false, message: "", icon: null });
  const timerRef = useRef(null);

  useEffect(() => {
    console.log("Current question index:", currentQuestionIndex);
  }, [currentQuestionIndex]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        // Prepare payload based on CV form or uploaded CV
        const payload = useUpload 
          ? { cvFile } 
          : { cvDetails: cvForm };
        console.log("Fetching questions with payload:", payload);
        const res = await axios.post("http://localhost:5000/api/ai/generate-interview", payload);
        console.log("Received questions:", res.data.questions);
        setQuestions(res.data.questions);
        setCurrentQuestionIndex(0);
        setChatHistory([]);
        setAnswers([]);
        setOverallEvaluation("");
        setIsComplete(false);
        setUserResponse("");
        setHint("");
        setCodeOutput("");
        setTimeLeft(60);
        setCoachMessage("New interview started. You got this!");
      } catch (error) {
        console.error("Error fetching interview questions:", error);
      }
    }
    if (formSubmitted) {
      fetchQuestions();
    }
  }, [formSubmitted, cvForm, cvFile, useUpload]);

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

  const handleAutoSubmit = async () => {
    const defaultResponse = userResponse.trim() ? userResponse : "[No Response]";
    setToast({ 
      visible: true, 
      message: "Time's up! Moving to next question.", 
      icon: <Clock className="w-5 h-5 text-amber-500" /> 
    });
    setTimeout(() => setToast({ visible: false, message: "", icon: null }), 3000);
    await handleSubmit(defaultResponse);
    setCoachMessage("Time's up! Let's move on to the next question.");
  };

  const handleSubmit = async (overrideResponse = null) => {
    const responseToUse = overrideResponse !== null ? overrideResponse : userResponse;
    if (!responseToUse.trim()) return;
    setLoading(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const res = await axios.post("http://localhost:5000/api/ai/evaluate-response", {
        cvDetails: cvForm,
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

        if (updatedAnswers.length === questions.length) {
          axios.post("http://localhost:5000/api/ai/evaluate-interview", {
            cvDetails: cvForm,
            answers: updatedAnswers,
          })
            .then((overallEvalRes) => {
              setOverallEvaluation(overallEvalRes.data.overallEvaluation);
              setIsComplete(true);
              setCoachMessage("Interview complete! Review your performance below.");
            })
            .catch((error) => {
              console.error("Error evaluating overall interview:", error);
            });
        }
        return updatedAnswers;
      });

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

  const saveInterview = () => {
    const interviewState = {
      cvForm,
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
    setToast({
      visible: true,
      message: "Interview progress saved successfully!",
      icon: <Save className="w-5 h-5 text-green-500" />
    });
    setTimeout(() => setToast({ visible: false, message: "", icon: null }), 3000);
    setCoachMessage("Your progress has been saved. Come back anytime!");
  };

  const fetchHint = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/ai/get-hint", {
        question: questions[currentQuestionIndex],
      });
      setHint(res.data.hint);
      setCoachMessage("Here's a hint to help you out!");
    } catch (error) {
      console.error("Error fetching hint:", error);
      setHint("No hint available at this time.");
    }
  };

  const progressPercent = questions.length ? (((currentQuestionIndex + 1) / questions.length) * 100) : 0;

  const handleCvFormSubmit = (e) => {
    e.preventDefault();
    if (!useUpload && cvForm.jobRole.trim()) {
      setFormSubmitted(true);
      setCoachMessage("CV details submitted. Starting your tailored interview!");
    } else if (useUpload && cvFile) {
      setFormSubmitted(true);
      setCoachMessage("CV uploaded. Starting your tailored interview!");
    } else {
      setToast({
        visible: true,
        message: "Please provide your CV details or upload your CV to proceed",
        icon: <Clock className="w-5 h-5 text-rose-500" />
      });
      setTimeout(() => setToast({ visible: false, message: "", icon: null }), 3000);
    }
  };

  return (
    <div className={`${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-50"} min-h-screen p-4 relative overflow-hidden transition-colors duration-300`}>
      <div className="absolute inset-0 w-full h-full opacity-10">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      {!formSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mx-auto mt-20 p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <Brain className="w-12 h-12 text-indigo-600" />
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Interview Assistant
            </h2>
          </div>
          <form onSubmit={handleCvFormSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Choose Input Method:</label>
              <button 
                type="button" 
                onClick={() => setUseUpload(false)}
                className={`px-4 py-2 rounded ${!useUpload ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Manual Entry
              </button>
              <button 
                type="button" 
                onClick={() => setUseUpload(true)}
                className={`px-4 py-2 rounded ${useUpload ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Upload CV
              </button>
            </div>

            {useUpload ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload Your CV</label>
                <input 
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Developer"
                    value={cvForm.jobRole}
                    onChange={(e) => setCvForm({ ...cvForm, jobRole: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Experience</label>
                  <Textarea
                    placeholder="Your work experience..."
                    value={cvForm.experience}
                    onChange={(e) => setCvForm({ ...cvForm, experience: e.target.value })}
                    className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Education</label>
                  <input
                    type="text"
                    placeholder="Your educational background..."
                    value={cvForm.education}
                    onChange={(e) => setCvForm({ ...cvForm, education: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Projects</label>
                  <Textarea
                    placeholder="Your projects..."
                    value={cvForm.projects}
                    onChange={(e) => setCvForm({ ...cvForm, projects: e.target.value })}
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, React, CSS..."
                    value={cvForm.skills}
                    onChange={(e) => setCvForm({ ...cvForm, skills: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch Interview
            </Button>
          </form>
        </motion.div>
      ) : (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center mt-10">
          <Card className="w-full backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="w-12 h-12 text-indigo-600" />
                  <motion.div 
                    className="absolute inset-0" 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-12 h-12 text-blue-500" />
                  </motion.div>
                </motion.div>
                <div>
                  <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    AI Interview Nexus
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-gray-600">
                    <Brain className="w-4 h-4" />
                    Advanced AI-Powered Interview Simulation
                  </CardDescription>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <motion.span 
                    className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}
                    animate={{ scale: timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                  >
                    {timeLeft}s remaining
                  </motion.span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <AnimatePresence>
                  {chatHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: item.type === "answer" ? 20 : -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`mb-4 p-4 rounded-xl backdrop-blur-sm ${
                        item.type === "question" 
                          ? "bg-blue-50/50 border border-blue-100" 
                          : item.type === "answer" 
                          ? "bg-indigo-50/50 border border-indigo-100 ml-4" 
                          : "bg-emerald-50/50 border border-emerald-100"
                      }`}
                    >
                      <p className="leading-relaxed">{item.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!isComplete && questions.length > 0 && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="bg-white/80 p-6 rounded-xl border border-gray-200 shadow-sm mb-4"
                  >
                    <p className="text-lg font-medium">{questions[currentQuestionIndex]}</p>
                    {hint && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <p className="text-sm text-amber-700">{hint}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {isComplete && overallEvaluation && (
                  <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6 rounded-xl">
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-blue-900">Interview Complete</h2>
                      </div>
                      <div className="space-y-2">
                        {renderOverallEvaluation(overallEvaluation)}
                      </div>
                      <div className="flex items-center justify-end text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="ml-2">Duration: 15 minutes</span>
                      </div>
                    </motion.div>
                  </Alert>
                )}
              </ScrollArea>
            </CardContent>

            <CardFooter className="space-y-4 p-6">
              {!isComplete ? (
                <>
                  <Textarea
                    placeholder="Type your response here..."
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    // Increased the input size by adjusting rows and min-height
                    rows={6}
                    className="w-full min-h-[120px] bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                      onClick={() => handleSubmit()}
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Response
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={fetchHint}
                      className="bg-white border border-gray-200 text-gray-700 py-6 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={saveInterview}
                      className="bg-white border border-gray-200 text-gray-700 py-6 px-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Save className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Start New Interview
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200"
      >
        <div className="relative">
          <Brain className="w-10 h-10 text-indigo-600" />
          <motion.div 
            className="absolute inset-0" 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-blue-500" />
          </motion.div>
        </div>
        <p className="text-sm font-medium text-gray-700">{coachMessage}</p>
      </motion.div>

      <AnimatePresence>
        {toast.visible && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200"
          >
            <MessageSquare className="w-5 h-5 text-blue-500" />
            {toast.icon}
            <span className="text-sm font-medium text-gray-700">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Interview;
