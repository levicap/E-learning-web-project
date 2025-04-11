import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Search, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Lock,
  ChevronRight,
  Calendar,
  Star
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function AISearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResult, setAiResult] = useState<{
    roadmap: string[];
    courses: Record<string, any[]>;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");
    setAiResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/ai/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI learning path");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching AI learning path:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const getEstimatedTime = (topic: string) => {
    // Estimated time based on topic complexity
    const baseTime = 4; // Base hours
    const complexity = topic.includes("Advanced") ? 2 : 
                      topic.includes("Introduction") ? 0.5 : 1;
    return Math.round(baseTime * complexity);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-background">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">AI Learning Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Discover personalized learning paths powered by AI
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="What would you like to learn? e.g., 'data science'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSearching}
              size="icon"
              className="w-10 h-10"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <h4 className="text-2xl font-semibold">Your Learning Path</h4>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated completion: {aiResult.roadmap.length * 2} weeks
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[1.625rem] top-0 bottom-0 w-px bg-border" />
                <ScrollArea className="h-[600px] pr-4">
                  {aiResult.roadmap.map((topic, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-8 relative"
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="text-xl font-semibold">{topic}</h5>
                            <Badge variant="secondary" className="ml-2">
                              {getEstimatedTime(topic)}h
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Week {Math.floor(index / 3) + 1}</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              <span>
                                {topic.includes("Advanced") ? "Advanced" :
                                 topic.includes("Introduction") ? "Beginner" : "Intermediate"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {aiResult.courses[topic] && aiResult.courses[topic].length > 0 ? (
                        <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {aiResult.courses[topic].map((course: any) => (
                            <HoverCard key={course._id}>
                              <HoverCardTrigger asChild>
                                <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                                  {course.image ? (
                                    <div className="relative h-48">
                                      <img 
                                        src={course.image} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                                      <div className="absolute bottom-4 left-4 right-4">
                                        <h6 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                                          {course.title}
                                        </h6>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-48 bg-muted flex items-center justify-center">
                                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center text-muted-foreground">
                                          <BookOpen className="h-4 w-4 mr-1" />
                                          <span className="text-sm">
                                            {course.lessons ? course.lessons.length : 0} Lessons
                                          </span>
                                        </div>
                                        <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                          ${course.price.toFixed(2)}
                                        </Badge>
                                      </div>
                                      <Progress value={course.progress || 0} className="h-1" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">{course.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {course.description || "No description available"}
                                  </p>
                                  <div className="pt-2">
                                    <Button variant="secondary" size="sm" className="w-full">
                                      <span>View Course</span>
                                      <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      ) : (
                        <div className="ml-12">
                          <Card className="bg-muted/30 border-dashed">
                            <CardContent className="flex items-center justify-center p-6">
                              <div className="text-center">
                                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Courses for this topic will be available soon
                                </p>
                                <Button variant="outline" size="sm" className="mt-4">
                                  Get notified
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}