import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, BookOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  studentsCount: number;
  lessonsCount: number;
  rating?: number;
  progress?: number;
  price?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CourseCard({
  title,
  description,
  image,
  instructor,
  duration,
  level,
  studentsCount,
  lessonsCount,
  rating,
  progress,
  price,
  isFeatured,
  isPopular,
  className,
  onClick,
}: CourseCardProps) {
  const levelColor = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <Card 
      className={cn("overflow-hidden transition-all hover:shadow-md", className)}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="h-48 w-full object-cover"
        />
        {isFeatured && (
          <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
        )}
        {isPopular && (
          <Badge variant="secondary" className="absolute top-2 right-2">Popular</Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
          {rating && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <CardDescription className="line-clamp-2 mt-1">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback>{instructor.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{instructor.name}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration}</span>
          </Badge>
          <Badge variant="outline" className={cn("flex items-center gap-1", levelColor[level])}>
            {level}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{studentsCount}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{lessonsCount} lessons</span>
          </Badge>
        </div>
        
        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {price ? (
          <div className="font-semibold">{price}</div>
        ) : (
          <div className="font-semibold text-green-600 dark:text-green-400">Free</div>
        )}
        <Button size="sm">
          {progress !== undefined ? "Continue" : "Enroll"}
        </Button>
      </CardFooter>
    </Card>
  );
}