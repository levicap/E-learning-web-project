import React, { useState, useEffect } from 'react';
import Landing from "./components/Landing/landing";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Test from "./components/crudcourse/test1";
import Course from './components/course';
import AppLayout from './components/layoutuser';
import Sign from './components/auth/sign';
import Enroll from './components/enroll';
import CourseDisplay from './components/Courseenroll/coursedisplay';
import CourseEnroll from './components/Courseenroll/courseenroll';
import Payment1 from './components/payment/payment1';
import Chat1 from './components/chat/chat1';
import Learning1 from './components/usercourses/learning1';
import Quiz1 from './components/quiz/quiz1';
import Gen1 from './components/quizaigen/gen1';
import Session1 from './components/sessioncrud/session1';

import Navbar from '@/components/Landing/Navbar';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import AuthRedirector from './components/auth/AuthRedirector ';
import VideoApp from './components/videoChat/VideoApp';
import CourseContent from './components/coursecontent/coursecontent';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './components/Stripe/stripe';
import PaymentPage from './components/Stripe/payme';
import Allsessions from './components/allsessions/se';
import SesEnrollment from './components/sessionenr/sess';
import SidebarContent from './components/sidebar';
import Path from './components/path/aipath';
import Chatbot from './components/chatbot/chatbot';
import { Cpu, MessageSquare } from 'lucide-react';
import Interview from './components/interviewbot/interview';
import Study from './components/studybot/study';
import Platformchat from './components/platfromchat/platfromchat';
import Exam from './components/exam/exam';

// Initialize Stripe with your public key
const stripePromise = loadStripe('pk_test_51QyuUQAlzb98dcXiqKOAprivh0Ms3PdVIlR74mAcwPfGxaHhPfUBek8zJ0o3SejlP0jniOCHePHsQP8YOrmzrO1s00LAPjBeRb');

// Wrapper component to use location hook
function AppContent() {
  const [chatbotOpen, setChatbotOpen] = useState(false);  // For EduBot
  const [platformChatOpen, setPlatformChatOpen] = useState(false);  // For PlatformChat
  const location = useLocation();

  // Define the routes where the sidebar should be visible.
  // Adjust the list as needed.
  const sidebarRoutes = [
    '/Dashboard',
    '/course',
    '/courses',
    '/payment',
    '/student-dashboard',
    '/course-content',
    '/session',
    '/quiz',
    '/quiz-ai',
    '/live'
    // add more as needed
  ];
  const showSidebar = sidebarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  // Only show the floating EduBot on /course-content route, but allow toggling it
  const showFloatingChatbot = location.pathname === '/course-content';

  // Toggle the PlatformChat, close the EduBot if open
  const togglePlatformChat = () => {
    console.log("Toggling PlatformChat...");
    setPlatformChatOpen(prev => !prev);
    if (chatbotOpen) {
      console.log("Closing EduBot as PlatformChat is opened.");
      setChatbotOpen(false);  // Close EduBot if it's open
    }
  };

  // Toggle the EduBot, close the PlatformChat if open
  const toggleEduBot = () => {
    console.log("Toggling EduBot...");
    setChatbotOpen(prev => {
      const newState = !prev;
      console.log(`EduBot is now ${newState ? 'opened' : 'closed'}`);
      return newState;
    });
    if (platformChatOpen) {
      console.log("Closing PlatformChat as EduBot is opened.");
      setPlatformChatOpen(false);  // Close PlatformChat if it's open
    }
  };

  // Close the EduBot manually
  const closeEduBot = () => {
    console.log("Manually closing EduBot...");
    setChatbotOpen(false); // Ensure it triggers re-render
  };

  return (
    <>
      <Navbar />
      {/* Container with sidebar and main content */}
      <div className="flex min-h-screen">
        {showSidebar && (
          <aside className="w-64 border-r border-gray-200">
            <SidebarContent />
          </aside>
        )}
        <main className={`flex-1 p-4`}>
          <Routes>
            <Route path="/role-check" element={<AuthRedirector />} />
            <Route path="/" element={<Landing />} />
            <Route path="/Dashboard" element={<Test />} />
            <Route path="/course" element={<Course />} />
            <Route path="/live" element={<VideoApp />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/courses/enroll" element={<CourseEnroll />} />
            <Route path="/courses" element={<CourseDisplay />} />
            <Route path="/payment" element={<Payment1 />} />
            <Route path="/chat" element={<Chat1 />} />
            <Route path="/student-dashboard" element={<Learning1 />} />
            <Route path="/quiz" element={<Quiz1 />} />
            <Route path="/quiz-ai" element={<Gen1 />} />
            <Route path="/session" element={<Session1 />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/course-content" element={<CourseContent />} />
            <Route path="/checkout" element={<PaymentPage />} />
            <Route path="/sessions" element={<Allsessions />} />
            <Route path="/sessionenroll" element={<SesEnrollment />} />
            <Route path="/paths" element={<Path />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/study" element={<Study />} />
            <Route path="/exam" element={<Exam />} />
          </Routes>
        </main>
      </div>

      {/* Separate div for EduBot (floating chatbot) on /course-content */}
      {showFloatingChatbot && chatbotOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="w-[400px] h-[600px] bg-white border border-gray-300 rounded-t-lg shadow-xl flex flex-col">
            <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-gray-100 rounded-t-lg">
              <span className="font-bold text-lg">EduBot</span>
              <button onClick={closeEduBot} className="text-gray-600 hover:text-gray-800">
                X
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Chatbot />
            </div>
          </div>
        </div>
      )}

      {/* Separate div for PlatformChat (floating platform chat) */}
      <div className="fixed bottom-0 right-4 z-50">
        <button
          onClick={togglePlatformChat}
          className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        >
          <MessageSquare className="h-8 w-8 text-white" />
        </button>
      </div>

      {platformChatOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="w-[400px] h-[600px] bg-white border border-gray-300 rounded-t-lg shadow-xl flex flex-col">
            <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-gray-100 rounded-t-lg">
              <span className="font-bold text-lg">PlatformChat</span>
              <button onClick={() => setPlatformChatOpen(false)} className="text-gray-600 hover:text-gray-800">
                X
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Platformchat />
            </div>
          </div>
        </div>
      )}

      {/* EduBot Icon to toggle */}
      {showFloatingChatbot && (
        <div className="fixed bottom-16 right-4 z-50">
          <button
            onClick={toggleEduBot}
            className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          >
            <Cpu className="h-8 w-8 text-white" />
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <AppContent />
      </Router>
    </Elements>
  );
}
