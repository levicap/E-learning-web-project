import React, { useState } from 'react';
import Landing from "./components/Landing/landing";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Test from "./components/crudcourse/test1";
import Course from './components/course';
import AppLayout from './components/layoutuser';
import Enroll from './components/enroll';
import CourseDisplay from './components/Courseenroll/coursedisplay';
import CourseEnroll from './components/Courseenroll/courseenroll';
import Tut from './components/sessionenroll/tut';
import TeacherBooking1 from './components/booking/teacherbooking1';
import Payment1 from './components/payment/payment1';
import Setting1 from './components/settings/setting1';
import Learning1 from './components/usercourses/learning1';
import Quiz1 from './components/quiz/quiz1';
import Gen1 from './components/quizaigen/gen1';
import Session1 from './components/sessioncrud/session1';
import CrudTeacher1 from './components/crudteacher/crud';
import LayoutTeacher from './components/layoutteacher';
import Course1 from './components/ta';
import { Toaster } from '@/components/ui/sonner';
import { store } from '@/lib/store/store';
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
import SidebarContent from './components/crudcourse/sidebar';
import Path from './components/path/aipath';
import Chatbot from './components/chatbot/chatbot';
import { Cpu } from 'lucide-react';
import Interview from './components/interviewbot/interview';
import Study from './components/studybot/study';

// Initialize Stripe with your public key
const stripePromise = loadStripe('pk_test_51QyuUQAlzb98dcXiqKOAprivh0Ms3PdVIlR74mAcwPfGxaHhPfUBek8zJ0o3SejlP0jniOCHePHsQP8YOrmzrO1s00LAPjBeRb');

// Wrapper component to use location hook
function AppContent() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const location = useLocation();

  // Only show the floating chatbot if we're not on the /chatbot route
  const showFloatingChatbot = location.pathname !== '/chatbot' && location.pathname !== '/interview';

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/role-check" element={<AuthRedirector />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/Dashboard" element={<Test />} />
            <Route path="/course" element={<Course />} />
            <Route path="/live" element={<VideoApp />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/courses/enroll" element={<CourseEnroll />} />
            <Route path="/courses" element={<CourseDisplay />} />
            <Route path="/tut" element={<Tut />} />
            <Route path="/teacher" element={<TeacherBooking1 />} />
            <Route path="/payment" element={<Payment1 />} />
            <Route path="/s" element={<Setting1 />} />
            <Route path="/prog" element={<Learning1 />} />
            <Route path="/quiz" element={<Quiz1 />} />
            <Route path="/ai" element={<Gen1 />} />
            <Route path="/session" element={<Session1 />} />
            <Route path="/crud" element={<CrudTeacher1 />} />
            <Route path="/na" element={<LayoutTeacher />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/course-content" element={<CourseContent />} />
            <Route path="/checkout" element={<PaymentPage />} />
            <Route path="/allsessions" element={<Allsessions />} />
            <Route path="/sessionenroll" element={<SesEnrollment />} />
            <Route path="/paths" element={<Path />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/study" element={<Study />} />
          </Routes>
        </main>
      </div>

      {/* Floating Chatbot Icon and Overlay */}
      {showFloatingChatbot && (
        <>
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setChatbotOpen(prev => !prev)}
              className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
              <Cpu className="h-8 w-8 text-white" />
            </button>
          </div>

          {chatbotOpen && (
            <div className="fixed bottom-20 right-4 z-50">
              <div className="w-[400px] h-[600px] bg-white border border-gray-300 rounded-t-lg shadow-xl flex flex-col">
                <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-gray-100 rounded-t-lg">
                  <span className="font-bold text-lg">EduBot</span>
                  <button onClick={() => setChatbotOpen(false)} className="text-gray-600 hover:text-gray-800">
                    X
                  </button>
                </div>
                {/* Chatbot component fills remaining space */}
                <div className="flex-1 overflow-y-auto">
                  <Chatbot />
                </div>
              </div>
            </div>
          )}
        </>
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
