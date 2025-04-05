import { useState } from 'react';
import { 
  Bell, 
  Menu, 
  Moon,  
  Search, 
  Sun, 
  GraduationCap,
  Sparkles,

} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SidebarContent from './sidebar';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"; 
import { useAuth } from '@clerk/clerk-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { BookOpen, Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const { isLoaded, userId, getToken } = useAuth();
const  navigate = useNavigate();
   
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications'); // Update with your actual API endpoint
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

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
         
          <div className="flex-1 flex items-center justify-end gap-4">
           
           
        
            {userId? (
              <><header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
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
                <div className="relative w-96 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses, lessons, or instructors..." className="pl-8" />
            </div>
              
              </div>
            </header>  <Popover>
                 <Button size="icon" variant="ghost" onClick={toggleTheme} className="hover:bg-muted">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
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
            </Popover><SignedIn>
               <UserButton afterSignOutUrl="/login" />
             </SignedIn></>):(
              
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
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
               
                <div className="ml-auto flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
                <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
                
                  <Button onClick={()=>navigate("/register")}>Get Started</Button>
                </div>
              </div>
            </header>)}
              
          </div>
        </div>
      </nav>
      </div>


    )}