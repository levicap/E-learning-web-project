import React, { useEffect, useState } from "react";
import { 
  Layout, 
  BookOpen,
  FileVideo,
  Clipboard,
  Cpu,
  Users, 
  Presentation, 
  Trophy, 
  MessageSquare, 
  Zap, 
  Settings, 
  HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function SidebarContent() {
  const navigate = useNavigate();
  const { user } = useUser();
  const clerkId = user?.id;
  const [userData, setUserData] = useState(null);

  // Fetch the user details using the clerkId once it is available.
  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/users/${clerkId}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUser();
  }, [clerkId]);

  // Determine the user role.
  const isTeacher = userData && userData.role === "teacher";
  const isStudent = userData && userData.role === "student";
  const isAdmin = userData && userData.role === "admin";

  return (
    <div className="space-y-4 py-4 w-64 mt-20">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          {/* Teacher-only options */}
          {isTeacher && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/dashboard")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create Courses
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/studio")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Record Courses
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/session")}
              >
                <FileVideo className="h-4 w-4 mr-2" />
                Create Live Sessions
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/live")}
              >
                <Zap className="h-4 w-4 mr-2" />
                Launch Live Session
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/quiz")}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Quizzes And Assignments
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/quiz-ai")}
              >
                <Cpu className="h-4 w-4 mr-2" />
                Generate Quiz with AI
              </Button>
            </>
          )}

          {/* Student-only options */}
          {isStudent && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/courses")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/sessions")}
              >
                <FileVideo className="h-4 w-4 mr-2" />
                Sessions
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/student-dashboard")}
              >
                <Layout className="h-4 w-4 mr-2" />
                Learning Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate("/live")}
              >
                <FileVideo className="h-4 w-4 mr-2" />
                Join Live Session
              </Button>
            </>
          )}

          {/* Admin-only options */}
        {/* Admin-only options */}
{isAdmin && (
  <>
     <Button
      variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
      onClick={() => navigate("/admin/users")}
    >
      <Users className="h-4 w-4 mr-2" />
      Users
    </Button>
    <Button
     variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
      onClick={() => navigate("/admincourse")}  // Changed from '/admincourse'
    >
      <BookOpen className="h-4 w-4 mr-2" />
      Courses
    </Button>
    <Button
     variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
      onClick={() => navigate("/admin-dashboard")}  // Changed from '/admin-dashboard'
    >
      <Presentation className="h-4 w-4 mr-2" />
      Analytics
    </Button>
    <Button
     variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
      onClick={() => navigate("/admin/settings")}
    >
      <Settings className="h-4 w-4 mr-2" />
      System Settings
    </Button>
  </>
)}
        </div>
      </div>
      <Separator />
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Support
        </h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/help")}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help Center
          </Button>
        </div>
      </div>
    </div>
  );
}
