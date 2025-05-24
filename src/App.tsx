// src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useUser } from '@clerk/clerk-react';

// Layout & UI
import Navbar from '@/components/Landing/Navbar';
import SidebarContent from './components/sidebar';

// Auth & Guards
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import AuthRedirector from './components/auth/AuthRedirector ';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './components/auth/Unauthorized';

// Pages & Features
import Landing from "./components/Landing/landing";
import CourseDisplay from './components/Courseenroll/coursedisplay';
import CourseEnroll from './components/Courseenroll/courseenroll';
import Path from './components/path/aipath';
import Chatbot from './components/chatbot/chatbot';
import Test from "./components/crudcourse/test1";
import AnalyticsPage from './AnalyticsPage';
import UsersPage from '@/pages/admin/users/page';
import CoursesTable from './CourseTable';

import CourseContent from './components/coursecontent/coursecontent';
import NoteTaking from './components/coursecontent/notetaking';
import Aiprediction from './components/studio/aipr/Dashboard';

import Learning1 from './components/usercourses/learning1';
import VideoApp from './components/videoChat/VideoApp';
import Quiz1 from './components/quiz/quiz1';
import Gen1 from './components/quizaigen/gen1';
import Session1 from './components/sessioncrud/session1';
import Allsessions from './components/allsessions/se';
import SesEnrollment from './components/sessionenr/sess';

import Payment1 from './components/payment/payment1';
import PaymentPage from './components/Stripe/payme';

import Interview from './components/interviewbot/interview';
import Study from './components/studybot/study';
import Platformchat from './components/platfromchat/platfromchat';
import Exam from './components/exam/exam';
import Studio from './components/studio/studio';
import CustomSettings from './components/settings/setting';
import Help from './components/help/help';
import InstructorProfile from './components/settings/profile';
import  Powerpoint from './components/studio/powerpoint';
import Home from './components/studio/lessonplan';
import ReportTable from './components/data-table/report';
import PaymentTable from './components/data-table/payment-table';

import { Cpu, MessageSquare, FileText } from 'lucide-react';

const stripePromise = loadStripe(
  'pk_test_51QyuUQAlzb98dcXiqKOAprivh0Ms3PdVIlR74mAcwPfGxaHhPfUBek8zJ0o3SejlP0jniOCHePHsQP8YOrmzrO1s00LAPjBeRb'
);
const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoaded } = useUser();
  const isSignedIn = isLoaded && !!user;

  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [platformChatOpen, setPlatformChatOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [contentState, setContentState] = useState('');
  const location = useLocation();

  // Sidebar logic: only for signed‑in users on certain routes
  const sidebarRoutes = [
    '/teacher-dashboard',
    '/admin-dashboard',
    '/admin-users',
    '/admin-course',
    'reports',
    '/payments',
    

    
    '/courses',
    '/quiz',
    '/quiz-ai',
    '/session',
    '/studio',
    '/settings',
    '/course-content',
    '/student-dashboard',
    '/live',
    '/help',
  ];
  const showSidebar = isSignedIn && sidebarRoutes.some(r => location.pathname.startsWith(r));

  // EduBot toggle appears only on /course-content
  const showFloatingChatbot = location.pathname === '/course-content';

  const togglePlatformChat = () => {
    setPlatformChatOpen(prev => !prev);
    if (chatbotOpen) setChatbotOpen(false);
  };
  const toggleEduBot = () => {
    setChatbotOpen(prev => !prev);
    if (platformChatOpen) setPlatformChatOpen(false);
  };
  const closeEduBot = () => setChatbotOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />

      <div className="flex min-h-screen">
        {showSidebar && (
          <aside className="w-64 border-r border-gray-200">
            <SidebarContent />
          </aside>
        )}

        <main className="flex-1 p-4">
          <Routes>
            {/* Unauthorized fallback */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path ='/powerpoint' element={<Powerpoint/>}/>

            {/* PUBLIC (no login required) */}
            <Route path="/" element={<Landing />} />
            <Route path="/courses" element={<CourseDisplay />} />
            <Route path="/paths" element={<Path />} />
            <Route path="/sessions" element={<Allsessions />} />
            <Route path="/plan" element={<Home/>} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/role-check" element={<AuthRedirector />} />

            {/* PROTECTED (login + role checks) */}

            {/* Admin-only */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <PaymentTable />
                </ProtectedRoute>
              }
            />
                <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportTable />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin-users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-course"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CoursesTable />
                </ProtectedRoute>
              }
            />

            {/* Teacher-only */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Test />
                </ProtectedRoute>
              }
            />
         

            {/* Student-only */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Learning1 />
                </ProtectedRoute>
              }
            />

            {/* Mixed-access */}
            <Route
              path="/live"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <VideoApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/enroll"
              element={
                <ProtectedRoute allowedRoles={['teacher','student']}>
                  <CourseEnroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={['student','teacher', 'admin']}>
                  <Payment1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prog"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Learning1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Quiz1 />
                </ProtectedRoute>
              }
            />
              <Route
              path="/Profile"
              element={
                <ProtectedRoute allowedRoles={[ 'teacher']}>
                  <InstructorProfile/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-ai"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Gen1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'student']}>
                  <Session1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['student','teacher']}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessionenroll"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SesEnrollment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Interview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Study />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <Exam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course-content"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <CourseContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/studio"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Studio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                  <CustomSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/note-taking"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher']}>
                  <NoteTaking
                    isOpen={noteOpen}
                    setIsOpen={setNoteOpen}
                    contentState={contentState}
                    setContentState={setContentState}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aiprediction"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Aiprediction />
                </ProtectedRoute>
              }
            />

            {/* Catch‑all: everything else → unauthorized */}
            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating note button */}
      {showFloatingChatbot && (
        <div className="fixed bottom-40 right-5 z-50">
          <button
            onClick={() => setNoteOpen(true)}
            className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Open Notes"
          >
            <FileText className="h-8 w-8 text-white" />
          </button>
        </div>
      )}

      {/* NoteTaking Dialog */}
      <NoteTaking
        isOpen={noteOpen}
        setIsOpen={setNoteOpen}
        contentState={contentState}
        setContentState={setContentState}
      />

      {/* EduBot */}
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

      {/* PlatformChat toggle & panel */}
      <div className="fixed bottom-2 right-4 z-50">
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

      {/* EduBot toggle icon */}
      {showFloatingChatbot && (
        <div className="fixed bottom-20 right-4 z-50">
          <button
            onClick={toggleEduBot}
            className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          >
            <Cpu className="h-8 w-8 text-white" />
          </button>
        </div>
      )}
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <Toaster />
      <Router>
        <AppContent />
      </Router>
    </Elements>
  );
}
