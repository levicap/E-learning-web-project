import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { 
  Bell, 
  BookOpen,
  ChevronDown, 
  Menu, 
  Moon, 
  Search, 
  Sun, 
  Users2,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import SidebarContent from '../sidebar';

export default function Navbar() {
  const { isLoaded, userId } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const MainNavigation = () => (
    <>
      <div className="mr-8 hidden md:flex">
        <a href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">LearnHub</span>
        </a>
      </div>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/paths">
              <GraduationCap className="h-4 w-4 mr-2" />
              Learning Paths
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/community">
              <Users2 className="h-4 w-4 mr-2" />
              Community
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );

  return (
    <nav className="border-b fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <MainNavigation />

        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses, lessons, or instructors..." className="pl-8" />
          </div>

          <Button size="icon" variant="ghost" onClick={toggleTheme} className="hover:bg-muted">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <SignedIn>
            <>
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
              <UserButton afterSignOutUrl="/login" />
            </>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
              <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
              <Button onClick={() => navigate("/register")}>Get Started</Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}