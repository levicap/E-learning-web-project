import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImageIcon, VideoIcon, Wand2, Mic, Download, Play, Pause } from "lucide-react";
import { Label } from "@/components/ui/label";

interface GeneratedContent {
  type: 'script' | 'audio' | 'video';
  content: string;
  url?: string;
}

export function AITools() {
  const [courseName, setCourseName] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleGenerateScript = async () => {
    if (!courseName || !lessonName) return;
    
    setIsGenerating(true);
    // Simulated API call
    setTimeout(() => {
      const script = `Welcome to ${courseName}\n\nLesson: ${lessonName}\n\nThis is an AI-generated script for your course...`;
      setGeneratedScript(script);
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateAudio = async () => {
    if (!generatedScript) return;
    
    setIsGenerating(true);
    // Simulated API call
    setTimeout(() => {
      setGeneratedContent({
        type: 'audio',
        content: 'Generated Audio',
        url: 'https://example.com/audio.mp3' // This would be a real URL in production
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleGenerateVideo = async () => {
    if (!generatedScript) return;
    
    setIsGenerating(true);
    // Simulated API call
    setTimeout(() => {
      setGeneratedContent({
        type: 'video',
        content: 'Generated Video',
        url: 'https://example.com/video.mp4' // This would be a real URL in production
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Course Name</Label>
          <Input 
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name..."
          />
        </div>
        <div className="space-y-2">
          <Label>Lesson Name</Label>
          <Input 
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="Enter lesson name..."
          />
        </div>
        <Button 
          className="w-full" 
          onClick={handleGenerateScript}
          disabled={isGenerating || !courseName || !lessonName}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Script
        </Button>
      </div>

      {generatedScript && (
        <Card className="p-4">
          <Label>Generated Script</Label>
          <Textarea 
            value={generatedScript}
            className="mt-2 min-h-[200px]"
            readOnly
          />
          <div className="flex space-x-2 mt-4">
            <Button 
              className="flex-1" 
              onClick={handleGenerateAudio}
              disabled={isGenerating}
            >
              <Mic className="mr-2 h-4 w-4" />
              Generate Audio
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleGenerateVideo}
              disabled={isGenerating}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Generate Video
            </Button>
          </div>
        </Card>
      )}

      {generatedContent && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Generated {generatedContent.type}</Label>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          {generatedContent.type === 'video' && (
            <video 
              controls 
              className="w-full rounded-lg"
              src={generatedContent.url}
            />
          )}
          {generatedContent.type === 'audio' && (
            <audio 
              controls 
              className="w-full"
              src={generatedContent.url}
            />
          )}
        </Card>
      )}
    </div>
  );
}