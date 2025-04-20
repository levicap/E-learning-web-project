import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  content: {
    type: string;
    data: any;
  }[];
}

interface SlideEditorProps {
  slides: Slide[];
  selectedSlide: number | null;
  onSlideSelect: (index: number) => void;
  onNewSlide: () => void;
  onSlideContentChange: (slideId: number, content: any) => void;
}

export function SlideEditor({
  slides,
  selectedSlide,
  onSlideSelect,
  onNewSlide,
  onSlideContentChange,
}: SlideEditorProps) {
  const [draggedElement, setDraggedElement] = useState<{ type: string; data: any } | null>(null);

  const handleDragStart = (type: string, data: any) => {
    setDraggedElement({ type, data });
  };

  const handleDrop = (e: React.DragEvent, slideId: number) => {
    e.preventDefault();
    if (draggedElement && selectedSlide !== null) {
      const updatedContent = [...slides[selectedSlide].content, draggedElement];
      onSlideContentChange(slideId, updatedContent);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full">
      {/* Slides Sidebar */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 space-y-2">
          <Button className="w-full" onClick={onNewSlide}>
            <Plus className="h-4 w-4 mr-2" />
            New Slide
          </Button>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "p-2 cursor-pointer rounded-lg mb-2",
                  selectedSlide === index ? "bg-accent" : "hover:bg-accent/50"
                )}
                onClick={() => onSlideSelect(index)}
              >
                <div className="aspect-video bg-background rounded-md mb-2" />
                <div className="text-xs font-medium">Slide {index + 1}</div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 p-8 bg-neutral-50">
        <div
          className="max-w-4xl mx-auto aspect-[16/9] bg-white rounded-lg shadow-lg p-8"
          onDrop={(e) => selectedSlide !== null && handleDrop(e, slides[selectedSlide].id)}
          onDragOver={handleDragOver}
        >
          {selectedSlide === null ? (
            <div className="h-full border-2 border-dashed border-neutral-200 rounded-md flex items-center justify-center">
              <div className="text-center space-y-4">
                <Pencil className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Select a slide to edit</p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {slides[selectedSlide].content.map((element, index) => (
                <div key={index} className="mb-4">
                  {/* Render different types of content */}
                  {element.type === "text" && (
                    <div contentEditable className="min-h-[2em] p-2 border rounded focus:outline-none focus:ring-2">
                      {element.data}
                    </div>
                  )}
                  {element.type === "image" && (
                    <img src={element.data} alt="" className="max-w-full h-auto" />
                  )}
                  {/* Add more content type renderers */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}