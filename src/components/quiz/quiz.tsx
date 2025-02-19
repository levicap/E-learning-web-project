import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import CourseSelection from './CourseSelection';
import LessonSelection from './LessonSelection';
import QuizManager from './QuizManager';
import AssignmentManager from './AssignmentManager';

export type Course = {
  id: string;
  name: string;
  image: string;
};

export type Lesson = {
  id: string;
  courseId: string;
  name: string;
  description: string;
};

function Quiz() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
       

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Course Selection</h2>
              </div>
              <CourseSelection
                selectedCourse={selectedCourse}
                onSelectCourse={(course) => {
                  setSelectedCourse(course);
                  setSelectedLesson(null);
                }}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-8 space-y-6">
            {selectedCourse && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Lesson Selection</h2>
                  </div>
                  <LessonSelection
                    courseId={selectedCourse.id}
                    selectedLesson={selectedLesson}
                    onSelectLesson={setSelectedLesson}
                  />
                </CardContent>
              </Card>
            )}

            {selectedLesson && (
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="quizzes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="quizzes" className="space-x-2">
                        <ClipboardList className="w-4 h-4" />
                        <span>Quizzes</span>
                      </TabsTrigger>
                      <TabsTrigger value="assignments" className="space-x-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>Assignments</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="quizzes">
                      <QuizManager lessonId={selectedLesson.id} />
                    </TabsContent>
                    <TabsContent value="assignments">
                      <AssignmentManager lessonId={selectedLesson.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;