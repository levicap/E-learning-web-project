import { useState, useRef, useCallback } from 'react';

interface MediaRecorderOptions {
  type: 'screen' | 'audio' | 'video' | 'screen-and-video';
}

export function useMediaRecorder({ type }: MediaRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;

      switch (type) {
        case 'screen':
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          break;
        case 'audio':
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          break;
        case 'video':
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          break;
        case 'screen-and-video':
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const tracks = [...screenStream.getTracks(), ...cameraStream.getTracks()];
          stream = new MediaStream(tracks);
          break;
        default:
          throw new Error('Invalid recording type');
      }

      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [type]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && streamRef.current) {
      mediaRecorder.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);

      return new Promise<Blob>((resolve) => {
        mediaRecorder.current!.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          resolve(blob);
        };
      });
    }
    return Promise.resolve(null);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  }, []);

  return {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    stream: streamRef.current,
  };
}