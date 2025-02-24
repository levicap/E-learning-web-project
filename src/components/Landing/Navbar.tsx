import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sparkles, BookOpen, GraduationCap, Users2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"; // Update import based on your Clerk version

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 hidden md:flex">
          <a href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">LearnHub</span>
          </a>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col space-y-4">
              <a href="/" className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">LearnHub</span>
              </a>
              <nav className="flex flex-col space-y-2">
                <a href="/courses" className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                  <BookOpen className="h-5 w-5" />
                  <span>Courses</span>
                </a>
                <a href="/paths" className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                  <GraduationCap className="h-5 w-5" />
                  <span>Learning Paths</span>
                </a>
                <a href="/community" className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                  <Users2 className="h-5 w-5" />
                  <span>Community</span>
                </a>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

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
        <Button variant="ghost" onClick={() => navigate("/login")}>Sign In</Button>
        <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <Button>Get Started</Button>
        </div>
      </div>
    </header>
  );
}