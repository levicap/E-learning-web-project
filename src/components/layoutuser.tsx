import { useState } from 'react';
import React, { ReactNode } from "react";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Clock,
  Layout,
  PlayCircle,
  User,
  Menu,
  Search,
  Bell,
  Settings,
  Home,
  Bookmark,
  Calendar,
  MessageSquare,
  BarChart,
  GraduationCap,
  ChevronRight,
  Trophy,
  Code,
  Brain,
  Zap,
  Star,
  Heart,
  Target,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ConfettiExplosion from 'react-confetti-explosion';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Live from './live';




const navigationItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: BookOpen, label: 'My Courses' },
  { icon: Calendar, label: 'Schedule' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: BarChart, label: 'Progress' },
  { icon: Settings, label: 'Settings' },
];

const achievements = [
  { icon: Zap, label: 'Quick Learner', description: 'Complete 3 lessons in one day', progress: 66 },
  { icon: Star, label: 'Perfect Score', description: 'Get 100% on 5 quizzes', progress: 40 },
  { icon: Heart, label: 'Dedicated', description: 'Study for 7 days in a row', progress: 85 },
  { icon: Target, label: 'Sharpshooter', description: 'Complete all exercises in a module', progress: 20 },
];
type LayoutProps = {
    children: ReactNode;
  };

function AppLayout({ children }: LayoutProps) {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  

  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <ConfettiExplosion />
          </div>
        )}

        {/* Navigation Bar */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="h-16 border-b fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50"
        >
          <div className="flex h-full items-center px-4 gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px]">
                <NavigationSidebar />
              </SheetContent>
            </Sheet>
            <GraduationCap className="h-8 w-8 text-primary hidden lg:block" />
            <div className="flex-1 flex items-center gap-4 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9 bg-muted"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5"
              >
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">2,450 XP</span>
              </motion.div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block">John Doe</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold">John Doe</h4>
                      <div className="text-sm text-muted-foreground">Level 12 Developer</div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span>2,450 XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span>15 Badges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </motion.header>

        {/* Main Layout */}
        <div className="pt-16 lg:pl-[280px] h-screen">
          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="fixed top-16 left-0 bottom-0 w-[280px] border-r hidden lg:block">
            <NavigationSidebar />
          </div>

            {/* Course Content */}  
            <div>
                {children}
            </div>

            {/* Course Content Sidebar - Hidden on mobile */}
           
          </div>
        
      </div>
    </TooltipProvider>      
  );
}

function NavigationSidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">Learning Platform</h2>
        <p className="text-sm text-muted-foreground">Master new skills today</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={item.label === 'My Courses' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Achievements</h3>
          {achievements.map((achievement) => (
            <Card key={achievement.label} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <achievement.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{achievement.label}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                  <Progress value={achievement.progress} className="h-1" />
                  <div className="mt-1 text-xs text-muted-foreground text-right">{achievement.progress}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}



export default AppLayout;