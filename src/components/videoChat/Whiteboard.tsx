import React, { useEffect, useRef, useState } from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Download, 
  Trash2, 
  Undo, 
  Redo,
  Image as ImageIcon,
  Upload,
  File,
  FileText,
  FileCode,
  File as FilePdf,
  FileArchive,
  User,
  ExternalLink,
  Clock,
  Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';

interface WhiteboardProps {
  roomId: string;
  userId: string;
}

type DrawingMode = 'pencil' | 'rectangle' | 'circle' | 'text' | 'eraser';
type DrawingAction = {
  type: 'draw' | 'clear';
  mode: DrawingMode;
  points?: { x: number; y: number }[];
  color?: string;
  size?: number;
  text?: string;
  position?: { x: number; y: number };
  dimensions?: { width: number; height: number };
  userId?: string; // Add userId to track who made the action
};

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploaderId: string;
  timestamp: Date;
}

const colors = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
];

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId, userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [redoActions, setRedoActions] = useState<DrawingAction[]>([]);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const [currentTab, setCurrentTab] = useState<'draw' | 'notes' | 'files'>('draw');
  
  // Notes state
  const [notesContent, setNotesContent] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Files state
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drawing state
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Initialize canvas, socket connection, notes, and files
  useEffect(() => {
    // Initialize real socket connection
    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join all necessary rooms
      socket.emit('join-whiteboard', { roomId, userId });
      socket.emit('join-notes', { roomId });
      socket.emit('join-files', { roomId });
      
      // Request initial data
      socket.emit('get-whiteboard-state', { roomId });
      socket.emit('get-notes', { roomId });
      socket.emit('get-files', { roomId });
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socket.on('whiteboard-state', (state: { actions: DrawingAction[] }) => {
      setActions(state.actions);
      
      // Redraw the canvas with the received actions
      if (contextRef.current && canvasRef.current) {
        // Clear canvas
        contextRef.current.fillStyle = '#ffffff';
        contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Apply all actions
        state.actions.forEach(action => drawFromAction(action));
      }
    });
    
    socket.on('whiteboard-action', (action: DrawingAction) => {
      // Only apply actions from other users
      if (action.userId !== userId) {
        setActions(prev => [...prev, action]);
        drawFromAction(action);
      }
    });
    
    socket.on('notes-state', (content: string) => {
      setNotesContent(content);
      setIsLoadingNotes(false);
    });
    
    socket.on('note-updated', (content: string) => {
      setNotesContent(content);
    });
    
    socket.on('files-update', (updatedFiles: SharedFile[]) => {
      setFiles(updatedFiles);
    });
    
    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Get context
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = size;
        contextRef.current = context;

        // Clear canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (canvas && contextRef.current) {
        // Save current drawing
        const imageData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
        
        // Resize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Restore context properties
        contextRef.current.lineCap = 'round';
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = size;
        
        // Restore drawing
        contextRef.current.putImageData(imageData, 0, 0);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      socket.disconnect();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [roomId, userId]);

  // Update context when color or size changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = size;
    }
  }, [color, size]);

  // WHITEBOARD FUNCTIONS
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || textPosition) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    startPointRef.current = { x: offsetX, y: offsetY };
    currentPathRef.current = [{ x: offsetX, y: offsetY }];
    
    if (drawingMode === 'text') {
      setTextPosition({ x: offsetX, y: offsetY });
      return;
    }
    
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current || !startPointRef.current) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (drawingMode === 'pencil' || drawingMode === 'eraser') {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      
      // Add point to current path
      currentPathRef.current.push({ x: offsetX, y: offsetY });
    }
  };

  const finishDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current || !startPointRef.current) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const startX = startPointRef.current.x;
    const startY = startPointRef.current.y;
    
    if (drawingMode === 'rectangle') {
      contextRef.current.strokeRect(startX, startY, offsetX - startX, offsetY - startY);
      currentPathRef.current = [
        { x: startX, y: startY },
        { x: offsetX, y: offsetY }
      ];
    } else if (drawingMode === 'circle') {
      const radius = Math.sqrt(Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2));
      contextRef.current.beginPath();
      contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
      currentPathRef.current = [
        { x: startX, y: startY },
        { x: offsetX, y: offsetY }
      ];
    }
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Add action to history
    const newAction: DrawingAction = {
      type: 'draw',
      mode: drawingMode,
      color,
      size,
      points: [...currentPathRef.current],
      userId
    };
    
    setActions(prev => [...prev, newAction]);
    setRedoActions([]);
    
    // Emit action to other users
    socketRef.current?.emit('whiteboard-action', { roomId, action: newAction });
    
    // Reset start point and current path
    startPointRef.current = null;
    currentPathRef.current = [];
  };

  const addText = () => {
    if (!textPosition || !contextRef.current || !textInput.trim()) return;
    
    contextRef.current.font = `${size * 3}px Arial`;
    contextRef.current.fillStyle = color;
    contextRef.current.fillText(textInput, textPosition.x, textPosition.y);
    
    // Add action to history
    const newAction: DrawingAction = {
      type: 'draw',
      mode: 'text',
      text: textInput,
      position: textPosition,
      color,
      size: size * 3,
      userId
    };
    
    setActions(prev => [...prev, newAction]);
    setRedoActions([]);
    
    // Emit action to other users
    socketRef.current?.emit('whiteboard-action', { roomId, action: newAction });
    
    // Reset text input
    setTextInput('');
    setTextPosition(null);
  };

  const clearCanvas = (emitToServer = true) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (emitToServer) {
      // Add clear action to history
      const newAction: DrawingAction = {
        type: 'clear',
        mode: 'pencil',
        userId
      };
      
      setActions(prev => [...prev, newAction]);
      setRedoActions([]);
      
      // Emit action to other users
      socketRef.current?.emit('whiteboard-action', { roomId, action: newAction });
    }
  };

  const undo = () => {
    if (actions.length === 0) return;
    
    const actionsToKeep = [...actions];
    const actionToUndo = actionsToKeep.pop();
    
    if (actionToUndo) {
      setRedoActions(prev => [...prev, actionToUndo]);
      setActions(actionsToKeep);
      
      // Redraw canvas from remaining actions
      if (!contextRef.current || !canvasRef.current) return;
      
      contextRef.current.fillStyle = '#ffffff';
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      actionsToKeep.forEach(action => drawFromAction(action));
      
      // Emit updated state to other users
      socketRef.current?.emit('whiteboard-state-update', { roomId, actions: actionsToKeep });
    }
  };

  const redo = () => {
    if (redoActions.length === 0) return;
    
    const redoActionsToKeep = [...redoActions];
    const actionToRedo = redoActionsToKeep.pop();
    
    if (actionToRedo) {
      setActions(prev => [...prev, actionToRedo]);
      setRedoActions(redoActionsToKeep);
      
      // Apply the action to the canvas
      drawFromAction(actionToRedo);
      
      // Emit updated state to other users
      socketRef.current?.emit('whiteboard-state-update', { 
        roomId, 
        actions: [...actions, actionToRedo] 
      });
    }
  };

  const drawFromAction = (action: DrawingAction) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    if (action.type === 'clear') {
      contextRef.current.fillStyle = '#ffffff';
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      return;
    }
    
    // Save current context settings
    const currentColor = contextRef.current.strokeStyle;
    const currentLineWidth = contextRef.current.lineWidth;
    
    // Apply action settings
    if (action.color) contextRef.current.strokeStyle = action.color;
    if (action.size) contextRef.current.lineWidth = action.size;
    
    if (action.mode === 'text' && action.text && action.position) {
      contextRef.current.font = `${action.size || 15}px Arial`;
      contextRef.current.fillStyle = action.color || '#000000';
      contextRef.current.fillText(action.text, action.position.x, action.position.y);
    } else if (action.mode === 'rectangle' && action.points && action.points.length >= 2) {
      const [start, end] = action.points;
      contextRef.current.strokeRect(
        start.x, 
        start.y, 
        end.x - start.x, 
        end.y - start.y
      );
    } else if (action.mode === 'circle' && action.points && action.points.length >= 2) {
      const [center, edge] = action.points;
      const radius = Math.sqrt(
        Math.pow(edge.x - center.x, 2) + 
        Math.pow(edge.y - center.y, 2)
      );
      contextRef.current.beginPath();
      contextRef.current.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
    } else if ((action.mode === 'pencil' || action.mode === 'eraser') && 
               action.points && action.points.length >= 2) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(action.points[0].x, action.points[0].y);
      
      for (let i = 1; i < action.points.length; i++) {
        contextRef.current.lineTo(action.points[i].x, action.points[i].y);
      }
      
      contextRef.current.stroke();
      contextRef.current.closePath();
    }
    
    // Restore previous context settings
    contextRef.current.strokeStyle = currentColor;
    contextRef.current.lineWidth = currentLineWidth;
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${new Date().toISOString()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !contextRef.current || !canvasRef.current) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const img = new Image();
      img.onload = () => {
        // Draw image at center of canvas
        const x = (canvasRef.current!.width - img.width) / 2;
        const y = (canvasRef.current!.height - img.height) / 2;
        contextRef.current!.drawImage(img, x, y);
        
        // Add action to history
        const newAction: DrawingAction = {
          type: 'draw',
          mode: 'pencil', // We don't have an image mode, so using pencil as placeholder
          userId,
          // In a real implementation, we would include image data
        };
        
        setActions(prev => [...prev, newAction]);
        setRedoActions([]);
        
        // Emit action to other users
        socketRef.current?.emit('whiteboard-action', { roomId, action: newAction });
      };
      img.src = event.target.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  // NOTES FUNCTIONS
  const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNotesContent(newContent);

    // Broadcast changes to other users
    socketRef.current?.emit('update-note', {
      roomId,
      content: newContent,
      userId
    });

    // Debounce save to server
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSavingNotes(true);
        // Save to server
        socketRef.current?.emit('save-note', {
          roomId,
          content: newContent,
          userId
        });
        setIsSavingNotes(false);
      } catch (error) {
        console.error('Failed to save notes:', error);
        setIsSavingNotes(false);
      }
    }, 1000);
  };

  // FILES FUNCTIONS
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FilePdf className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) {
      return <FileArchive className="h-6 w-6 text-yellow-500" />;
    } else if (fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css') || fileType.includes('json')) {
      return <FileCode className="h-6 w-6 text-green-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // In a real implementation, you would upload the file to a server
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', userId);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);
    
    // Simulate file upload
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        // Create a mock URL - in a real app, this would be the URL from your server
        const mockUrl = `https://example.com/files/${file.name}`;
        
        const newFile: SharedFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: mockUrl,
          uploadedBy: 'Current User',
          uploaderId: userId,
          timestamp: new Date()
        };
        
        // Emit to server
        socketRef.current?.emit('share-file', {
          roomId,
          file: newFile
        });
        
        setIsUploading(false);
        setUploadProgress(0);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    }, 2000);
  };

  const deleteFile = (fileId: string) => {
    // Emit to server
    socketRef.current?.emit('delete-file', {
      roomId,
      fileId
    });
  };

  // Helper function to create a className string
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Collaborative Whiteboard</h3>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium ${currentTab === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrentTab('draw')}
            >
              Draw
            </button>
            <button
              className={`px-4 py-2 font-medium ${currentTab === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrentTab('notes')}
            >
              Notes
            </button>
            <button
              className={`px-4 py-2 font-medium ${currentTab === 'files' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrentTab('files')}
            >
              Files
            </button>
          </div>
        </div>
        
        {/* DRAWING TAB */}
        {currentTab === 'draw' && (
          <div className="flex flex-col flex-1">
            <div className="flex justify-between p-2 border-b">
              <div className="flex gap-1">
                <button
                  className={`h-8 w-8 flex items-center justify-center rounded ${drawingMode === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setDrawingMode('pencil')}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className={`h-8 w-8 flex items-center justify-center rounded ${drawingMode === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setDrawingMode('rectangle')}
                >
                  <Square className="h-4 w-4" />
                </button>
                <button
                  className={`h-8 w-8 flex items-center justify-center rounded ${drawingMode === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setDrawingMode('circle')}
                >
                  <Circle className="h-4 w-4" />
                </button>
                <button
                  className={`h-8 w-8 flex items-center justify-center rounded ${drawingMode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setDrawingMode('text')}
                >
                  <Type className="h-4 w-4" />
                </button>
                <button
                  className={`h-8 w-8 flex items-center justify-center rounded ${drawingMode === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setDrawingMode('eraser')}
                >
                  <Eraser className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex gap-1">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded bg-gray-200"
                  onClick={undo}
                  disabled={actions.length === 0}
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded bg-gray-200"
                  onClick={redo}
                  disabled={redoActions.length === 0}
                >
                  <Redo className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded bg-gray-200"
                  onClick={() => clearCanvas()}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded bg-gray-200"
                  onClick={downloadCanvas}
                >
                  <Download className="h-4 w-4" />
                </button>
                <label htmlFor="upload-image" className="h-8 w-8 flex items-center justify-center rounded bg-gray-200 cursor-pointer">
                  <ImageIcon className="h-4 w-4" />
                  <input
                    id="upload-image"
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 border-b">
              <div className="flex gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "w-6 h-6 rounded-full border",
                      color === c && "ring-2 ring-blue-500 ring-offset-2"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              
              <div className="h-6 mx-2 border-l"></div>
              
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-xs">{size}px</span>
              </div>
            </div>
            
            {textPosition && (
              <div className="flex items-center gap-2 p-2 border-b">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="flex-1 px-2 py-1 border rounded"
                  autoFocus
                />
                <button 
                  className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  onClick={addText}
                >
                  Add
                </button>
                <button 
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => setTextPosition(null)}
                >
                  Cancel
                </button>
              </div>
            )}
            
            <div className="flex-1 relative">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                className="absolute inset-0 w-full h-full cursor-crosshair"
              />
            </div>
          </div>
        )}
        
        {/* NOTES TAB */}
        {currentTab === 'notes' && (
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">Collaborative Notes</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSavingNotes && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
              </div>
            </div>
            
            {isLoadingNotes ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <textarea
                value={notesContent}
                onChange={handleNotesChange}
                placeholder="Start taking notes... (Changes are saved automatically)"
                className="flex-1 resize-none border-none p-4 text-base font-mono h-full focus:outline-none"
              />
            )}
          </div>
        )}
        
        {/* FILES TAB */}
        {currentTab === 'files' && (
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Shared Files</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            <div className="p-4 border-b">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">
                  Share files with all participants in the session
                </p>
                
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
                
                {isUploading && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <File className="h-12 w-12 mb-2 opacity-20" />
                  <p>No files shared yet</p>
                  <p className="text-sm">Upload a file to share with everyone</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.id} className="border rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getFileIcon(file.type)}</div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{file.name}</h4>
                            <div className="flex gap-1">
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-gray-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              
                              {file.uploaderId === userId && (
                                <button 
                                  onClick={() => deleteFile(file.id)}
                                  className="h-7 w-7 flex items-center justify-center text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            <div className="mx-2 h-3 border-l"></div>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(file.timestamp).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <User className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-xs">Shared by {file.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <a 
                          href={file.url} 
                          download={file.name}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;