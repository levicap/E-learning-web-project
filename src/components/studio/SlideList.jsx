"use client"
import { Draggable } from "react-beautiful-dnd"
import { Copy, Trash2 } from "lucide-react"

const SlideList = ({ slides, currentSlideIndex, onSelectSlide, onDeleteSlide, onDuplicateSlide }) => {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-sm px-2 py-1">Slides</h2>
      {slides.map((slide, index) => (
        <Draggable key={slide.id} draggableId={slide.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`relative p-1 rounded cursor-pointer border ${
                currentSlideIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => onSelectSlide(index)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Slide {index + 1}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateSlide(index)
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    title="Duplicate slide"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSlide(index)
                    }}
                    className="p-1 text-gray-500 hover:text-red-500 rounded"
                    title="Delete slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div
                className="w-full aspect-[16/9] bg-white rounded overflow-hidden border border-gray-300"
                style={{ backgroundColor: slide.background }}
              >
                <div className="w-full h-full relative scale-[0.25] origin-top-left">
                  {slide.elements.map((element) => {
                    if (element.type === "text") {
                      return (
                        <div
                          key={element.id}
                          className="absolute"
                          style={{
                            left: element.x * 4,
                            top: element.y * 4,
                            width: element.width * 4,
                            fontSize: element.fontSize * 4,
                            fontFamily: element.fontFamily,
                            color: element.color,
                            fontWeight: element.bold ? "bold" : "normal",
                            fontStyle: element.italic ? "italic" : "normal",
                            textDecoration: element.underline ? "underline" : "none",
                          }}
                        >
                          {element.content}
                        </div>
                      )
                    } else if (element.type === "shape") {
                      if (element.shapeType === "rectangle") {
                        return (
                          <div
                            key={element.id}
                            className="absolute"
                            style={{
                              left: element.x * 4,
                              top: element.y * 4,
                              width: element.width * 4,
                              height: element.height * 4,
                              backgroundColor: element.fill,
                              border: `${element.strokeWidth * 4}px solid ${element.stroke}`,
                            }}
                          />
                        )
                      } else if (element.shapeType === "circle") {
                        return (
                          <div
                            key={element.id}
                            className="absolute rounded-full"
                            style={{
                              left: element.x * 4,
                              top: element.y * 4,
                              width: element.width * 4,
                              height: element.height * 4,
                              backgroundColor: element.fill,
                              border: `${element.strokeWidth * 4}px solid ${element.stroke}`,
                            }}
                          />
                        )
                      } else if (element.shapeType === "triangle") {
                        return (
                          <div
                            key={element.id}
                            className="absolute"
                            style={{
                              left: element.x * 4,
                              top: element.y * 4,
                              width: element.width * 4,
                              height: element.height * 4,
                              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                              backgroundColor: element.fill,
                              border: `${element.strokeWidth * 4}px solid ${element.stroke}`,
                            }}
                          />
                        )
                      }
                    } else if (element.type === "image") {
                      return (
                        <img
                          key={element.id}
                          src={element.src || "/placeholder.svg"}
                          alt="Slide element"
                          className="absolute object-cover"
                          style={{
                            left: element.x * 4,
                            top: element.y * 4,
                            width: element.width * 4,
                            height: element.height * 4,
                          }}
                        />
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            </div>
          )}
        </Draggable>
      ))}
    </div>
  )
}

export default SlideList
