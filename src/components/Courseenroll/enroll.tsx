import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, BookOpen, Users, Star } from "lucide-react";

function Enroll() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  console.log("Passed course data:", course);

  if (!course) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>No course selected.</p>
      </div>
    );
  }

  // Calculate total duration (in minutes) from course lessons
  const totalDuration = course.lessons
    ? course.lessons.reduce((acc, lesson) => acc + Number(lesson.duration), 0)
    : 0;

  // Function to navigate to Payment component with course data
  const handleEnrollPayment = () => {
    navigate("/payment", { state: { course } });
  };

  // Render each lesson in the curriculum
  const renderLessons = () => {
    if (course.lessons && course.lessons.length > 0) {
      return course.lessons.map((lesson, lessonIndex) => (
        <motion.div
          whileHover={{ scale: 1.01 }}
          key={lessonIndex}
          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{lesson.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">{lesson.duration} min</span>
        </motion.div>
      ));
    } else {
      return <p>No curriculum available.</p>;
    }
  };

  // Determine instructor details (if provided as an object)
  const instructor =
    typeof course.instructor === "object"
      ? course.instructor
      : { name: course.instructor, image: "https://via.placeholder.com/150" };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8 mb-8"
        >
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="animate-pulse">
                  {course.category}
                </Badge>
                <Badge variant="secondary">Price: ${course.price}</Badge>
                <Badge variant="secondary">Rating: {course.rating}</Badge>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{course.students ? course.students : "N/A"} students</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{course.rating}/5 rating</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm"
                >
                  <Clock className="w-5 h-5 text-green-500" />
                  <span>{totalDuration} minutes</span>
                </motion.div>
              </div>
              {/* Enroll button navigates to Payment */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={handleEnrollPayment}
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  Enroll Now - ${course.price}
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-96"
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                  <img
                    src={`http://localhost:5000${course.image}`}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end justify-center p-4">
                    <Button variant="secondary" size="sm">
                      Watch Preview
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="content" className="mt-12">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.lessons && course.lessons.length > 0
                    ? `${course.lessons.length} lessons • ${totalDuration} minutes total`
                    : "No lessons available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">{renderLessons()}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary">
                      <AvatarImage
                        src={instructor.image || "https://via.placeholder.com/150"}
                      />
                      <AvatarFallback>{instructor.name ? instructor.name[0] : "?"}</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-2 -right-2">Featured</Badge>
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl">{instructor.name}</CardTitle>
                    <CardDescription className="text-lg">
                      Senior Web Developer & Lead Instructor
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {["React Expert", "TypeScript", "UI/UX"].map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed">
                    With over 10 years of experience in web development, John has trained thousands of developers worldwide.
                  </p>
                  <Separator />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>See what our students are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p>Reviews content here...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Enroll;
