"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { FloatingMirror } from "@/components/FloatingMirror"
import { CustomFrame } from "./CustomFrame"
import { CustomEnvironment } from "@/app/page"
import { Project, PROJECT_CATEGORY, PROJECTS } from "@/app/data"

interface ProjectContentProps {
  isVisible: boolean
  isClosing: boolean
  onClose: () => void
  currentProject: Project;
}

export function ProjectContent({ isVisible, isClosing, onClose, currentProject }: ProjectContentProps) {
  const [textVisible, setTextVisible] = useState(false)
  const [isMovingThroughNext, setIsMovingThroughNext] = useState(false)
  const [isReturningNext, setIsReturningNext] = useState(false)
  const [showNextContent, setShowNextContent] = useState(false)
  const [isClosingNext, setIsClosingNext] = useState(false)

  const currentProjectIndex = PROJECTS.findIndex(p => p.id === currentProject.id)
  console.log({ currentProject, currentProjectIndex, PROJECTS });

  const nextProjectIndex = currentProjectIndex >= 0 && currentProjectIndex < PROJECTS.length - 1
    ? currentProjectIndex + 1
    : null
  const nextProject = nextProjectIndex ? PROJECTS[nextProjectIndex]
    : PROJECTS[0]
  const nextProjectTitle = nextProject?.name;
  const nextProjectTitleArray = nextProjectTitle
    ? [
      nextProjectTitle.slice(0, Math.ceil(nextProjectTitle.length / 3)),
      nextProjectTitle.slice(
        Math.ceil(nextProjectTitle.length / 3),
        Math.ceil((2 * nextProjectTitle.length) / 3)
      ),
      nextProjectTitle.slice(Math.ceil((2 * nextProjectTitle.length) / 3))
    ]
    : [];

  useEffect(() => {
    // setShowNextContent(Boolean(nextProject))
  }, [nextProject])

  useEffect(() => {
    if (isVisible && !isClosing) {
      // Delay text appearance for seamless transition
      const timer = setTimeout(() => setTextVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      // Immediately hide text when closing
      setTextVisible(false)
    }
  }, [isVisible, isClosing])

  const handleStartNextMovement = () => {
    setIsMovingThroughNext(true)
  }

  const handleNextIntersection = () => {
    setShowNextContent(true)
  }

  const handleNextMovementComplete = () => {
    setIsMovingThroughNext(false)
  }

  const handleCloseNext = () => {
    setIsClosingNext(true)
    setTimeout(() => {
      setShowNextContent(false)
      setIsReturningNext(true)
    }, 100)
  }

  const handleNextReturnComplete = () => {
    setIsReturningNext(false)
    setIsClosingNext(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null


  const tags = [
    "techniques mixtes sur papier",
    "draw",
    "acrylic",
    "watercolor",
    "painting",
    "artwork",
    "pencil",
    "drawing",
    "darkart",
    "horrorart",
    "macabre",
    "face",
    "creature",
    "trippy",
    "art",
  ]

  const AVAILABILITY_OPTIONS = {
    'AVAILABLE': 'Disponible',
    'NOT_AVAILABLE': 'Non disponible',
    'SOLD': 'Vendu'
  } as const
  const AVAILABILITY_TAGS = [
    {
      label: "Print",
      value: AVAILABILITY_OPTIONS[currentProject.isPrintAvailable ? 'AVAILABLE' : 'NOT_AVAILABLE'],
    },
    {
      label: "Original",
      value: AVAILABILITY_OPTIONS[currentProject.isOriginalAvailable ? 'AVAILABLE' : 'NOT_AVAILABLE'],
    },
  ]

  return (
    <div className="fixed inset-0 z-40 bg-black text-white overflow-y-auto overflow-x-hidden w-screen pt-20">
      {/* Return to Index Button */}
      <button
        onClick={onClose}
        className={`fixed top-24 right-8 z-50 text-white/80 hover:text-white text-sm transition-all duration-500 flex items-center space-x-2 ${textVisible && !isClosing ? "opacity-100" : "opacity-0"
          }`}
      >
        <span>← Return to Index</span>
      </button>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${currentProject.images[0]})`,
          filter: "blur(20px) brightness(0.3)",
          transform: "scale(1.2)", // Slightly scale up to hide blur edges
        }}
      />

      {/* Main Content - Grid System */}
      <div className="pb-16">
        {/* Header - Grid with 2 columns margin */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-4 px-8 pt-16">
          <div className="col-span-6 md:col-span-12">
            <div
              className={`grid grid-cols-5 md:grid-cols-10 gap-16 transition-all duration-700 delay-100 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              {/* Left - Title (5 columns) */}
              <div
                className={`col-span-5 md:col-span-5 transition-all duration-700 delay-100 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
              >
                <h1 className="text-6xl lg:text-7xl font-light text-white-400 leading-tight">{currentProject.name}</h1>
              </div>

              {/* Right - Details (5 columns) */}
              <div className="col-span-6 md:col-span-5 space-y-8">
                {/* Description */}
                <div
                  className={`transition-all duration-700 delay-300 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                  <p className="text-sm text-white/70">
                    {currentProject.description}
                  </p>
                </div>
                {/* <div
                  className={`transition-all duration-700 delay-400 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                  <p className="text-sm text-white">
                    Original and print available.
                  </p>
                </div> */}

                {/* Tags */}
                <div
                  className={`transition-all duration-700 delay-500 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {/* {tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20 transition-all duration-500`}
                        style={{
                          transitionDelay: `${600 + index * 40}ms`,
                          opacity: textVisible && !isClosing ? 1 : 0,
                          transform: textVisible && !isClosing ? "translateY(0)" : "translateY(16px)",
                        }}
                      >
                        {tag}
                      </span>
                    ))} */}
                    {AVAILABILITY_TAGS.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20 transition-all duration-500`}
                        style={{
                          transitionDelay: `${600 + index * 40}ms`,
                          // opacity: textVisible && !isClosing ? 1 : 0,
                          opacity: textVisible && !isClosing ?
                            tag.value === 'Disponible' ? 1 : 0.6 : 0,
                          transform: textVisible && !isClosing ? "translateY(0)" : "translateY(16px)",
                        }}
                      >
                        {tag.label}: {tag.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div
                  className={`grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-6 pt-8 border-t border-white/20 transition-all duration-700 delay-700 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                  {[
                    { label: "THEME", value: currentProject.theme },
                    { label: "CATEGORY", value: PROJECT_CATEGORY[currentProject.category] },
                    { label: "SIZE", value: `${currentProject.dimensions.width}x${currentProject.dimensions.height} cm` },
                    { label: "YEAR", value: currentProject.endDate ? new Date(currentProject.endDate).getFullYear() : "" },
                  ].map((meta, idx) => (
                    <div
                      key={meta.label}
                      className="transition-all duration-500"
                      style={{
                        transitionDelay: `${800 + idx * 80}ms`,
                        opacity: textVisible && !isClosing ? 1 : 0,
                        transform: textVisible && !isClosing ? "translateY(0)" : "translateY(16px)",
                      }}
                    >
                      <div className="text-xs text-white-400 mb-2 uppercase tracking-wider">{meta.label}</div>
                      <div className="text-sm text-white">{meta.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Images - Grid with 1 column margin */}
        <div className="grid grid-cols-12 gap-4 px-8 mt-16 mb-32">
          <div className="col-start-2 col-end-12">
            <div
              className={`transition-all duration-700 delay-1100 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              {/* Main artwork image - full width */}
              <div className="mb-8">
                <div className="overflow-hidden">
                  <img src={currentProject.images[0]} alt="Frustration artwork" className="w-full h-full object-cover transition-all duration-700 delay-1200"
                    style={{
                      opacity: textVisible && !isClosing ? 1 : 0,
                      transform: textVisible && !isClosing ? "translateY(0)" : "translateY(16px)",
                      transitionDelay: "1200ms"
                    }}
                  />
                </div>
              </div>

              {/* Additional images - flexible layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentProject.images.slice(1,
                  // debug
                  -1
                ).map((src, idx) => (
                  <div
                    key={src}
                    className="aspect-[3/4] overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`Detail view ${src}`}
                      className="w-full h-full object-cover transition-all duration-700"
                      style={{
                        opacity: textVisible && !isClosing ? 1 : 0,
                        transform: textVisible && !isClosing ? "translateY(0)" : "translateY(16px)",
                        transitionDelay: `${1300 + idx * 100}ms`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Project Section - Fixed interaction issue */}
        <div
          className={`relative h-screen flex items-center justify-center transition-all duration-700 delay-1500 ${textVisible && !isClosing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Large Title Overlay - Non-selectable and non-blocking */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
            {/* <h2 className="text-[12rem] lg:text-[16rem] font-light text-white leading-none mb-8">
              Frus<span className="text-transparent z-100"
                style={{
                  WebkitTextStroke: '1px white'
                }}
              >tra</span>tion
            </h2> */}
            <h2 className="text-[12rem] lg:text-[16rem] font-light text-white leading-none mb-8
            text-nowrap
            ">
              {nextProjectTitleArray[0]}<span className="text-transparent z-100"
                style={{
                  WebkitTextStroke: '1px white'
                }}
              >
                {nextProjectTitleArray[1]}</span>
              {nextProjectTitleArray[2]}
            </h2>
            <div className="text-white text-xl font-light">NEXT PROJECT</div>
          </div>

          {/* Centered Mirror - Higher z-index for interaction */}
          {/* <div className="w-96 h-96 z-20 relative"> */}
          <div className="w-96 h-96 z-0 relative">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
              <ambientLight intensity={0.2} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <pointLight position={[-5, 5, 5]} intensity={0.5} />
              <pointLight position={[5, -5, 5]} intensity={0.3} />

              {/* <Environment preset="night" /> */}
              <Environment preset="city" />
              {/* <CustomEnvironment /> */}

              {/* TODO:
Already in project, so need to simulates zoom in again + display blurred bg of image behind when camera reach behind painting frame
*/}
              <CustomFrame
                onThroughPlane={handleStartNextMovement}
                isMovingThrough={isMovingThroughNext || isReturningNext}
                image={nextProject?.images[0]}
                lookAtCamera
              />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Next Project Content Overlay */}
      {showNextContent && (
        <ProjectContent isVisible={showNextContent} isClosing={isClosingNext} onClose={handleCloseNext}
          currentProject={currentProject}
        />
      )}
    </div>
  )
}
