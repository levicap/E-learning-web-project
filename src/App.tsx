import React from 'react';

import Landing from "./components/Landing/landing";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from "./components/crudcourse/test1";
import Course from './components/course';
import Live from './components/live';
import AppLayout from './components/layoutuser';
import Bos from './components/Live/l';
import Sign from './components/Login/sign';
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
import Navbar from './components/navbar';
import SidebarContent from './components/sidebar';
import LayoutTeacher from './components/layoutteacher';
import Course1 from './components/ta';

export default function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/home" element={<Landing/>} />
        <Route path="/Dashboard" element={<Test/>} />
        <Route path="/course" element={<Course/>} />
        <Route path="/live" element={<Bos/>} />
        <Route path="/Login" element={<Sign/>} />
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



        
      



        
        
      </Routes>
    </Router>
    
  );}

