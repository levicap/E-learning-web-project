import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/spinner"; // Make sure this path is correct
import {
  Brain,
  Video,
  AudioLines,
  Download,
  Sparkles,
  Code,
  BookOpen,
  GraduationCap,
  Bot,
  FileCode2,
  MessageSquareDashed,
  Blocks,
  Lightbulb,
  Target,
  Terminal,
  Database,
  Layout
} from 'lucide-react';

function AicourseGenerator() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [complexity, setComplexity] = useState('intermediate');
  const [generatedCourse, setGeneratedCourse] = useState('');
  const [audioContent, setAudioContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateCourse = async () => {
    if (!title || !topic) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and topic.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Call your backend API endpoint
      const response = await axios.post('http://localhost:5000/api/ai/generate-course', {
        title,
        topic,
        complexity
      });
      
      // Assuming the API returns { courseTitle, courseContent, audioContent }
      setGeneratedCourse(response.data.courseContent);
      setAudioContent(response.data.audioContent);
      
      toast({
        title: "Course Generated",
        description: "Your course content is ready with an audio clip.",
      });
    } catch (error) {
      console.error('Error generating course:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate course content. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Function to simulate export of course content, audio, or video.
  const handleExport = async (format: string) => {
    // Here we simulate a delay export process.
    toast({
      title: "Processing Export",
      description: `Preparing your ${format === 'text' ? 'Markdown content' : format === 'audio' ? 'Audio' : 'Video'}...`,
    });

    // You might want to add real export logic here.
    // For now, we just simulate a brief delay.
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Export Complete",
      description: format === 'text'
        ? "Course content ready for download."
        : format === 'audio'
        ? "Audio version generated successfully."
        : "Video content coming soon.",
    });
  };

  // Function to download the course content as a .txt file.
  const downloadCourseContent = () => {
    const fileContent = generatedCourse;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger the download.
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_course_content.txt`;
    a.click();

    // Cleanup the URL object.
    URL.revokeObjectURL(url);
  };

  // Function to download the audio file as an MP3.
  const handleDownloadAudio = () => {
    if (!audioContent) return;
    // Convert base64 string to a Blob
    const byteCharacters = atob(audioContent);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger the download.
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_audio.mp3`;
    a.click();

    // Cleanup the URL object.
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">AI Course-Lesson Generator</h1>
              <p className="text-muted-foreground">Create comprehensive Lessons with practical examples</p>
            </div>
          </div>
          <Bot className="w-8 h-8 text-primary/60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Lesson Parameters</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Advanced React Development"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Main Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React Hooks and Patterns"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Complexity Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={complexity === level ? "default" : "outline"}
                      onClick={() => setComplexity(level)}
                      className="w-full"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateCourse}
                className="w-full"
                size="lg"
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Course'}
              </Button>

              {generating && (
                <div className="flex justify-center items-center mt-4">
                  <Spinner size="lg" />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Tabs defaultValue="preview" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Blocks className="w-4 h-4" />
                  Export
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4 h-[500px] flex flex-col">
                <ScrollArea className="flex-1 rounded-md border p-4">
                  <div className="prose dark:prose-invert max-w-none">
                    {generatedCourse ? (
                      <div className="whitespace-pre-wrap font-mono text-sm">
                        {generatedCourse}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquareDashed className="w-12 h-12 mb-4" />
                        <p>Enter your course details to begin...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="export" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Options
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred format
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { icon: Download, label: 'Download as Markdown', format: 'text' },
                        { icon: AudioLines, label: 'Generate Audio', format: 'audio' },
                        { icon: Video, label: 'Create Video (Coming Soon)', format: 'video' }
                      ].map(({ icon: Icon, label, format }) => (
                        <Button
                          key={format}
                          variant="outline"
                          className="w-full justify-start"
                          disabled={format === 'video'} // Disable video button
                          onClick={() => handleExport(format)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                    
                    {audioContent && (
                      <Button onClick={handleDownloadAudio} variant="default" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Audio
                      </Button>
                    )}

                    {/* Button to download course content as .txt */}
                    <Button
                      onClick={downloadCourseContent}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Course Content as .txt
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AicourseGenerator;
