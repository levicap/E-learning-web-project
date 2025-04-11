import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut,
  Download,
  ArrowRight
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  connections: string[];
  color?: string;
}

interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface Connection {
  from: string;
  to: string;
  color: string;
}

function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', text: 'Main Concept', x: 500, y: 300, connections: [], color: 'hsl(var(--primary))' }
  ]);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(2);
  const [mode, setMode] = useState<'mindmap' | 'drawing'>('mindmap');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const mindmapRef = useRef<HTMLDivElement>(null);

  const addNode = () => {
    const newNode: Node = {
      id: Date.now().toString(),
      text: 'New Concept',
      x: Math.random() * 800 + 100,
      y: Math.random() * 400 + 100,
      connections: [],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes(nodes.map(node => node.id === id ? { ...node, text } : node));
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.map(node => ({
      ...node,
      connections: node.connections.filter(conn => conn !== id)
    })).filter(node => node.id !== id));
    setConnections(connections.filter(conn => conn.from !== id && conn.to !== id));
  };

  const handleNodeClick = (id: string) => {
    if (connecting && selectedNode && selectedNode !== id) {
      const sourceNode = nodes.find(n => n.id === selectedNode);
      if (sourceNode && !sourceNode.connections.includes(id)) {
        setNodes(nodes.map(node => {
          if (node.id === selectedNode) {
            return { ...node, connections: [...node.connections, id] };
          }
          return node;
        }));
        setConnections([...connections, {
          from: selectedNode,
          to: id,
          color: sourceNode.color || 'hsl(var(--primary))'
        }]);
      }
      setConnecting(false);
      setSelectedNode(null);
    } else {
      setSelectedNode(id);
      if (!connecting) {
        setConnecting(true);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'drawing') {
      if (!isDrawing || !currentPath) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCurrentPath({
        ...currentPath,
        points: [...currentPath.points, { x: e.clientX - rect.left, y: e.clientY - rect.top }]
      });
    } else {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleNodeDrag = (id: string, e: React.DragEvent) => {
    const { clientX, clientY } = e;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clientX - rect.width / 2;
    const y = clientY - rect.height / 2;

    // Smooth node movement
    setNodes((prevNodes) =>
      prevNodes.map(node => 
        node.id === id ? { ...node, x, y } : node
      )
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'drawing') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    setCurrentPath({
      points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
      color: drawingColor,
      width: drawingWidth
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentPath) return;
    setPaths([...paths, currentPath]);
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const exportToPng = useCallback(async () => {
    if (!mindmapRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(mindmapRef.current, {
        backgroundColor: 'white',
        quality: 1,
        pixelRatio: 2
      });

      const link = document.createElement('a');
      link.download = 'mindmap.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  }, []);

  const undoLastDrawing = () => {
    setPaths(paths.slice(0, -1));
  };

  const clearDrawings = () => {
    setPaths([]);
  };

  const calculateArrowPoints = (x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = 15;

    const points = [
      [x2, y2],
      [x2 - length * Math.cos(angle - Math.PI / 6), y2 - length * Math.sin(angle - Math.PI / 6)],
      [x2 - length * Math.cos(angle + Math.PI / 6), y2 - length * Math.sin(angle + Math.PI / 6)]
    ];

    return points;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6" />
            <h1 className="text-xl font-bold">MindFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={exportToPng}>
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'mindmap' | 'drawing')} className="mb-6">
          <TabsList>
            <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
            <TabsTrigger value="drawing">Drawing</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-4">
          <div className="w-64">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Tools</h2>
              {mode === 'mindmap' ? (
                <div className="space-y-2">
                  <Button className="w-full" onClick={addNode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Node
                  </Button>
                  <Button 
                    className="w-full" 
                    variant={connecting ? "secondary" : "outline"}
                    onClick={() => {
                      if (connecting) {
                        setConnecting(false);
                        setSelectedNode(null);
                      } else if (selectedNode) {
                        setConnecting(true);
                      }
                    }}
                    disabled={!selectedNode}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {connecting ? "Select Target Node" : "Connect Nodes"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Width</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={drawingWidth}
                      onChange={(e) => setDrawingWidth(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <Button className="w-full" variant="outline" onClick={undoLastDrawing}>
                    Undo
                  </Button>
                  <Button className="w-full" variant="destructive" onClick={clearDrawings}>
                    Clear All
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="flex-1">
            <Card 
              className="relative overflow-hidden" 
              style={{ height: 'calc(100vh - 200px)' }}
              ref={mindmapRef}
            >
              <ScrollArea className="h-full">
                <div 
                  ref={canvasRef}
                  className="relative w-full h-full min-h-[800px]"
                  style={{ transform: `scale(${zoom})` }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Drawing Layer */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {paths.map((path, index) => (
                      <polyline
                        key={index}
                        points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
                        stroke={path.color}
                        strokeWidth={path.width}
                        fill="none"
                      />
                    ))}
                    {currentPath && (
                      <polyline
                        points={currentPath.points.map(p => `${p.x},${p.y}`).join(' ')}
                        stroke={currentPath.color}
                        strokeWidth={currentPath.width}
                        fill="none"
                      />
                    )}
                  </svg>

                  {/* Connection Preview */}
                  {connecting && selectedNode && mode === 'mindmap' && (
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
                      {(() => {
                        const sourceNode = nodes.find(n => n.id === selectedNode);
                        if (!sourceNode) return null;
                        
                        const x1 = sourceNode.x + 100;
                        const y1 = sourceNode.y + 25;
                        const x2 = mousePosition.x;
                        const y2 = mousePosition.y;
                        
                        const arrowPoints = calculateArrowPoints(x1, y1, x2, y2);
                        
                        return (
                          <>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={sourceNode.color}
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                            <polygon
                              points={arrowPoints.map(p => p.join(',')).join(' ')}
                              fill={sourceNode.color}
                            />
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {/* Mind Map Layer */}
                  {nodes.map(node => (
                    <div key={node.id}>
                      {node.connections.map(targetId => {
                        const target = nodes.find(n => n.id === targetId);
                        if (!target) return null;
                        
                        const x1 = node.x + 100;
                        const y1 = node.y + 25;
                        const x2 = target.x + 100;
                        const y2 = target.y + 25;
                        
                        const arrowPoints = calculateArrowPoints(x1, y1, x2, y2);
                        
                        return (
                          <svg
                            key={`${node.id}-${targetId}`}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 0 }}
                          >
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={node.color}
                              strokeWidth="2"
                            />
                            <polygon
                              points={arrowPoints.map(p => p.join(',')).join(' ')}
                              fill={node.color}
                            />
                          </svg>
                        );
                      })}
                      <div
                        className={`absolute p-4 cursor-move transition-shadow duration-200 ${selectedNode === node.id ? 'ring-2 ring-primary shadow-lg' : 'shadow-md hover:shadow-lg'} ${connecting && selectedNode !== node.id ? 'cursor-pointer' : ''}`}
                        style={{
                          left: node.x,
                          top: node.y,
                          zIndex: 1,
                          backgroundColor: 'hsl(var(--card))',
                          borderRadius: 'var(--radius)',
                          width: '200px',
                          borderLeft: `4px solid ${node.color}`
                        }}
                        onClick={() => handleNodeClick(node.id)}
                        draggable
                        onDragEnd={(e) => handleNodeDrag(node.id, e)}
                      >
                        <Input
                          value={node.text}
                          onChange={(e) => updateNodeText(node.id, e.target.value)}
                          className="mb-2"
                        />
                        {node.id !== '1' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => deleteNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nodes;
