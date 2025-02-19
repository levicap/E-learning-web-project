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
import SidebarContent from './sidebar';


export default function Navbar() {
    const notifications = [
        {
          id: 1,
          title: "New Course Published",
          message: "Advanced Machine Learning is now live",
          time: "2 minutes ago",
          type: "success",
          icon: CheckCircle2
        },
        {
          id: 2,
          title: "Upcoming Deadline",
          message: "Assignment submission due in 2 hours",
          time: "1 hour ago",
          type: "warning",
          icon: Clock
        },
        {
          id: 3,
          title: "System Update",
          message: "Platform maintenance scheduled",
          time: "3 hours ago",
          type: "info",
          icon: AlertCircle
        }
      ];
      const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
      };
      const [isDarkMode, setIsDarkMode] = useState(false);

    return(
        <div>
        <nav className="border-b fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
                <SidebarContent/>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span>EduDash Pro</span>
          </div>
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="relative w-96 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses, lessons, or instructors..." className="pl-8" />
            </div>
            <Button size="icon" variant="ghost" onClick={toggleTheme} className="hover:bg-muted">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="relative hover:bg-muted">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <div className="text-sm font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">Stay updated with course activities</div>
                </div>
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          {
                            'bg-green-100 text-green-600': notification.type === 'success',
                            'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                            'bg-blue-100 text-blue-600': notification.type === 'info'
                          }
                        )}>
                          <notification.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <Button variant="ghost" className="w-full text-xs">View all notifications</Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                    alt="User"
                    className="w-8 h-8 rounded-full ring-2 ring-primary/10"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">Administrator</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      </div>


    )}