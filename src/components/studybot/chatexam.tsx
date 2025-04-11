import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from '@/lib/utils';

export default function ExamChatFlowContainer() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    examType: 'professional',
    subject: '',
    lesson: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.lesson.trim()) {
      setError("Please enter both a subject and a lesson/topic.");
      return;
    }
    setError('');
    setFormSubmitted(true);
  };

  if (!formSubmitted) {
    return (
      <Card className="p-6 shadow-lg max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Enter Exam Details</h2>
        <div className="flex flex-col gap-4">
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter subject"
          />
          <Input
            value={formData.lesson}
            onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value }))}
            placeholder="Enter lesson/topic"
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            Start Exam Chat
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <ChatExamFlow 
      examType={formData.examType}
      subject={formData.subject}
      initialLesson={formData.lesson}
    />
  );
}

/* ===================================================
   ChatExamFlow Component
=================================================== */
function ChatExamFlow({ examType, subject, initialLesson }) {
  const [step, setStep] = useState('prompt'); // 'prompt', 'question', 'overall'
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', content: `Subject: ${subject}\nLesson: ${initialLesson}\nGenerating exam questions...` }
  ]);
  const [loading, setLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [examQA, setExamQA] = useState([]);  // Store answered questions and feedback
  const [overallFeedback, setOverallFeedback] = useState('');
  // Timer state in seconds (for testing: 10 seconds)
  const [timeLeft, setTimeLeft] = useState(10);

  const addMessage = (msg) => {
    setChatMessages(prev => [...prev, msg]);
  };

  // Generate exam questions on component mount
  useEffect(() => {
    const generateQuestions = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:5000/api/ai/generate-exam", {
          examType,
          lesson: initialLesson
        });
        const questions = response.data.questions;
        if (!questions || questions.length === 0) {
          addMessage({ role: 'bot', content: 'No exam questions could be generated. Please try again.' });
          setLoading(false);
          return;
        }
        setExamQuestions(questions);
        addMessage({
          role: 'bot',
          content: `Exam questions generated. Here is your first question:\n\nQ1: ${questions[0]}`
        });
        setStep('question');
      } catch (error) {
        console.error("Error generating exam questions:", error);
        addMessage({ role: 'bot', content: 'Error generating exam questions. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
    generateQuestions();
  }, [examType, initialLesson]);

  // Reset the timer whenever a new question is loaded (i.e., currentIndex changes)
  useEffect(() => {
    if (step === 'question') {
      setTimeLeft(10);
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            // Automatically submit the answer (even if empty) when time is up
            handleSubmitAnswer();
            return 10; // Reset timer for next question after auto submission
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [step, currentIndex]);

  // Trigger overall evaluation when 10 Q&A pairs are done
  useEffect(() => {
    if (examQA.length === 10) {
      console.log('All questions answered. Proceeding to evaluation.');
      handleOverallEvaluation();
      setStep('overall');
    }
  }, [examQA]);

  const handleSubmitAnswer = async () => {
    // Prevent duplicate submissions if answer is empty and already loading
    if (!currentAnswer.trim() && loading) return;
    
    const question = examQuestions[currentIndex];

    addMessage({ role: 'user', content: `Answer for Q${currentIndex + 1}: ${currentAnswer}` });
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/ai/evaluate-exam-response", {
        examType,
        question,
        response: currentAnswer
      });

      const feedback = response.data.feedback;
      addMessage({
        role: 'bot',
        content: `Feedback for Q${currentIndex + 1}: ${feedback}`
      });

      // Update the examQA state with the new answer
      setExamQA(prev => {
        const updatedQA = [...prev, { question, response: currentAnswer, feedback }];
        console.log(`Updated examQA after Q${currentIndex + 1}:`, updatedQA);
        return updatedQA;
      });

      setCurrentAnswer('');

      if (currentIndex < examQuestions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        addMessage({
          role: 'bot',
          content: `Next Question (Q${nextIndex + 1}): ${examQuestions[nextIndex]}`
        });
      }

    } catch (error) {
      console.error("Error evaluating exam response:", error);
      addMessage({ role: 'bot', content: 'Error evaluating your answer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    const question = examQuestions[currentIndex];
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/ai/get-exam-hint", {
        examType,
        question
      });
      const hint = response.data.hint;
      addMessage({
        role: 'bot',
        content: `Hint for Q${currentIndex + 1}: ${hint}`
      });
    } catch (error) {
      console.error("Error fetching hint:", error);
      addMessage({ role: 'bot', content: 'Error fetching hint. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverallEvaluation = async () => {
    setLoading(true);
    try {
      console.log("Exam QA before sending to backend:", examQA);
      if (examQA.length !== 10) {
        console.error("The examQA array does not contain 10 answers.");
        addMessage({
          role: 'bot',
          content: 'Error: You must answer all 10 questions before generating the overall evaluation.'
        });
        return;
      }
  
      const response = await axios.post("http://localhost:5000/api/ai/evaluate-exam", {
        examType,
        answers: examQA
      });
  
      console.log("Overall evaluation response:", response.data);
  
      if (response.data && response.data.overallEvaluation) {
        const overall = response.data.overallEvaluation.trim();
        setOverallFeedback(overall);
      } else {
        console.error("No overall evaluation data received.");
        addMessage({
          role: 'bot',
          content: "Error generating overall evaluation. Please try again."
        });
      }
    } catch (error) {
      console.error("Error evaluating overall exam:", error.response ? error.response.data : error.message);
      addMessage({
        role: 'bot',
        content: 'Error generating overall evaluation. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg mt-6">
      {/* Chat messages */}
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
              <div className="flex-1 whitespace-pre-wrap">
                {msg.content}
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

      {/* Timer Display */}
      {step === 'question' && (
        <div className="mb-2 text-center text-gray-600">
          Time left: {timeLeft} seconds
        </div>
      )}

      {/* Answer Input & Hint */}
      {step === 'question' && (
        <>
          <div className="flex gap-2 mb-2">
            <Input
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={`Your answer for Q${currentIndex + 1}`}
              className="focus:ring-2 focus:ring-indigo-200 flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
            >
              {loading ? 'Loading...' : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGetHint}
              disabled={loading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white flex items-center gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              Get Hint
            </Button>
          </div>
        </>
      )}

      {/* Overall Evaluation */}
      {step === 'overall' && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Overall Evaluation</h3>
          <p className="whitespace-pre-wrap">
            {overallFeedback.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
      )}
    </Card>
  );
}
