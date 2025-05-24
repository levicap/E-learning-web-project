"use client"
import { Square, Circle, Triangle, ImageIcon, Play, Plus, Type, Undo, Redo, Grid, ArrowRight, Star } from "lucide-react"

const Toolbar = ({
  onAddSlide,
  onAddText,
  onAddShape,
  onAddImage,
  onStartPresentation,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
}) => {
  return (
    <div className="bg-white border-b border-gray-300 p-2 flex items-center">
      <div className="flex space-x-2 mr-6">
        <button
          onClick={onAddSlide}
          className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={16} className="mr-1" />
          New Slide
        </button>
      </div>

      <div className="flex space-x-2 mr-6">
        <button onClick={onAddText} className="p-2 rounded hover:bg-gray-200 tooltip" title="Add Text">
          <Type size={18} />
        </button>

        <div className="relative group">
          <button className="p-2 rounded hover:bg-gray-200 tooltip" title="Add Shape">
            <Square size={18} />
          </button>
          <div className="absolute hidden group-hover:flex bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
            <button onClick={() => onAddShape("rectangle")} className="p-2 rounded hover:bg-gray-200" title="Rectangle">
              <Square size={18} />
            </button>
            <button onClick={() => onAddShape("circle")} className="p-2 rounded hover:bg-gray-200" title="Circle">
              <Circle size={18} />
            </button>
            <button onClick={() => onAddShape("triangle")} className="p-2 rounded hover:bg-gray-200" title="Triangle">
              <Triangle size={18} />
            </button>
            <button onClick={() => onAddShape("arrow")} className="p-2 rounded hover:bg-gray-200" title="Arrow">
              <ArrowRight size={18} />
            </button>
            <button onClick={() => onAddShape("star")} className="p-2 rounded hover:bg-gray-200" title="Star">
              <Star size={18} />
            </button>
          </div>
        </div>

        <button onClick={onAddImage} className="p-2 rounded hover:bg-gray-200 tooltip" title="Add Image">
          <ImageIcon size={18} />
        </button>
      </div>

      <div className="flex space-x-2 mr-6">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded ${canUndo ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"}`}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded ${canRedo ? "hover:bg-gray-200" : "opacity-50 cursor-not-allowed"}`}
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded ${showGrid ? "bg-gray-200" : "hover:bg-gray-200"}`}
          title="Toggle Grid"
        >
          <Grid size={18} />
        </button>
      </div>

      <div className="ml-auto">
        <button
          onClick={onStartPresentation}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Play size={16} className="mr-1" />
          Present
        </button>
      </div>
    </div>
  )
}

export default Toolbar
