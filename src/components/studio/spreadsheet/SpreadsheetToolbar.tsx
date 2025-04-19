import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Italic,
  Paintbrush,
  Scissors,
  Underline,
  Filter,
  SortAsc,
  Table2,
  ChartBar,
  ImagePlus,
} from "lucide-react";

interface SpreadsheetToolbarProps {
  onFormatChange: (format: string) => void;
  onFunctionInsert: () => void;
  onFilter: () => void;
  onSort: () => void;
  onChartInsert: () => void;
}

export function SpreadsheetToolbar({
  onFormatChange,
  onFunctionInsert,
  onFilter,
  onSort,
  onChartInsert,
}: SpreadsheetToolbarProps) {
  return (
    <div className="border-b p-2 flex flex-col gap-2">
      <div className="flex items-center space-x-4">
        <Select defaultValue="Arial">
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Calibri">Calibri</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="11">
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-1 border-l border-r px-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1 border-l border-r px-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Scissors className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paintbrush className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onFunctionInsert}>
          Functions
        </Button>
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm" onClick={onSort}>
          <SortAsc className="h-4 w-4 mr-2" />
          Sort
        </Button>
        <Button variant="outline" size="sm">
          <Table2 className="h-4 w-4 mr-2" />
          Pivot Table
        </Button>
        <Button variant="outline" size="sm" onClick={onChartInsert}>
          <ChartBar className="h-4 w-4 mr-2" />
          Chart
        </Button>
        <Button variant="outline" size="sm">
          <ImagePlus className="h-4 w-4 mr-2" />
          Image
        </Button>
      </div>
    </div>
  );
}