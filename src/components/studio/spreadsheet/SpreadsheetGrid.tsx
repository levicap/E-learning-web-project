import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SpreadsheetGridProps {
  headers: string[];
  rows: number;
  data: Record<string, any>[];
  onCellChange: (row: number, col: number, value: string) => void;
}

export function SpreadsheetGrid({ headers, rows, data, onCellChange }: SpreadsheetGridProps) {
  const [activeCell, setActiveCell] = useState({ row: -1, col: -1 });
  const [selectedRange, setSelectedRange] = useState<{ start: { row: number; col: number }; end: { row: number; col: number } } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    setActiveCell({ row, col });
    setSelectedRange(null);
  };

  const handleMouseDown = (row: number, col: number) => {
    setSelectedRange({ start: { row, col }, end: { row, col } });
  };

  const handleMouseMove = (row: number, col: number) => {
    if (selectedRange) {
      setSelectedRange({ ...selectedRange, end: { row, col } });
    }
  };

  const isCellSelected = (row: number, col: number) => {
    if (!selectedRange) return false;
    const { start, end } = selectedRange;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        <div className="flex border-b">
          <div className="w-[40px] border-r bg-muted"></div>
          {headers.map((header) => (
            <div key={header} className="w-[150px] border-r bg-muted p-2 text-sm font-medium">
              {header}
            </div>
          ))}
        </div>
        <ScrollArea className="h-[calc(100vh-14rem)]">
          {Array(rows).fill(null).map((_, rowIndex) => (
            <div key={rowIndex} className="flex border-b">
              <div className="w-[40px] border-r bg-muted flex items-center justify-center text-sm">
                {rowIndex + 1}
              </div>
              {headers.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    "w-[150px] border-r p-2 text-sm",
                    activeCell.row === rowIndex && activeCell.col === colIndex && "bg-blue-50 outline outline-2 outline-blue-500",
                    isCellSelected(rowIndex, colIndex) && "bg-blue-50/50"
                  )}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                >
                  <Input
                    className="h-7 w-full"
                    value={data[rowIndex]?.[headers[colIndex]] || ""}
                    onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}