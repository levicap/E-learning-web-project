import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Lightbulb, 
  BookOpen, 
  Video, 
  Users, 
  Brain, 
  Calendar, 
  Timer, 
  AlignCenterVertical as Certificate, 
  Bot, 
  Palette, 
  Sparkles, 
  Zap, 
  Shield, 
  Gift, 
  Settings, 
  HelpCircle, 
  Bookmark, 
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'general', name: 'General Platform', icon: Lightbulb },
  { id: 'courses', name: 'Courses & Learning', icon: BookOpen },
  { id: 'live', name: 'Live Sessions', icon: Video },
  { id: 'users', name: 'Users & Authentication', icon: Users },
  { id: 'ai', name: 'AI Features', icon: Brain },
  { id: 'tools', name: 'Learning Tools', icon: Timer },
  { id: 'teacher', name: 'Teacher Studio', icon: Palette },
  { id: 'security', name: 'Security & Privacy', icon: Shield },
  { id: 'premium', name: 'Premium Features', icon: Sparkles },
];

const faqs = {
  general: [
    {
      question: "What makes [Platform Name] different from other e-learning platforms?",
      answer: "We combine traditional learning with cutting-edge AI technology, live interactive sessions, and comprehensive study tools. Our platform offers personalized learning paths, AI-powered assistance, and a collaborative environment that adapts to your learning style."
    },
    {
      question: "What devices can I use to access the platform?",
      answer: "Our platform is accessible on any device with a modern web browser. We have a responsive design that works seamlessly on desktops, laptops, tablets, and smartphones. You can switch between devices without losing your progress."
    },
    {
      question: "Do you offer any free courses or trial periods?",
      answer: "Yes! We offer several free courses to help you get started. Additionally, new users get a 14-day trial period to explore our premium features, including AI tools and live sessions."
    },
    {
      question: "How do I get technical support?",
      answer: "Our support team is available 24/7 through live chat, email, and our AI help desk. Premium users get priority support with guaranteed response times."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and various local payment methods. All transactions are processed securely through Stripe."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, we have native apps for both iOS and Android that offer offline access to course content and synchronized progress across devices."
    },
    {
      question: "Can I access course content offline?",
      answer: "Premium users can download course materials for offline viewing. This includes video lectures, PDFs, and practice exercises."
    },
    {
      question: "What languages is the platform available in?",
      answer: "The platform interface is available in 15 languages, and we offer courses in over 30 languages with AI-powered subtitles and translations."
    },
    {
      question: "How do I report technical issues or bugs?",
      answer: "You can report issues through our dedicated support portal, where our team will prioritize and address them promptly."
    },
    {
      question: "Do you offer corporate or institutional licenses?",
      answer: "Yes, we provide custom enterprise solutions with dedicated support, analytics, and customized learning paths for organizations."
    }
  ],
  courses: [
    {
      question: "How are courses structured?",
      answer: "Courses are divided into modules, each containing video lectures, reading materials, quizzes, and assignments. You can track your progress, take notes, and interact with AI learning assistants throughout the course."
    },
    {
      question: "Can I get a refund if I'm not satisfied with a course?",
      answer: "Yes, we offer a 30-day money-back guarantee for all courses. If you're not satisfied, simply contact our support team within the first 30 days of purchase."
    },
    {
      question: "How do certificates work?",
      answer: "Upon completing a course and passing the AI-generated final assessment, you'll receive a verified digital certificate. These certificates can be shared on LinkedIn and other professional platforms."
    },
    {
      question: "What happens if I fail an assessment?",
      answer: "You can retake assessments up to three times. Our AI system will provide personalized feedback and study recommendations between attempts."
    },
    {
      question: "Can I transfer course credits to my university?",
      answer: "Many of our courses are accredited and can be transferred to partner institutions. Check the course details for specific credit transfer information."
    },
    {
      question: "How long do I have access to a course after purchase?",
      answer: "You have lifetime access to purchased courses, including all future updates and improvements to the course content."
    },
    {
      question: "Can I preview course content before purchasing?",
      answer: "Yes, each course offers free preview lectures and a detailed curriculum overview to help you make an informed decision."
    },
    {
      question: "Are there prerequisites for advanced courses?",
      answer: "Advanced courses may have prerequisites, which are clearly listed in the course description. Our AI system can also assess your readiness."
    },
    {
      question: "How often is course content updated?",
      answer: "Courses are regularly updated to ensure content relevance. Updates are automatically available to enrolled students."
    },
    {
      question: "Can I download course materials for offline use?",
      answer: "Premium members can download course materials, including videos and resources, for offline viewing."
    }
  ],
  live: [
    {
      question: "What tools are available during live sessions?",
      answer: "Live sessions include HD video conferencing, interactive whiteboard, real-time chat, file sharing, and screen sharing capabilities."
    },
    {
      question: "How do I prepare for a live session?",
      answer: "Before joining, test your audio/video setup using our system check tool. We recommend using a stable internet connection and headphones."
    },
    {
      question: "What happens if I miss a live session?",
      answer: "All live sessions are recorded and made available to enrolled students within 24 hours of completion."
    },
    {
      question: "Can I interact with the instructor during sessions?",
      answer: "Yes, you can ask questions through chat, raise your hand for verbal questions, and participate in polls and discussions."
    },
    {
      question: "How many students can join a live session?",
      answer: "Session capacity varies by type, typically ranging from 20 to 100 participants to ensure quality interaction."
    },
    {
      question: "Are live sessions scheduled in my time zone?",
      answer: "Yes, all session times are displayed in your local time zone, and you can filter sessions by time availability."
    },
    {
      question: "What's the cancellation policy for live sessions?",
      answer: "You can cancel or reschedule up to 24 hours before the session start time for a full refund."
    },
    {
      question: "Can I review past session materials?",
      answer: "Yes, all session recordings, shared files, and whiteboard contents are available for review after the session."
    },
    {
      question: "How do breakout rooms work?",
      answer: "Instructors can create smaller group sessions for collaborative work, with the ability to move between rooms."
    },
    {
      question: "What if I experience technical difficulties during a session?",
      answer: "Our technical support team is available during all live sessions to help resolve any issues immediately."
    }
  ]
};

function TypeWriter({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(c => c + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="min-h-[100px] flex items-start">
      <Bot className="h-6 w-6 mr-3 mt-1 text-primary animate-bounce" />
      <div className="prose prose-sm max-w-none">
        {displayText}
        {currentIndex < text.length && (
          <span className="animate-pulse">|</span>
        )}
      </div>
    </div>
  );
}

function SearchResult({ result }: { result: { category: string; question: string; answer: string } }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const category = categories.find(c => c.id === result.category);
  const Icon = category?.icon || HelpCircle;

  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 group",
        isExpanded ? "bg-accent shadow-lg" : "hover:bg-accent/50 hover:shadow-md"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{result.question}</h3>
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0 transition-transform duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isExpanded && (
            <div className="mt-4 border-t pt-4">
              <TypeWriter text={result.answer} />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Icon className="h-4 w-4" />
              {category?.name}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Help() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ category: string; question: string; answer: string }>>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = Object.entries(faqs).flatMap(([category, questions]) =>
      questions
        .filter(
          q =>
            q.question.toLowerCase().includes(term.toLowerCase()) ||
            q.answer.toLowerCase().includes(term.toLowerCase())
        )
        .map(q => ({ category, ...q }))
    );
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text inline-flex items-center gap-3">
            Help Center
            <HelpCircle className="h-8 w-8 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Find answers to your questions about our e-learning platform. Browse through our categories or search for specific topics.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {searchTerm ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <SearchResult key={index} result={result} />
            ))}
            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">
                  No results found for "{searchTerm}"
                </p>
                <p className="text-muted-foreground mt-2">
                  Try searching with different keywords or browse through our categories
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
            <div className="md:col-span-2 space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 transition-all duration-200 h-auto py-3",
                      selectedCategory === category.id && "bg-accent shadow-md"
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-left">{category.name}</span>
                    {selectedCategory === category.id && (
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="md:col-span-5">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs[selectedCategory as keyof typeof faqs]?.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card rounded-lg px-6 transition-all duration-200 hover:shadow-md data-[state=open]:shadow-lg"
                  >
                    <AccordionTrigger className="text-left py-4">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 text-primary" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <TypeWriter text={faq.answer} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Help;