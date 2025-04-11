import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface StudyTimerProps {
  isStudying: boolean;
  progress: number;
  questionsCount: number;
  onPause: () => void;
  onResume: () => void;
}

export function StudyTimer({ isStudying, progress, questionsCount, onPause, onResume }: StudyTimerProps) {
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isStudying && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, isPaused]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume();
    } else {
      setIsPaused(true);
      onPause();
    }
  };

  return (
    <Card className="border-2 border-blue-100 shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          Study Progress
        </CardTitle>
        <CardDescription>Track your achievement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Session Time</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg font-mono">
                {formatTime(timer)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                className="h-8 px-2"
              >
                {isPaused ? '▶️' : '⏸️'}
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Questions Asked</span>
            <Badge variant="secondary">{questionsCount}</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}