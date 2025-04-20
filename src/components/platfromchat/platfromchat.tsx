import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Send,
  Sparkles,
  DollarSign,
  BookOpen,
  Tag,
  Clock,
  Star,
  ChevronRight,
  Users,
  Bot,
  User
} from 'lucide-react';
import axios from 'axios';  // Import axios

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string | React.ReactNode;
}

interface AIResponse {
  intent: string;
  courses?: Course[];
  count?: number;
  sessions?: any[];
  averagePrice?: number;
  instructors?: string[];
  categories?: string[];
  course?: Course;
  materials?: any[];
  lessons?: any[];
  codeExamples?: any[];
}

function Platformchat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Hello! I\'m your AI learning assistant. Ask me anything about our courses, sessions, or learning statistics!',
    },
  ]);
  const [input, setInput] = useState('');

  // Configure API base URL
  const API_BASE_URL = 'http://localhost:5000/api/chatbot/chat';

  const formatCourseList = (courses: Course[]) => (
    <div className="grid gap-6 mt-4">
      {courses.map((course) => (
        <Card key={course._id} className="overflow-hidden border-0 shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 h-48 relative">
              <img
                src={course.image.startsWith('/uploads') 
                  ? `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400`
                  : course.image
                }
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 font-medium">
                  <Tag className="w-3 h-3 mr-1" />
                  {course.category}
                </Badge>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                </div>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-lg py-1.5">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {course.price}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  8 weeks
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  156 students
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  4.8
                </div>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Enroll Now
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const handleAIResponse = (response: AIResponse) => {
    let messages: Message[] = [];

    switch (response.intent) {
      case 'countCourses':
        messages.push({
          type: 'bot',
          content: (
            <Card className="bg-blue-50/50 border-blue-100">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-blue-100 text-blue-700 border-blue-200">
                  Course Statistics
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{response.count}</p>
                    <p className="text-sm text-blue-600">Available Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
        });
        break;
      case 'findCourses':
        if (response.courses && response.courses.length > 0) {
          messages.push({
            type: 'bot',
            content: (
              <div className="space-y-4">
                <Card className="bg-green-50/50 border-green-100">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit bg-green-100 text-green-700 border-green-200">
                      Found Courses
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700">Here are the courses I found for you:</p>
                  </CardContent>
                </Card>
                {formatCourseList(response.courses)}
              </div>
            ),
          });
        }
        break;
      case 'avgSessionPrice':
        if (response.averagePrice !== undefined) {
          messages.push({
            type: 'bot',
            content: `The average price for courses is $${response.averagePrice.toFixed(2)}.`,
          });
        }
        break;
      case 'findSessions':
        if (response.sessions && response.sessions.length > 0) {
          messages.push({
            type: 'bot',
            content: (
              <Card className="bg-purple-50/50 border-purple-100">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit bg-purple-100 text-purple-700 border-purple-200">
                    Available Sessions
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-700">Found {response.sessions.length} sessions for you.</p>
                </CardContent>
              </Card>
            ),
          });
        } else {
          messages.push({
            type: 'bot',
            content: 'No sessions available at the moment.',
          });
        }
        break;
      case 'listCategories':
        if (response.categories && response.categories.length > 0) {
          messages.push({
            type: 'bot',
            content: `Here are the categories available: ${response.categories.join(', ')}`,
          });
        }
        break;
      case 'listInstructors':
        if (response.instructors && response.instructors.length > 0) {
          messages.push({
            type: 'bot',
            content: `Here are the instructors available: ${response.instructors.join(', ')}`,
          });
        }
        break;
      case 'courseDetails':
        if (response.course) {
          messages.push({
            type: 'bot',
            content: (
              <div>
                <h3>{response.course.title}</h3>
                <p>{response.course.description}</p>
              </div>
            ),
          });
        }
        break;
      case 'courseMaterials':
        if (response.materials && response.materials.length > 0) {
          messages.push({
            type: 'bot',
            content: (
              <div>
                <h4>Course Materials:</h4>
                <ul>
                  {response.materials.map((material, index) => (
                    <li key={index}>{material.title} - {material.type}</li>
                  ))}
                </ul>
              </div>
            ),
          });
        }
        break;
      case 'courseLessons':
        if (response.lessons && response.lessons.length > 0) {
          messages.push({
            type: 'bot',
            content: (
              <div>
                <h4>Lessons:</h4>
                <ul>
                  {response.lessons.map((lesson, index) => (
                    <li key={index}>{lesson.title}</li>
                  ))}
                </ul>
              </div>
            ),
          });
        }
        break;
      case 'courseCodeExamples':
        if (response.codeExamples && response.codeExamples.length > 0) {
          messages.push({
            type: 'bot',
            content: (
              <div>
                <h4>Code Examples:</h4>
                <ul>
                  {response.codeExamples.map((code, index) => (
                    <li key={index}>{code.title}: {code.description}</li>
                  ))}
                </ul>
              </div>
            ),
          });
        }
        break;
      default:
        messages.push({
          type: 'bot',
          content: 'Sorry, I did not understand your query.',
        });
    }

    return messages;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', content: input }]);

    try {
      const response = await axios.post(API_BASE_URL, { query: input });

      const newMessages = handleAIResponse(response.data); // Assuming backend response is in this format
      setMessages((prev) => [...prev, ...newMessages]);

    } catch (error) {
      console.error('Error during API request:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'Sorry, I encountered an error while fetching the response. Please try again.' },
      ]);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">EduAI Assistant</h1>
            <p className="text-gray-600">Your intelligent learning companion</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <ScrollArea className="h-[600px] px-6">
            <div className="space-y-6 py-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl ${message.type === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white border border-gray-100 shadow-sm'} ${message.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  >
                    <div className={`p-4 ${message.type === 'user' ? 'text-white' : 'text-gray-700'}`}>
                      {message.content}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Ask about courses, sessions, or learning statistics..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="bg-white border-gray-200 rounded-xl"
              />
              <Button
                onClick={handleSend}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Platformchat;
