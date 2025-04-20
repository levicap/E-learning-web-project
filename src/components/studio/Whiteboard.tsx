import { useRef, useEffect, useState, MouseEvent, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Eraser, Undo2, Download, Maximize2, Minimize2 } from 'lucide-react';

interface ImageState {
  id: string;
  src: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
}

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multi-image state.
  const [uploadedImages, setUploadedImages] = useState<ImageState[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizingImage, setIsResizingImage] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Initializes or resizes canvas to fit its container dimensions.
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Save current drawing contents if possible.
    const prevImage = contextRef.current
      ? contextRef.current.getImageData(0, 0, canvas.width, canvas.height)
      : null;

    // Set canvas width and height to container's client dimensions.
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    contextRef.current = context;

    // Restore previous content if available.
    if (prevImage) {
      context.putImageData(prevImage, 0, 0);
    } else {
      // Save initial state to history.
      const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
    }
  };

  useEffect(() => {
    resizeCanvas();

    // Resize on fullscreen change or window resize.
    const handleResize = () => {
      resizeCanvas();
    };

    document.addEventListener('fullscreenchange', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('fullscreenchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, lineWidth]);

  // Drawing handlers.
  const startDrawing = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.closePath();
      setIsDrawing(false);

      // Save state to history.
      const newState = contextRef.current.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setHistory(prev => [...prev, newState]);
    }
  };

  const handleUndo = () => {
    if (history.length > 1 && contextRef.current && canvasRef.current) {
      const newHistory = history.slice(0, -1);
      const lastState = newHistory[newHistory.length - 1];
      contextRef.current.putImageData(lastState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const newState = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([newState]);
    }
  };

  // New handleDownload to combine canvas and image overlays.
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    // Fill background with white.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    // Draw the whiteboard's drawing.
    ctx.drawImage(canvas, 0, 0);

    // Draw each uploaded image.
    const drawPromises = uploadedImages.map(imageState =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = imageState.src;
        img.onload = () => {
          ctx.drawImage(
            img,
            imageState.pos.x,
            imageState.pos.y,
            imageState.size.width,
            imageState.size.height
          );
          resolve();
        };
        img.onerror = reject;
      })
    );
    try {
      await Promise.all(drawPromises);
    } catch (error) {
      console.error("Error drawing images", error);
    }

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = offscreen.toDataURL('image/png');
    link.click();
  };

  // Fullscreen toggle.
  const toggleFullscreen = async () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error enabling fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
      }
    }
  };

  // IMAGE UPLOAD, DRAG, RESIZE, & DELETE HANDLERS

  // When the user uploads an image.
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        // Create a unique ID for the image.
        const id = `${Date.now()}-${Math.random()}`;
        // Add the new image to state.
        setUploadedImages(prev => [
          ...prev,
          {
            id,
            src,
            pos: { x: 50, y: 50 },
            size: { width: img.width * 0.5, height: img.height * 0.5 }
          }
        ]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Delete an image from the whiteboard.
  const handleDeleteImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // Common handler for mouse down on an image overlay.
  const handleImageMouseDown = (e: MouseEvent<HTMLDivElement>, id: string) => {
    const imageState = uploadedImages.find(img => img.id === id);
    if (!imageState) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // If near bottom-right corner (20x20 area), start resizing.
    if (offsetX > imageState.size.width - 20 && offsetY > imageState.size.height - 20) {
      setIsResizingImage(id);
      setResizeStart({ x: e.clientX, y: e.clientY });
      setInitialSize({ ...imageState.size });
    } else {
      // Otherwise, start dragging.
      setIsDraggingImage(id);
      setDragOffset({ x: offsetX, y: offsetY });
    }
    e.stopPropagation();
  };

  const handleImageMouseMove = (e: MouseEvent<HTMLDivElement>, id: string) => {
    const index = uploadedImages.findIndex(img => img.id === id);
    if (index === -1) return;
    const imageState = uploadedImages[index];

    if (isDraggingImage === id) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[index] = { ...imageState, pos: { x: newX, y: newY } };
        return newImages;
      });
    } else if (isResizingImage === id) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[index] = {
          ...imageState,
          size: {
            width: Math.max(20, initialSize.width + deltaX),
            height: Math.max(20, initialSize.height + deltaY)
          }
        };
        return newImages;
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(null);
    setIsResizingImage(null);
  };

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? "w-full h-full" : "space-y-4"} relative flex flex-col`}
    >
      {/* Control bar */}
      <div className="flex justify-between items-center">
        <div className="space-x-2 flex items-center">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              if (contextRef.current) {
                contextRef.current.strokeStyle = e.target.value;
              }
            }}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => {
              setLineWidth(Number(e.target.value));
              if (contextRef.current) {
                contextRef.current.lineWidth = Number(e.target.value);
              }
            }}
            className="w-24"
          />
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Eraser className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          {/* Image upload control */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-1 rounded"
          />
        </div>
        <div className="space-x-2 flex items-center">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`${isFullscreen ? "w-full h-full" : "w-full h-[400px]"} border rounded-lg bg-white cursor-crosshair`}
      />
      
      {/* Render each uploaded image */}
      {uploadedImages.map((img) => (
        <div
          key={img.id}
          style={{
            position: 'absolute',
            top: img.pos.y,
            left: img.pos.x,
            width: img.size.width,
            height: img.size.height,
            cursor: isResizingImage === img.id ? 'nwse-resize' : 'move',
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleImageMouseDown(e, img.id)}
          onMouseMove={(e) => handleImageMouseMove(e, img.id)}
          onMouseUp={handleImageMouseUp}
          onMouseLeave={handleImageMouseUp}
        >
          <img
            src={img.src}
            alt="Uploaded"
            style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
          />
          {/* Resize handle in bottom-right */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              cursor: 'nwse-resize'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizingImage(img.id);
              setResizeStart({ x: e.clientX, y: e.clientY });
              setInitialSize({ ...img.size });
            }}
          ></div>
          {/* Delete button (top-right corner) */}
          <Button
            variant="destructive"
            size="xs"
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              zIndex: 10,
              padding: 0,
              minWidth: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage(img.id);
            }}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
}
