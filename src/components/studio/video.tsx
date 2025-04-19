import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Monitor,
  PictureInPicture,
  Video as VideoIcon,
  Download,
  StopCircle,
  Circle,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RecordingMode = 'camera' | 'screen' | 'both';
type CameraPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const Video: React.FC = () => {
  const [mode, setMode] = useState<RecordingMode>('camera');
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('top-left');
  const [recording, setRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const drawIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording function, handling three modes.
  const startRecording = async () => {
    setDownloadUrl(null);
    recordedChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (mode === 'camera') {
        // Camera mode: get video + audio from webcam
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        cameraStreamRef.current = camStream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = camStream;
          await cameraVideoRef.current.play();
        }
        startMediaRecorder(camStream);
      } else if (mode === 'screen') {
        // Screen mode: capture screen and add microphone audio
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;
        let micStream: MediaStream | null = null;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioStreamRef.current = micStream;
        } catch (err) {
          console.warn('No microphone available or permission denied.');
        }
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          await screenVideoRef.current.play();
        }
        const combined = new MediaStream();
        screenStream.getVideoTracks().forEach((track) => combined.addTrack(track));
        if (micStream) {
          micStream.getAudioTracks().forEach((track) => combined.addTrack(track));
        }
        combinedStreamRef.current = combined;
        startMediaRecorder(combined);
      } else if (mode === 'both') {
        // Both mode: capture screen, camera, and optional mic
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        cameraStreamRef.current = camStream;
        let micStream: MediaStream | null = null;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioStreamRef.current = micStream;
        } catch (err) {
          console.warn('No microphone available or permission denied.');
        }
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          await screenVideoRef.current.play();
        }
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = camStream;
          await cameraVideoRef.current.play();
        }

        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not found');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context not available');
        const screenTrack = screenStream.getVideoTracks()[0];
        const { width = 1280, height = 720 } = screenTrack.getSettings();
        canvas.width = width;
        canvas.height = height;

        // Drawing function that composites the screen and camera video
        const drawComposite = () => {
          // Draw the screen video as background.
          ctx.drawImage(screenVideoRef.current as HTMLVideoElement, 0, 0, canvas.width, canvas.height);
          
          // Determine picture-in-picture size
          const pipWidth = canvas.width / 4;
          const pipHeight = pipWidth * 0.75;
          // Compute the position based on selected cameraPosition.
          let x = 10;
          let y = 10;
          switch (cameraPosition) {
            case 'top-left':
              x = 10;
              y = 10;
              break;
            case 'top-right':
              x = canvas.width - pipWidth - 10;
              y = 10;
              break;
            case 'bottom-left':
              x = 10;
              y = canvas.height - pipHeight - 10;
              break;
            case 'bottom-right':
              x = canvas.width - pipWidth - 10;
              y = canvas.height - pipHeight - 10;
              break;
          }
          ctx.drawImage(cameraVideoRef.current as HTMLVideoElement, x, y, pipWidth, pipHeight);
        };

        drawIntervalRef.current = window.setInterval(drawComposite, 33);

        const canvasStream = canvas.captureStream(30);
        if (micStream) {
          micStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
        }
        combinedStreamRef.current = canvasStream;
        startMediaRecorder(canvasStream);
      }
      setRecording(true);
      // Start the recording timer.
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const startMediaRecorder = (stream: MediaStream) => {
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm; codecs=vp9,opus' };
    const recorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = handleRecordingStop;
    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Stop all active streams/tracks.
    [cameraStreamRef.current, screenStreamRef.current, audioStreamRef.current, combinedStreamRef.current].forEach(
      (stream) => stream?.getTracks().forEach((track) => track.stop())
    );
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRecording(false);
  };

  const handleRecordingStop = () => {
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [downloadUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-4xl">
            <VideoIcon className="w-8 h-8 text-primary" />
            Video Recorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mode Selection and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-96">
              <Select value={mode} onValueChange={(val: RecordingMode) => setMode(val)}>
                <SelectTrigger className="w-[200px]">
                  {mode === 'camera' ? (
                    <span className="flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Camera
                    </span>
                  ) : mode === 'screen' ? (
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Screen
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PictureInPicture className="w-4 h-4" /> Camera + Screen
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camera">
                    <span className="flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Camera Only
                    </span>
                  </SelectItem>
                  <SelectItem value="screen">
                    <span className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Screen Only
                    </span>
                  </SelectItem>
                  <SelectItem value="both">
                    <span className="flex items-center gap-2">
                      <PictureInPicture className="w-4 h-4" /> Camera + Screen
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Only show the camera position selector in 'both' mode */}
              {mode === 'both' && (
                <Select value={cameraPosition} onValueChange={(val: CameraPosition) => setCameraPosition(val)}>
                  <SelectTrigger className="w-[200px]">
                    {cameraPosition === 'top-left' && 'Top Left'}
                    {cameraPosition === 'top-right' && 'Top Right'}
                    {cameraPosition === 'bottom-left' && 'Bottom Left'}
                    {cameraPosition === 'bottom-right' && 'Bottom Right'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center gap-4">
                <Button
                  onClick={recording ? stopRecording : startRecording}
                  variant={recording ? 'destructive' : 'default'}
                  className={cn('transition-all duration-300', recording && 'animate-pulse')}
                >
                  {recording ? (
                    <>
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>

                {recording && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Timer className="w-4 h-4 mr-2" />
                    {formatTime(recordingTime)}
                  </Badge>
                )}
              </div>
            </div>

            {mode === 'both' && <canvas ref={canvasRef} className="hidden" />}

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(mode === 'camera' || mode === 'both') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Camera Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {(mode === 'screen' || mode === 'both') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      {mode === 'both' ? 'Screen (Composite)' : 'Screen Preview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                      <video
                        ref={screenVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recorded Video */}
            {downloadUrl && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <VideoIcon className="w-4 h-4" /> Recorded Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                    <video src={downloadUrl} controls className="w-full h-full" />
                  </div>
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href={downloadUrl} download="recording.webm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Recording
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Video;
