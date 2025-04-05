import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Search,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  Cpu,
  LineChart,
} from "lucide-react";
import { motion } from 'framer-motion';

interface Instructor {
  name: string;
  avatar: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
  duration: string;
  level: string;
  description: string;
  image: string;
  instructor: Instructor;
  price: number;
  rating: number;
  students: number;
}

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  courses: Course[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
}

// Helper function to choose an icon based on the node title
const getIconForTitle = (title: string) => {
  return <LineChart className="w-5 h-5" />;
};

function Path() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapNodes, setRoadmapNodes] = useState<RoadmapNode[]>([]);

  // API call using the same backend logic as AISearch
  const fetchRoadmap = async (topic: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI learning path");
      }

      // The API returns an object with 'roadmap' and 'courses'
      const data = await response.json();

      // Transform the API response into an array of RoadmapNode objects
      const nodes: RoadmapNode[] = data.roadmap.map((nodeTitle: string, index: number) => ({
        id: String(index + 1),
        title: nodeTitle,
        description: `Detailed learning path for ${nodeTitle}`,
        icon: getIconForTitle(nodeTitle),
        courses: data.courses[nodeTitle] || [],
      }));

      setRoadmapNodes(nodes);
    } catch (error: any) {
      console.error('Error fetching roadmap:', error);
      setRoadmapNodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchRoadmap(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 mt-20">
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="relative">
            <Brain className="w-12 h-12 text-blue-600" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-100 rounded-full blur-xl"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Learning Path</h1>
            <p className="text-gray-500">Generate personalized learning roadmaps</p>
          </div>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <Input
              className="h-12 text-lg border-gray-200 focus:border-blue-500"
              placeholder="Try 'Machine Learning', 'Web Design', or 'Blockchain'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading} 
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                Generate <Sparkles className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {roadmapNodes.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {roadmapNodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-gray-100 shadow-lg">
                  <div className="p-6 flex items-start gap-4 bg-gray-50">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      {node.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">{node.title}</h2>
                      <p className="text-gray-600">{node.description}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <Separator className="bg-gray-100" />
                  
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {node.courses.map((course) => (
                        <motion.div
                          key={course.id}
                          whileHover={{ scale: 1.02 }}
                          className="group"
                        >
                          <Card className="overflow-hidden border border-gray-100 shadow-sm">
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={course.image} 
                                alt={course.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900">
                                {course.level}
                              </Badge>
                            </div>
                            
                            <div className="p-6">
                              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                                {course.title}
                              </h3>
                              
                              <div className="flex items-center gap-3 mb-4">
                                <img
                                  src={course.instructor.avatar}
                                  alt={course.instructor.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{course.instructor.name}</p>
                                  <p className="text-sm text-gray-500">{course.instructor.title}</p>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                              
                              <div className="flex items-center justify-between mb-4">
                                <StarRating rating={course.rating} />
                                <span className="text-sm text-gray-500">
                                  {course.students ? course.students.toLocaleString() : "0"} students
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-bold text-gray-900">${course.price}</span>
                                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Enroll Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {searchTerm && roadmapNodes.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center border border-gray-100">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No roadmap found</h3>
              <p className="text-gray-500">Try searching for "Machine Learning", "Web Design", or "Blockchain"</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Path;
