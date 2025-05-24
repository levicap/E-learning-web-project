
import { useState, useEffect } from "react"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import Toolbar from "./Toolbar"
import SlideList from "./SlideList"
import SlideEditor from "./SlideEditor"
import PresentationMode from "./PresentationMode"
import "./styles.css";
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const Powerpoint = () => {
  const [slides, setSlides] = useState([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [presentationMode, setPresentationMode] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGrid, setShowGrid] = useState(false)

  // Initialize with a blank slide
  useEffect(() => {
    if (slides.length === 0) {
      const initialSlide = {
        id: generateId(),
        background: "#ffffff",
        elements: [],
        notes: "", // Add notes field
        transition: "fade", // Add transition field
      }
      setSlides([initialSlide])
      updateHistory([initialSlide])
    }
  }, [])

  const updateHistory = (newSlides) => {
    // Remove any future history if we're not at the latest state
    const newHistory = history.slice(0, historyIndex + 1)
    // Add the new state to history
    newHistory.push(JSON.stringify(newSlides))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides(JSON.parse(history[historyIndex - 1]))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides(JSON.parse(history[historyIndex + 1]))
    }
  }

  const addSlide = () => {
    const newSlide = {
      id: generateId(),
      background: "#ffffff",
      elements: [],
      notes: "",
      transition: "fade",
    }
    const newSlides = [...slides, newSlide]
    setSlides(newSlides)
    setCurrentSlideIndex(newSlides.length - 1)
    updateHistory(newSlides)
  }

  const deleteSlide = (index) => {
    if (slides.length <= 1) return // Don't delete the last slide

    const newSlides = [...slides]
    newSlides.splice(index, 1)
    setSlides(newSlides)

    // Adjust current slide index if needed
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    } else if (currentSlideIndex === index) {
      setCurrentSlideIndex(Math.max(0, index - 1))
    }

    updateHistory(newSlides)
  }

  const duplicateSlide = (index) => {
    const slideToClone = slides[index]
    const clonedSlide = {
      ...JSON.parse(JSON.stringify(slideToClone)),
      id: generateId(),
    }

    const newSlides = [...slides]
    newSlides.splice(index + 1, 0, clonedSlide)
    setSlides(newSlides)
    setCurrentSlideIndex(index + 1)
    updateHistory(newSlides)
  }

  const updateSlide = (slideId, updatedData) => {
    const newSlides = slides.map((slide) => (slide.id === slideId ? { ...slide, ...updatedData } : slide))
    setSlides(newSlides)
    updateHistory(newSlides)
  }

  const updateElement = (slideId, elementId, updatedData) => {
    const newSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedElements = slide.elements.map((element) =>
          element.id === elementId ? { ...element, ...updatedData } : element,
        )
        return { ...slide, elements: updatedElements }
      }
      return slide
    })

    setSlides(newSlides)
    updateHistory(newSlides)
  }

  const addElement = (slideId, element) => {
    const newSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          elements: [...slide.elements, { ...element, id: generateId() }],
        }
      }
      return slide
    })

    setSlides(newSlides)
    updateHistory(newSlides)
  }

  const deleteElement = (slideId, elementId) => {
    const newSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedElements = slide.elements.filter((element) => element.id !== elementId)
        return { ...slide, elements: updatedElements }
      }
      return slide
    })

    setSlides(newSlides)
    updateHistory(newSlides)
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const newSlides = Array.from(slides)
    const [reorderedSlide] = newSlides.splice(result.source.index, 1)
    newSlides.splice(result.destination.index, 0, reorderedSlide)

    setSlides(newSlides)

    // Update current slide index to follow the moved slide
    if (currentSlideIndex === result.source.index) {
      setCurrentSlideIndex(result.destination.index)
    } else if (currentSlideIndex > result.source.index && currentSlideIndex <= result.destination.index) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    } else if (currentSlideIndex < result.source.index && currentSlideIndex >= result.destination.index) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }

    updateHistory(newSlides)
  }

  const startPresentation = () => {
    setPresentationMode(true)
  }

  const endPresentation = () => {
    setPresentationMode(false)
  }

  const toggleGrid = () => {
    setShowGrid(!showGrid)
  }

  if (presentationMode) {
    return <PresentationMode slides={slides} initialSlide={currentSlideIndex} onExit={endPresentation} />
  }

  return (
    <div className="flex bg-white flex-col h-screen bg-gray-100 mt-20">
      <Toolbar
        onAddSlide={addSlide}
        onAddText={() => {
          if (slides.length > 0) {
            addElement(slides[currentSlideIndex].id, {
              type: "text",
              content: "Click to edit text",
              x: 100,
              y: 100,
              width: 300,
              height: 50,
              fontSize: 24,
              fontFamily: "Arial",
              color: "#000000",
              bold: false,
              italic: false,
              underline: false,
            })
          }
        }}
        onAddShape={(shapeType) => {
          if (slides.length > 0) {
            addElement(slides[currentSlideIndex].id, {
              type: "shape",
              shapeType,
              x: 100,
              y: 100,
              width: 150,
              height: 150,
              fill: "#4299e1",
              stroke: "#2b6cb0",
              strokeWidth: 2,
            })
          }
        }}
        onAddImage={() => {
          const input = document.createElement("input")
          input.type = "file"
          input.accept = "image/*"
          input.onchange = (e) => {
            const file = e.target.files[0]
            if (file && slides.length > 0) {
              const reader = new FileReader()
              reader.onload = (event) => {
                addElement(slides[currentSlideIndex].id, {
                  type: "image",
                  src: event.target.result,
                  x: 100,
                  y: 100,
                  width: 300,
                  height: 200,
                })
              }
              reader.readAsDataURL(file)
            }
          }
          input.click()
        }}
        onStartPresentation={startPresentation}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        showGrid={showGrid}
        onToggleGrid={toggleGrid}
      />

      <div className="flex bg-white flex-1 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="slides" direction="vertical">
            {(provided) => (
              <div
                className="w-64 bg-gray-200 overflow-y-auto p-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <SlideList
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  onSelectSlide={setCurrentSlideIndex}
                  onDeleteSlide={deleteSlide}
                  onDuplicateSlide={duplicateSlide}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="flex-1 bg-gray-300 overflow-hidden flex items-center justify-center p-4">
            {slides.length > 0 && currentSlideIndex < slides.length && (
              <SlideEditor
                slide={slides[currentSlideIndex]}
                updateSlide={updateSlide}
                updateElement={updateElement}
                deleteElement={deleteElement}
              />
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

export default Powerpoint;
