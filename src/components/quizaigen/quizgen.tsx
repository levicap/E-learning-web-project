import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Loader2,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileQuestion,
  Clock,
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

export default function Gen() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [assignments, setAssignments] = useState([]); // each { title, description, tasks, solution }
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [selectedAssignmentIndices, setSelectedAssignmentIndices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('quiz');

  const { user } = useUser();
  const authHeaders = useMemo(
    () =>
      user?.id
        ? {
            'Content-Type': 'application/json',
            'x-clerk-user-id': user.id,
          }
        : {},
    [user]
  );

  // Fetch courses on mount
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/courses', { headers: authHeaders });
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user, authHeaders]);

  // merge tasks into one solution string
  const mergeTasks = (tasks = []) =>
    tasks
      .map(({ task, solution }) => `${task.trim()}\nSolution:\n${solution.trim()}`)
      .join('\n\n');

  // Generate quiz or assignments
  const handleGenerate = async () => {
    if (!selectedCourse || !selectedLesson || !prompt) return;
    setIsGenerating(true);
    setSaveMessage('');
    setSelectedQuestionIndices([]);
    setSelectedAssignmentIndices([]);

    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-content', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          subject: selectedCourse.title,
          type: activeTab,
          prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      if (activeTab === 'quiz') {
        setQuestions(data.output);
        setAssignments([]);
      } else {
        // build assignments with tasks intact, plus merged solution
        const raw = Array.isArray(data.output.assignments) ? data.output.assignments : [];
        const merged = raw.map(a => ({
          title: a.title,
          description: a.description,
          tasks: a.tasks || [],
          solution: mergeTasks(a.tasks),
        }));
        setAssignments(merged);
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle selection helpers
  const toggleQuestion = idx =>
    setSelectedQuestionIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  const toggleAssignment = idx =>
    setSelectedAssignmentIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );

  // Save quiz
  const handleSaveQuiz = async () => {
    if (!questions.length) return;
    const payload = questions.filter((_, i) => selectedQuestionIndices.includes(i));
    if (!payload.length) {
      setSaveMessage('Select at least one question to save.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${selectedCourse._id}/lessons/${selectedLesson._id}/quiz`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ quiz: { questions: payload } }),
        }
      );
      const result = await res.json();
      setSaveMessage(res.ok ? 'Quiz saved!' : result.message || 'Save failed.');
    } catch (err) {
      setSaveMessage('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save assignments with content = description + tasks list
  const handleSaveAssignments = async () => {
    if (!assignments.length) return;
    const payload = assignments.filter((_, i) => selectedAssignmentIndices.includes(i));
    if (!payload.length) {
      setSaveMessage('Select at least one assignment to save.');
      return;
    }
    setIsSaving(true);
    try {
      const formatted = payload.map(({ title, description, tasks, solution }) => ({
        title,
        content:
          description.trim() +
          '\n\nTasks:\n' +
          tasks.map((t, i) => `${i + 1}. ${t.task.trim()}`).join('\n'),
        solution,
      }));
      const res = await fetch(
        `http://localhost:5000/api/courses/${selectedCourse._id}/lessons/${selectedLesson._id}/assignments`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ assignments: formatted }),
        }
      );
      const result = await res.json();
      setSaveMessage(res.ok ? 'Assignments saved!' : result.message || 'Save failed.');
    } catch (err) {
      setSaveMessage('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Tabs */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <GraduationCap className="w-12 h-12 text-primary" /> AI Learning Assistant
          </h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" /> Quiz
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Exercise
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
            {courses.map(course => (
              <div
                key={course._id}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedCourse?._id === course._id
                    ? 'border-primary ring-2 ring-primary ring-opacity-50'
                    : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => {
                  setSelectedCourse(course);
                  setSelectedLesson(null);
                  setQuestions([]);
                  setAssignments([]);
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
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lesson Selection */}
        {selectedCourse?.lessons && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Select Your Lesson</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCourse.lessons.map(lesson => (
                <div
                  key={lesson._id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLesson?._id === lesson._id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setQuestions([]);
                    setAssignments([]);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{lesson.icon || '📘'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <Badge variant="secondary">{lesson.level}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" /> {lesson.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Prompt & Generate */}
        {selectedLesson && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                {activeTab === 'quiz' ? 'Create Your Quiz' : 'Create Your Exercise'}
              </h2>
            </div>
            {activeTab === 'quiz' ? (
              <Input
                placeholder="Quiz topic..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            ) : (
              <Textarea
                placeholder="Describe the exercise..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            )}
            <Button
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <Pencil className="w-4 h-4 mr-2" />
              )}
              Generate
            </Button>
          </Card>
        )}

        {/* Display Quiz */}
        {activeTab === 'quiz' && questions.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ScrollText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Generated Quiz</h2>
            </div>
            <div className="space-y-8">
              {questions.map((q, qi) => (
                <div key={qi} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {qi + 1}. {q.question}
                    </h3>
                    <input
                      type="checkbox"
                      checked={selectedQuestionIndices.includes(qi)}
                      onChange={() => toggleQuestion(qi)}
                    />
                  </div>
                  {q.context && <p className="italic text-sm">Context: {q.context}</p>}
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`p-3 rounded-lg border ${
                          oi === q.answer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {oi === q.answer ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <span className="w-5 h-5 inline-block" />
                          )}
                          <span className={oi === q.answer ? 'font-medium' : ''}>{opt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-50 p-3 rounded">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col items-center mt-6">
                <Button onClick={handleSaveQuiz} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : null}{' '}
                  Save Selected Quiz
                </Button>
                {saveMessage && <p className="mt-2 text-sm">{saveMessage}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Display Assignments */}
        {activeTab === 'assignment' && assignments.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ScrollText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Generated Exercises</h2>
            </div>
            <div className="space-y-6">
              {assignments.map((a, ai) => (
                <div key={ai} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <input
                      type="checkbox"
                      checked={selectedAssignmentIndices.includes(ai)}
                      onChange={() => toggleAssignment(ai)}
                    />
                  </div>
                  <p>{a.description}</p>
                  <div className="bg-gray-100 p-3 rounded overflow-auto">
                    <pre className="whitespace-pre-wrap">{a.solution}</pre>
                  </div>
                </div>
              ))}
              <div className="flex flex-col items-center mt-6">
                <Button onClick={handleSaveAssignments} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : null}{' '}
                  Save Selected Assignments
                </Button>
                {saveMessage && <p className="mt-2 text-sm">{saveMessage}</p>}
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
