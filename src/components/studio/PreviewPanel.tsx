import { useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";

interface PreviewPanelProps {
  recordingType: 'screen' | 'audio' | 'video';
  isRecording: boolean;
  stream: MediaStream | null;
}

export function PreviewPanel({ recordingType, isRecording, stream }: PreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (stream && videoRef.current && (recordingType === 'video' || recordingType === 'screen')) {
      videoRef.current.srcObject = stream;
    }

    if (stream && canvasRef.current && recordingType === 'audio') {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = 'rgb(36, 36, 36)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;
          ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, recordingType]);

  return (
    <div className="aspect-video w-full bg-muted rounded-lg relative overflow-hidden">
      {(recordingType === 'video' || recordingType === 'screen') && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      {recordingType === 'audio' && (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={800}
          height={200}
        />
      )}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">
            {isRecording ? `Recording ${recordingType}...` : `Click Start Recording to begin`}
          </p>
        </div>
      )}
    </div>
  );
}