import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'react-flow-renderer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Trash } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Main Topic' },
    position: { x: 250, y: 0 },
  },
];

export function MindMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeName, setNodeName] = useState('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = useCallback(() => {
    if (!nodeName) return;

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: { label: nodeName },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeName('');
  }, [nodeName, nodes.length, setNodes]);

  const handleDownload = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Input
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Enter node text"
            className="w-48"
          />
          <Button variant="outline" size="sm" onClick={addNode}>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
      <div className="h-[400px] border rounded-lg bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}