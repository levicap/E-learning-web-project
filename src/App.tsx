import React, { useState, useEffect } from 'react';
import Landing from "./components/Landing/landing";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from "./components/crudcourse/test1";
import Course from './components/course';
import AppLayout from './components/layoutuser';
import Sign from './components/auth/sign';
import Enroll from './components/enroll';
import CourseDisplay from './components/Courseenroll/coursedisplay';
import CourseEnroll from './components/Courseenroll/courseenroll';
import Tut from './components/sessionenroll/tut';
import TeacherBooking1 from './components/booking/teacherbooking1';
import Payment1 from './components/payment/payment1';
import Setting1 from './components/settings/setting1';
import Chat1 from './components/chat/chat1';
import Learning1 from './components/usercourses/learning1';
import Quiz1 from './components/quiz/quiz1';
import Gen1 from './components/quizaigen/gen1';
import Session1 from './components/sessioncrud/session1';
import CrudTeacher1 from './components/crudteacher/crud'
import SidebarContent from './components/sidebar';
import LayoutTeacher from './components/layoutteacher';
import Course1 from './components/ta';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Landing/Navbar';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import AuthRedirector from './components/auth/AuthRedirector ';

import VideoApp from './components/videoChat/VideoApp';
import CourseContent from './components/coursecontent/coursecontent';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('your-publishable-key');




export default function App() {
  return (
  

    <>
    <Router>
    <Navbar/>
      <Routes>
      <Route path="/role-check" element={<AuthRedirector />} />
      <Route path="/live" element={<VideoApp/>}/>
        <Route path="/home" element={<Landing/>} />
        <Route path="/Dashboard" element={<Test/>} />
        <Route path="/course" element={<Course/>} />
        <Route path="/Login" element={<Login/>} />
        <Route path="/enroll" element={<CourseEnroll/>} />
        <Route path="/coursedata" element={<CourseDisplay/> } />
        <Route path="/tut" element={<Tut/>} />
        <Route path="/teacher" element={<TeacherBooking1/>} />
        <Route path="/payment" element={<Payment1/>} />
        <Route path="/s" element={<Setting1/>} />
        <Route path="/chat" element={<Chat1/>} />
        <Route path="/prog" element={<Learning1/>} />
        <Route path="/q" element={<Quiz1/>} />
        <Route path="/ai" element={<Gen1/>} />
        <Route path="/session" element={<Session1/>} />
        <Route path="/crud" element={<CrudTeacher1/>} />
        <Route path="/na" element={<LayoutTeacher/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />}/>
        <Route path="/course-content" element={<CourseContent />}/>



        
      



        
        
      </Routes>
    </Router>
    </>
  );}

