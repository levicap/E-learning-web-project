import React from "react";
import { 
  Layout, 
  Sparkles, 
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

export default function SidebarContent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 py-4 w-64 mt-5 border-r-[1px] border-gray">
      <div className="px-3 py-2">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/dashboard")}
          >
            <Layout className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/courses/create")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Courses
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/students")}
          >
            <Users className="h-4 w-4 mr-2" />
            Students
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/live-sessions")}
          >
            <Presentation className="h-4 w-4 mr-2" />
            Live Sessions
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/live")}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Launch Live Session
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/discussions")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Quizzes And Assignments
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/payments")}
          >
            <Zap className="h-4 w-4 mr-2" />
            Payments
          </Button>
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
