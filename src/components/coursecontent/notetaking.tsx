import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  FileText,
  Type,
  Palette,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const TEXT_COLORS = [
  { name: 'Default', color: 'inherit' },
  { name: 'Gray', color: '#6B7280' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Yellow', color: '#F59E0B' },
  { name: 'Green', color: '#10B981' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: 'transparent' },
  { name: 'Yellow', color: '#FEF3C7' },
  { name: 'Green', color: '#D1FAE5' },
  { name: 'Blue', color: '#DBEAFE' },
  { name: 'Purple', color: '#EDE9FE' },
  { name: 'Pink', color: '#FCE7F3' },
];

export default function NoteTaking({ isOpen, setIsOpen, contentState, setContentState }) {
  const editorRef = useRef(null);

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem('noteContent');
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
      setContentState(saved);
    }
  }, [setContentState]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContentState(html);
      localStorage.setItem('noteContent', html);
    }
  };

  const formatText = (command, value = '') => {
    document.execCommand(command, false, value);
    handleEditorInput();
    editorRef.current?.focus();
  };

  const exportToPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Note Export</title>
            <style>body { font-family: Arial; margin:2rem; }</style>
          </head>
          <body>${contentState}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Note exported to PDF');
    }
  };

  const exportToWord = () => {
    const blob = new Blob([`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Note</title></head>
      <body>${contentState}</body></html>
    `], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'note.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success('Note exported to Word');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Quick Note</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 items-center p-2 bg-muted/30 rounded-md mb-2">
          <Button variant="ghost" size="icon" onClick={() => formatText('bold')} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => formatText('italic')} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => formatText('underline')} title="Underline">
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => formatText('insertUnorderedList')} title="Bullet">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => formatText('insertOrderedList')} title="Numbered">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => formatText('justifyLeft')} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => formatText('justifyCenter')} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => formatText('justifyRight')} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" title="Text Color">
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted"
                    onClick={() => formatText('foreColor', c.color)}
                    title={c.name}
                  >
                    <span
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: c.color === 'inherit' ? 'currentColor' : c.color }}
                    />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" title="Highlight">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted"
                    onClick={() => formatText('backColor', c.color)}
                    title={c.name}
                  >
                    <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: c.color }} />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Export">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPdf}>
                <FileText className="mr-2 h-4 w-4" /> Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToWord}>
                <FileText className="mr-2 h-4 w-4" /> Export to Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          className="flex-1 p-4 overflow-auto border rounded-md bg-background focus:outline-none"
          contentEditable
          onInput={handleEditorInput}
          suppressContentEditableWarning
        />
      </DialogContent>
    </Dialog>
  );
}
