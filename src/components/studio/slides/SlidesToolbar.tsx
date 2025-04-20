import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Text,
  Shapes,
  Type,
  Settings2,
  SlidersHorizontal,
  Image,
  Video,
  Table,
  ChartBar,
  Link,
  Layout,
  Palette,
  Play,
} from "lucide-react";

interface SlidesToolbarProps {
  onInsertElement: (type: string) => void;
  onChangeLayout: () => void;
  onChangeTheme: () => void;
  onStartPresentation: () => void;
}

export function SlidesToolbar({
  onInsertElement,
  onChangeLayout,
  onChangeTheme,
  onStartPresentation,
}: SlidesToolbarProps) {
  return (
    <div className="border-b p-2">
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("text")}>
                  <Text className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Text</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("shape")}>
                  <Shapes className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Shape</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("image")}>
                  <Image className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Image</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("video")}>
                  <Video className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Video</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("table")}>
                  <Table className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Table</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("chart")}>
                  <ChartBar className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Chart</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onInsertElement("link")}>
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Link</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onChangeLayout}>
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </Button>
          <Button variant="outline" size="sm" onClick={onChangeTheme}>
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </Button>
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Transitions
          </Button>
          <Button variant="default" size="sm" onClick={onStartPresentation}>
            <Play className="h-4 w-4 mr-2" />
            Present
          </Button>
        </div>
      </div>
    </div>
  );
}