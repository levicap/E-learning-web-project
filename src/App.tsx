import React from 'react';

import Landing from "./components/landing";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from "./components/test1";
import Course from './components/course';
import Live from './components/live';
import AppLayout from './components/layoutuser';
import Bos from './components/l';
import Sign from './components/sign';


export default function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/home" element={<Landing/>} />
        <Route path="/Dashboard" element={<Test/>} />
        <Route path="/course" element={<Course/>} />
        <Route path="/layout" element={<AppLayout/>} />
        <Route path="/live" element={<Bos/>} />
        <Route path="/Login" element={<Sign/>} />

        
        
      </Routes>
    </Router>
    
  );}

