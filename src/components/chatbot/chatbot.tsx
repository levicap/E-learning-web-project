import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  text: string;
  isBot: boolean;
}

function Chatbot() {
  const [subject, setSubject] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm EduBot, your AI learning assistant. What subject would you like to learn?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If subject isn't set, treat the input as the subject.
    if (!subject) {
      setSubject(input.trim());
      setMessages(prev => [
        ...prev,
        { text: `Great! We'll now focus on ${input.trim()}. Ask me anything about ${input.trim()}.`, isBot: true }
      ]);
      setInput('');
      return;
    }

    // Otherwise, treat it as a tutoring question.
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setIsLoading(true);
    const userQuestion = input;
    setInput('');

    try {
      const response = await axios.post('http://localhost:5000/api/ai/tutoring', {
        subject,
        question: userQuestion,
      });
      const answer = response.data.answer;
      setMessages(prev => [...prev, { text: answer, isBot: true }]);
    } catch (error) {
      console.error("Error fetching tutoring response:", error);
      setMessages(prev => [...prev, { text: "Sorry, there was an error fetching the answer.", isBot: true }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Bot className="h-8 w-8" />
            EduBot AI Assistant
          </h1>
          <p className="mb-8">Your intelligent learning companion</p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 border border-gray-300 ${
                      message.isBot
                        ? 'bg-gray-100'
                        : 'bg-gray-300'
                    }`}
                  >
                    {message.isBot && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">EduBot</span>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="flex space-x-2 p-4 bg-gray-100 rounded-full">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 bg-white"
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={!subject ? "Enter a subject to learn..." : "Ask me anything..."}
                className="flex-1 bg-white border border-gray-300 focus:ring-2 focus:ring-gray-500 text-black"
              />
              <button
                type="submit"
                className="bg-gray-800 text-white p-2 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default Chatbot;
