import { type ClassValue } from "clsx";

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface TutoringSession {
  id: string;
  title: string;
  description: string;
  type: "one-on-one" | "group";
  status: "scheduled" | "completed" | "cancelled";
  date: string;
  time: string;
  duration: number;
  maxStudents: number;
  price: number;
  tutor: {
    id: string;
    name: string;
    avatar: string;
    expertise: string[];
  };
  students: Student[];
}

export const mockSessions: TutoringSession[] = [
  {
    id: "1",
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into closures, prototypes, and async programming",
    type: "group",
    status: "scheduled",
    date: "2025-04-15",
    time: "14:00",
    duration: 90,
    maxStudents: 5,
    price: 45,
    tutor: {
      id: "t1",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      expertise: ["JavaScript", "React", "Node.js"],
    },
    students: [
      {
        id: "s1",
        name: "Alex Thompson",
        email: "alex@example.com",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      },
    ],
  },
  {
    id: "2",
    title: "Python Data Structures",
    description: "Master lists, dictionaries, and advanced data structures",
    type: "one-on-one",
    status: "scheduled",
    date: "2025-04-16",
    time: "10:00",
    duration: 60,
    maxStudents: 1,
    price: 65,
    tutor: {
      id: "t2",
      name: "Michael Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      expertise: ["Python", "Data Structures", "Algorithms"],
    },
    students: [],
  },
  {
    id: "3",
    title: "Web Development Fundamentals",
    description: "HTML, CSS, and JavaScript basics for beginners",
    type: "group",
    status: "completed",
    date: "2025-04-10",
    time: "15:00",
    duration: 120,
    maxStudents: 8,
    price: 35,
    tutor: {
      id: "t3",
      name: "Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      expertise: ["HTML", "CSS", "JavaScript"],
    },
    students: [
      {
        id: "s2",
        name: "Jordan Lee",
        email: "jordan@example.com",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      },
      {
        id: "s3",
        name: "Sofia Garcia",
        email: "sofia@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      },
    ],
  },
];