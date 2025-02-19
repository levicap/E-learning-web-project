import { useState } from 'react';
import { 
  Bell, 
  Book, 
  ChevronDown, 
  Layout, 
  LogOut, 
  Menu, 
  Moon, 
  Plus, 
  Search, 
  Sun, 
  Users,
  Presentation,
  GraduationCap,
  BarChart3,
  Settings,
  MessageSquare,
  Calendar,
  HelpCircle,
  FileVideo,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Gauge,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


 export default function SidebarContent() {
            return (
              <div className="space-y-4 py-4 w-64">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                      Main Menu
                    </h2>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Layout className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Featured Courses
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Users className="h-4 w-4 mr-2" />
                      Students
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Presentation className="h-4 w-4 mr-2" />
                      Live Sessions
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Trophy className="h-4 w-4 mr-2" />
                      Achievements
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discussions
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Actions
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Support
                  </h2>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

    