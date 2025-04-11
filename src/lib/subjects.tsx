import { Shield, Trophy, Cloud, Calculator, Atom, FlaskRound as Flask, Leaf, Globe, History, Code, Brain, Network, Database, LineChart, Cpu } from 'lucide-react';
import type { Subject } from '@/types';

export const subjects: Subject[] = [
  // Professional Certifications
  {
    id: 'cissp',
    name: 'CISSP',
    icon: Shield,
    category: 'professional',
    description: 'Cybersecurity Professional Certification',
  },
  {
    id: 'pmp',
    name: 'PMP',
    icon: Trophy,
    category: 'professional',
    description: 'Project Management Professional',
  },
  {
    id: 'aws-sa',
    name: 'AWS Solutions Architect',
    icon: Cloud,
    category: 'professional',
    description: 'AWS Certified Solutions Architect',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    icon: Network,
    category: 'professional',
    description: 'Azure Cloud Certification',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: Brain,
    category: 'professional',
    description: 'Data Science Certification',
  },

  // High School
  {
    id: 'math',
    name: 'Mathematics',
    icon: Calculator,
    category: 'highschool',
    description: 'Advanced Mathematics',
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: Atom,
    category: 'highschool',
    description: 'Physics Fundamentals',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: Flask,
    category: 'highschool',
    description: 'Chemistry Basics',
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: Leaf,
    category: 'highschool',
    description: 'Life Sciences',
  },

  // General Knowledge
  {
    id: 'language',
    name: 'Language Proficiency',
    icon: Globe,
    category: 'general',
    description: 'Language Skills',
  },
  {
    id: 'history',
    name: 'History',
    icon: History,
    category: 'general',
    description: 'World History',
  },
  {
    id: 'coding',
    name: 'Programming',
    icon: Code,
    category: 'general',
    description: 'Coding Skills',
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    icon: LineChart,
    category: 'general',
    description: 'Data Analysis Fundamentals',
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: Database,
    category: 'general',
    description: 'Database Management',
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: Cpu,
    category: 'general',
    description: 'CS Fundamentals',
  },
];