import React from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  onMouseDown,
  className,
}) => {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 h-full w-1 bg-transparent cursor-col-resize group",
        "hover:bg-primary/20 active:bg-primary/40 transition-colors",
        "flex items-center justify-center",
        className
      )}
      onClick={onResize}
      onMouseDown={onMouseDown}
    >
      <div className="h-16 w-1 bg-border group-hover:bg-primary/40 group-active:bg-primary rounded-full transition-colors" />
    </div>
  );
};

export default ResizeHandle;