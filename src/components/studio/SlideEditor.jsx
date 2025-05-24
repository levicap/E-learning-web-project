"use client"

import { useState } from "react"
import { Rnd } from "react-rnd"
import ContentEditable from "react-contenteditable"
import { Bold, Italic, Underline, Trash2 } from "lucide-react"

const SlideEditor = ({ slide, updateSlide, updateElement, deleteElement, showGrid }) => {
  const [selectedElement, setSelectedElement] = useState(null)
  const [showTextToolbar, setShowTextToolbar] = useState(false)

  const handleBackgroundChange = (e) => {
    updateSlide(slide.id, { background: e.target.value })
  }

  const handleElementSelect = (elementId) => {
    const element = slide.elements.find((el) => el.id === elementId)
    setSelectedElement(element)

    if (element && element.type === "text") {
      setShowTextToolbar(true)
    } else {
      setShowTextToolbar(false)
    }
  }

  const handleTextChange = (elementId, content) => {
    updateElement(slide.id, elementId, { content })
  }

  const handleTextStyle = (style) => {
    if (!selectedElement) return

    switch (style) {
      case "bold":
        updateElement(slide.id, selectedElement.id, { bold: !selectedElement.bold })
        break
      case "italic":
        updateElement(slide.id, selectedElement.id, { italic: !selectedElement.italic })
        break
      case "underline":
        updateElement(slide.id, selectedElement.id, { underline: !selectedElement.underline })
        break
      default:
        break
    }
  }

  const handleFontSizeChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { fontSize: Number.parseInt(e.target.value) })
  }

  const handleFontFamilyChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { fontFamily: e.target.value })
  }

  const handleColorChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { color: e.target.value })
  }

  const handleShapeFillChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { fill: e.target.value })
  }

  const handleShapeStrokeChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { stroke: e.target.value })
  }

  const handleShapeStrokeWidthChange = (e) => {
    if (!selectedElement) return
    updateElement(slide.id, selectedElement.id, { strokeWidth: Number.parseInt(e.target.value) })
  }

  const handleTransitionChange = (e) => {
    updateSlide(slide.id, { transition: e.target.value })
  }

  return (
    <div className="w-full bg-white h-full flex flex-col">
      {showTextToolbar && selectedElement && (
        <div className="bg-white border-b border-gray-300 p-2 flex items-center space-x-2">
          <select
            value={selectedElement.fontFamily}
            onChange={handleFontFamilyChange}
            className="border rounded px-2 py-1"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>

          <select
            value={selectedElement.fontSize}
            onChange={handleFontSizeChange}
            className="border rounded px-2 py-1 w-16"
          >
            {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleTextStyle("bold")}
            className={`p-1 rounded ${selectedElement.bold ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Bold size={16} />
          </button>

          <button
            onClick={() => handleTextStyle("italic")}
            className={`p-1 rounded ${selectedElement.italic ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Italic size={16} />
          </button>

          <button
            onClick={() => handleTextStyle("underline")}
            className={`p-1 rounded ${selectedElement.underline ? "bg-gray-200" : "hover:bg-gray-100"}`}
          >
            <Underline size={16} />
          </button>

          <div className="flex items-center space-x-1">
            <label className="text-sm">Color:</label>
            <input
              type="color"
              value={selectedElement.color}
              onChange={handleColorChange}
              className="w-6 h-6 border rounded"
            />
          </div>

          <button
            onClick={() => deleteElement(slide.id, selectedElement.id)}
            className="p-1 rounded hover:bg-red-100 text-red-500 ml-auto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {selectedElement && selectedElement.type === "shape" && (
        <div className="bg-white border-b border-gray-300 p-2 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <label className="text-sm">Fill:</label>
            <input
              type="color"
              value={selectedElement.fill}
              onChange={handleShapeFillChange}
              className="w-6 h-6 border rounded"
            />
          </div>

          <div className="flex items-center space-x-1">
            <label className="text-sm">Stroke:</label>
            <input
              type="color"
              value={selectedElement.stroke}
              onChange={handleShapeStrokeChange}
              className="w-6 h-6 border rounded"
            />
          </div>

          <div className="flex items-center space-x-1">
            <label className="text-sm">Width:</label>
            <input
              type="number"
              value={selectedElement.strokeWidth}
              onChange={handleShapeStrokeWidthChange}
              className="w-12 border rounded px-1"
              min="0"
              max="10"
            />
          </div>

          <button
            onClick={() => deleteElement(slide.id, selectedElement.id)}
            className="p-1 rounded hover:bg-red-100 text-red-500 ml-auto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {selectedElement && selectedElement.type === "image" && (
        <div className="bg-white border-b border-gray-300 p-2 flex items-center space-x-2">
          <button
            onClick={() => deleteElement(slide.id, selectedElement.id)}
            className="p-1 rounded hover:bg-red-100 text-red-500 ml-auto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <div className="absolute top-2 right-2 z-10 bg-white rounded shadow p-2 flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm">Background:</label>
            <input
              type="color"
              value={slide.background}
              onChange={handleBackgroundChange}
              className="w-6 h-6 border rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm">Transition:</label>
            <select
              value={slide.transition || "fade"}
              onChange={handleTransitionChange}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
              <option value="flip">Flip</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div
          className="w-[960px] h-[540px] mx-auto my-4 shadow-lg relative"
          style={{ backgroundColor: slide.background }}
        >
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-12 grid-rows-12">
                {Array.from({ length: 12 }).map((_, rowIndex) =>
                  Array.from({ length: 12 }).map((_, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="border border-gray-200 border-opacity-30" />
                  )),
                )}
              </div>
            </div>
          )}

          {slide.elements.map((element) => {
            if (element.type === "text") {
              return (
                <Rnd
                  key={element.id}
                  default={{
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                  onDragStop={(e, d) => {
                    // Snap to grid if grid is enabled
                    const newX = showGrid ? Math.round(d.x / 20) * 20 : d.x
                    const newY = showGrid ? Math.round(d.y / 20) * 20 : d.y
                    updateElement(slide.id, element.id, { x: newX, y: newY })
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    // Snap to grid if grid is enabled
                    const newWidth = showGrid
                      ? Math.round(Number.parseInt(ref.style.width) / 20) * 20
                      : Number.parseInt(ref.style.width)
                    const newHeight = showGrid
                      ? Math.round(Number.parseInt(ref.style.height) / 20) * 20
                      : Number.parseInt(ref.style.height)
                    const newX = showGrid ? Math.round(position.x / 20) * 20 : position.x
                    const newY = showGrid ? Math.round(position.y / 20) * 20 : position.y

                    updateElement(slide.id, element.id, {
                      width: newWidth,
                      height: newHeight,
                      x: newX,
                      y: newY,
                    })
                  }}
                  onClick={() => handleElementSelect(element.id)}
                  className={`${selectedElement && selectedElement.id === element.id ? "ring-2 ring-blue-500" : ""}`}
                  // Add grid snapping
                  dragGrid={showGrid ? [20, 20] : [1, 1]}
                  resizeGrid={showGrid ? [20, 20] : [1, 1]}
                >
                  <ContentEditable
                    html={element.content}
                    onChange={(e) => handleTextChange(element.id, e.target.value)}
                    className="w-full h-full outline-none"
                    style={{
                      fontSize: `${element.fontSize}px`,
                      fontFamily: element.fontFamily,
                      color: element.color,
                      fontWeight: element.bold ? "bold" : "normal",
                      fontStyle: element.italic ? "italic" : "normal",
                      textDecoration: element.underline ? "underline" : "none",
                    }}
                  />
                </Rnd>
              )
            } else if (element.type === "shape") {
              let ShapeComponent = null

              if (element.shapeType === "rectangle") {
                ShapeComponent = (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              } else if (element.shapeType === "circle") {
                ShapeComponent = (
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              } else if (element.shapeType === "triangle") {
                ShapeComponent = (
                  <div
                    className="w-full h-full"
                    style={{
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              } else if (element.shapeType === "arrow") {
                ShapeComponent = (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      color: element.fill,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="100%"
                      height="100%"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )
              } else if (element.shapeType === "star") {
                ShapeComponent = (
                  <div
                    className="w-full h-full"
                    style={{
                      clipPath:
                        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              }

              return (
                <Rnd
                  key={element.id}
                  default={{
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                  onDragStop={(e, d) => {
                    // Snap to grid if grid is enabled
                    const newX = showGrid ? Math.round(d.x / 20) * 20 : d.x
                    const newY = showGrid ? Math.round(d.y / 20) * 20 : d.y
                    updateElement(slide.id, element.id, { x: newX, y: newY })
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    // Snap to grid if grid is enabled
                    const newWidth = showGrid
                      ? Math.round(Number.parseInt(ref.style.width) / 20) * 20
                      : Number.parseInt(ref.style.width)
                    const newHeight = showGrid
                      ? Math.round(Number.parseInt(ref.style.height) / 20) * 20
                      : Number.parseInt(ref.style.height)
                    const newX = showGrid ? Math.round(position.x / 20) * 20 : position.x
                    const newY = showGrid ? Math.round(position.y / 20) * 20 : position.y

                    updateElement(slide.id, element.id, {
                      width: newWidth,
                      height: newHeight,
                      x: newX,
                      y: newY,
                    })
                  }}
                  onClick={() => handleElementSelect(element.id)}
                  className={`${selectedElement && selectedElement.id === element.id ? "ring-2 ring-blue-500" : ""}`}
                  dragGrid={showGrid ? [20, 20] : [1, 1]}
                  resizeGrid={showGrid ? [20, 20] : [1, 1]}
                >
                  {ShapeComponent}
                </Rnd>
              )
            } else if (element.type === "image") {
              return (
                <Rnd
                  key={element.id}
                  default={{
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                  onDragStop={(e, d) => {
                    // Snap to grid if grid is enabled
                    const newX = showGrid ? Math.round(d.x / 20) * 20 : d.x
                    const newY = showGrid ? Math.round(d.y / 20) * 20 : d.y
                    updateElement(slide.id, element.id, { x: newX, y: newY })
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    // Snap to grid if grid is enabled
                    const newWidth = showGrid
                      ? Math.round(Number.parseInt(ref.style.width) / 20) * 20
                      : Number.parseInt(ref.style.width)
                    const newHeight = showGrid
                      ? Math.round(Number.parseInt(ref.style.height) / 20) * 20
                      : Number.parseInt(ref.style.height)
                    const newX = showGrid ? Math.round(position.x / 20) * 20 : position.x
                    const newY = showGrid ? Math.round(position.y / 20) * 20 : position.y

                    updateElement(slide.id, element.id, {
                      width: newWidth,
                      height: newHeight,
                      x: newX,
                      y: newY,
                    })
                  }}
                  onClick={() => handleElementSelect(element.id)}
                  className={`${selectedElement && selectedElement.id === element.id ? "ring-2 ring-blue-500" : ""}`}
                  dragGrid={showGrid ? [20, 20] : [1, 1]}
                  resizeGrid={showGrid ? [20, 20] : [1, 1]}
                >
                  <img
                    src={element.src || "/placeholder.svg"}
                    alt="Slide element"
                    className="w-full h-full object-cover"
                  />
                </Rnd>
              )
            }
            return null
          })}
        </div>
      </div>

      <div className="border-t border-gray-300 p-2 bg-white">
        <div className="text-sm font-medium mb-1">Speaker Notes</div>
        <textarea
          value={slide.notes || ""}
          onChange={(e) => updateSlide(slide.id, { notes: e.target.value })}
          className="w-full h-20 p-2 border rounded resize-none"
          placeholder="Add notes for this slide (only visible to you during editing)"
        />
      </div>
    </div>
  )
}

export default SlideEditor
