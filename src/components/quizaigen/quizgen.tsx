import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Loader2,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileQuestion,
  ChevronRight,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  ScrollText,
  Pencil,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/clerk-react';

function Gen() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // "quiz" or "assignment" (exercise) selection
  const [activeTab, setActiveTab] = useState('quiz');

  // Get the logged-in user from Clerk
  const { user } = useUser();

  // Build authentication headers using the Clerk user id
  const authHeaders = useMemo(() => {
    if (!user?.id) return {};
    return {
      'Content-Type': 'application/json',
      'x-clerk-user-id': user.id,
    };
  }, [user]);

  // Fetch courses from the backend when the user is loaded
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('http://localhost:5000/api/courses', {
          headers: authHeaders,
        });
        const data = await res.json();
        // Ensure that the data is an array
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    if (user?.id) {
      fetchCourses();
    }
  }, [user, authHeaders]);

  // Handler for generating AI content
  const handleGenerate = async () => {
    if (!selectedCourse || !selectedLesson || !prompt) return;
    setIsGenerating(true);
    setSaveMessage('');
    // Reset any previously selected questions
    setSelectedQuestionIndices([]);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-content', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          subject: selectedCourse.title,
          type: activeTab, // "quiz" or "assignment"
          prompt: prompt,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        if (activeTab === 'quiz') {
          setQuestions(data.output);
          setAssignment(null);
        } else {
          setAssignment(data.output);
          setQuestions([]);
        }
      } else {
        console.error('Error generating content:', data.error);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setIsGenerating(false);
  };

  // Toggle selection of a quiz question by index
  const toggleQuestionSelection = (index) => {
    setSelectedQuestionIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Handler for saving the selected quiz questions to the database
  const handleSaveQuiz = async () => {
    if (!selectedCourse || !selectedLesson || questions.length === 0) return;
    const selectedQuestions = questions.filter((_, idx) =>
      selectedQuestionIndices.includes(idx)
    );
    if (selectedQuestions.length === 0) {
      setSaveMessage('Please select at least one question to save.');
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    try {
      // The backend expects an object with a questions array under "quiz"
      const response = await fetch(
        `http://localhost:5000/api/courses/${selectedCourse._id}/lessons/${selectedLesson._id}/quiz`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ quiz: { questions: selectedQuestions } }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSaveMessage('Quiz saved successfully!');
      } else {
        setSaveMessage(data.message || 'Failed to save quiz.');
      }
    } catch (error) {
      setSaveMessage('Error saving quiz: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header and Tabs */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-primary" />
            AI Learning Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Generate personalized quizzes and exercises to enhance your learning experience.
          </p>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Exercise
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Course Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Select Your Course</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedCourse && selectedCourse._id === course._id
                    ? 'border-primary ring-2 ring-primary ring-opacity-50'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                onClick={() => {
                  setSelectedCourse(course);
                  setSelectedLesson(null);
                  setQuestions([]);
                  setAssignment(null);
                  setSelectedQuestionIndices([]);
                }}
              >
                <div className="aspect-video relative">
                  <img
                    src={`http://localhost:5000${course.image}`}

                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{course.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {course.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lesson Selection */}
        {selectedCourse && selectedCourse.lessons && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Select Your Lesson</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCourse.lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLesson && selectedLesson._id === lesson._id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setQuestions([]);
                    setAssignment(null);
                    setSelectedQuestionIndices([]);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{lesson.icon || '📘'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <Badge variant="secondary">
                          {lesson.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Prompt Input */}
        {selectedLesson && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                {activeTab === 'quiz' ? 'Create Your Quiz' : 'Create Your Exercise'}
              </h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter Your Prompt</Label>
              {activeTab === 'quiz' ? (
                <Input
                  id="prompt"
                  placeholder="What would you like to create a quiz about?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              ) : (
                <Textarea
                  id="prompt"
                  placeholder="Describe the exercise for the topic..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!selectedCourse || !selectedLesson || !prompt || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating {activeTab === 'quiz' ? 'Quiz' : 'Exercise'}...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Generate {activeTab === 'quiz' ? 'Quiz' : 'Exercise'}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Display Generated Content */}
        {(questions.length > 0 || assignment) && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <ScrollText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                Generated {activeTab === 'quiz' ? 'Quiz' : 'Exercise'}
              </h2>
            </div>
            {/* Quiz Display with Selectable Questions */}
            {questions.length > 0 && (
              <div className="space-y-8">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-4 border p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                          {qIndex + 1}
                        </span>
                        <h3 className="text-lg font-semibold">{question.question}</h3>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedQuestionIndices.includes(qIndex)}
                        onChange={() => toggleQuestionSelection(qIndex)}
                      />
                    </div>
                    {question.context && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        Context: {question.context}
                      </p>
                    )}
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className={`p-4 rounded-lg border transition-colors ${
                            oIndex === question.answer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {oIndex === question.answer ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={
                                oIndex === question.answer
                                  ? 'font-medium text-green-700 dark:text-green-300'
                                  : ''
                              }
                            >
                              {option}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {/* Save Selected Quiz Button */}
                <div className="mt-6 flex flex-col items-center">
                  <Button onClick={handleSaveQuiz} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving Quiz...
                      </>
                    ) : (
                      'Save Selected Quiz'
                    )}
                  </Button>
                  {saveMessage && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* Exercise Display */}
            {assignment && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{assignment.title}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary">
                      {assignment.difficulty}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {assignment.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Trophy className="w-4 h-4" />
                      {assignment.points} points
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{assignment.description}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Learning Objectives
                    </h4>
                    <ul className="space-y-2">
                      {assignment.objectives && assignment.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {assignment.requirements && assignment.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default Gen;
