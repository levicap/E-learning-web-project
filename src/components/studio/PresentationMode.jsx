"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, X, Clock, Maximize, Minimize, List } from "lucide-react"

const PresentationMode = ({ slides, initialSlide = 0, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlide)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [time, setTime] = useState(new Date())
  const [transitionActive, setTransitionActive] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState("next")
  const containerRef = useRef(null)

  const goToNextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setTransitionDirection("next")
      setTransitionActive(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setTimeout(() => {
          setTransitionActive(false)
        }, 50)
      }, 300)
    }
  }, [currentIndex, slides.length])

  const goToPrevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setTransitionDirection("prev")
      setTransitionActive(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
        setTimeout(() => {
          setTransitionActive(false)
        }, 50)
      }, 300)
    }
  }, [currentIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        goToNextSlide()
      } else if (e.key === "ArrowLeft") {
        goToPrevSlide()
      } else if (e.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [goToNextSlide, goToPrevSlide, onExit])

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout
    const handleMouseMove = () => {
      setIsControlsVisible(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setIsControlsVisible(false)
      }, 3000)
    }

    window.addEventListener("mousemove", handleMouseMove)
    handleMouseMove() // Initial trigger

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const currentSlide = slides[currentIndex]

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div>No slides to present</div>
        <button
          onClick={onExit}
          className="fixed top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
        >
          <X size={24} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* Slide */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className={`w-full h-full max-w-[1920px] max-h-[1080px] relative transition-transform duration-300 ease-in-out ${
            transitionActive
              ? transitionDirection === "next"
                ? "translate-x-[-100%] opacity-0"
                : "translate-x-[100%] opacity-0"
              : "translate-x-0 opacity-100"
          }`}
          style={{ backgroundColor: currentSlide.background }}
        >
          {currentSlide.elements.map((element) => {
            if (element.type === "text") {
              return (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    fontSize: `${element.fontSize}px`,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    fontWeight: element.bold ? "bold" : "normal",
                    fontStyle: element.italic ? "italic" : "normal",
                    textDecoration: element.underline ? "underline" : "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content }}
                />
              )
            } else if (element.type === "shape") {
              if (element.shapeType === "rectangle") {
                return (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              } else if (element.shapeType === "circle") {
                return (
                  <div
                    key={element.id}
                    className="absolute rounded-full"
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
                    }}
                  />
                )
              } else if (element.shapeType === "triangle") {
                return (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                      backgroundColor: element.fill,
                      border: `${element.strokeWidth}px solid ${element.stroke}`,
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
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                />
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Slide thumbnails sidebar */}
      {showThumbnails && (
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-black bg-opacity-80 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Slides</h3>
            <div className="space-y-3">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`p-2 cursor-pointer rounded transition-all ${
                    currentIndex === index ? "ring-2 ring-blue-500 bg-blue-900 bg-opacity-30" : "hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index)
                    setShowThumbnails(false)
                  }}
                >
                  <div
                    className="w-full aspect-[16/9] relative rounded overflow-hidden"
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
                              dangerouslySetInnerHTML={{ __html: element.content }}
                            />
                          )
                        } else if (element.type === "shape") {
                          // Shape rendering code (similar to existing code)
                          return null
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
                  <div className="text-white text-xs mt-1 text-center">Slide {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls - only visible when isControlsVisible is true */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent h-20 opacity-80 pointer-events-none" />

        <div className="absolute top-4 right-4 flex space-x-3 pointer-events-auto">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            title="Show thumbnails"
          >
            <List size={20} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          <button
            onClick={onExit}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            title="Exit presentation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Clock */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center pointer-events-auto">
          <Clock size={16} className="mr-2" />
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        {/* Navigation buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 pointer-events-auto">
          <button
            onClick={goToPrevSlide}
            disabled={currentIndex === 0}
            className={`p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-full font-medium">
            {currentIndex + 1} / {slides.length}
          </div>

          <button
            onClick={goToNextSlide}
            disabled={currentIndex === slides.length - 1}
            className={`p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all ${
              currentIndex === slides.length - 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PresentationMode
