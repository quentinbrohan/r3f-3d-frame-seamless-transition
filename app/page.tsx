"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraControls, Environment, OrbitControls, useTexture } from "@react-three/drei"
import { FloatingMirror } from "@/components/FloatingMirror"
import { ProjectContent } from "@/components/ProjectContent"
import { CameraController } from "@/components/CameraController"
import { CustomFrame } from "@/components/CustomFrame"
import * as THREE from 'three'
import { PROJECTS } from "./data"
import Header from "@/components/Header"
import CarouselFrame from "@/components/CarouselFrame"

interface CustomEnvironmentProps {
  projectsMainImages: string[];
  currentProjectIndex: number;
}

export const CustomEnvironment: React.FC<CustomEnvironmentProps> = ({
  projectsMainImages,
  currentProjectIndex,
}) => {
  const textures = useTexture(projectsMainImages)
  // const texture = useTexture("/images/frustration.jpg")
  const texture = useTexture(projectsMainImages[currentProjectIndex])
  console.log({ textures, texture, projectsMainImages });

  texture.mapping = THREE.EquirectangularReflectionMapping

  if (currentProjectIndex === -1) return;
  const currentTexture = textures[currentProjectIndex];

  // Ensure correct mapping when texture changes
  // useEffect(() => {
  //   if (currentTexture) {
  //     currentTexture.mapping = THREE.EquirectangularReflectionMapping;
  //     currentTexture.colorSpace = THREE.SRGBColorSpace;
  //   }
  // }, [currentTexture]);


  return (
    <Environment
      // preset="city"
      // background
      map={texture}
    // map={currentTexture}
    // background
    // backgroundBlurriness={0.5}
    // backgroundIntensity={0.3}
    />
  )
}

export default function Component() {
  const [isMovingThrough, setIsMovingThrough] = useState(false)
  const [isReturning, setIsReturning] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // const texture = useTexture("/images/frustration.jpg")


  const handleStartMovement = () => {
    setIsMovingThrough(true)
  }

  const handleIntersection = () => {
    // Camera has passed through the plane - show content
    setShowContent(true)
  }

  const handleMovementComplete = () => {
    setIsMovingThrough(false)
  }

  const handleClose = () => {
    // Start closing sequence
    setIsClosing(true)

    // Hide content immediately and start return animation
    setTimeout(() => {
      setShowContent(false)
      setIsReturning(true)
    }, 100)
  }

  const handleReturnComplete = () => {
    // Reset all states when return is complete
    setIsReturning(false)
    setIsClosing(false)
  }

  const [currentProject, setCurrentProject] = useState<typeof PROJECTS[number]>(PROJECTS[0])
  const projectsMainImages = PROJECTS.map((project) => project.images[0])
  const currentProjectIndex = PROJECTS.findIndex((project) => project.id === currentProject.id)

  const [carouselRotation, setCarouselRotation] = useState(0)


  const anglePerItem = (2 * Math.PI) / projectsMainImages.length
  const numFrames = projectsMainImages.length
  const radius = 2.5

  const goToNextProject = () => {
    setCurrentProject((prev) => {
      const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
      const nextIndex = (currentIndex + 1) % PROJECTS.length
      return PROJECTS[nextIndex]
    })
    setCarouselRotation((prev) => prev - anglePerItem)
  }

  const goToPreviousProject = () => {
    setCurrentProject((prev) => {
      const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
      const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length
      return PROJECTS[prevIndex]
    })
    setCarouselRotation((prev) => prev + anglePerItem)
  }


  //
  // const initialRotationOffset = Math.PI // 180°

  // // Start with targetRotation so frame 0 is in front
  // const [targetRotation, setTargetRotation] = useState(-initialRotationOffset)


  // const handlePrev = () => {
  //   setCurrentProject((prev) => {
  //     const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
  //     const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length
  //     return PROJECTS[prevIndex]
  //   })
  //   setTargetRotation(prev => prev - (Math.PI) / numFrames)
  // }

  // const handleNext = () => {
  //   setCurrentProject((prev) => {
  //     const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
  //     const nextIndex = (currentIndex + 1) % PROJECTS.length
  //     return PROJECTS[nextIndex]
  //   })
  //   setTargetRotation(prev => prev + (Math.PI) / numFrames)
  // }

  return (
    <div className="w-full h-screen bg-black relative">
      <Header />

      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // backgroundImage: "url(/images/frustration.jpg)",
          backgroundImage: `url(${currentProject.images[0]})`,
          filter: "blur(20px) brightness(0.3)",
          transform: "scale(1.2)", // Slightly scale up to hide blur edges
        }}
      />

      {/* Previous and Next arrows */}
      <button
        onClick={goToPreviousProject}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
        aria-label="Previous Project"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNextProject}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
        aria-label="Next Project"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-black/60" /> */}
      <div className="absolute inset-0 bg-black/40" />

      <Canvas camera={{ position: [0, 0, 0], fov: 50 }}

        shadows className="relative z-10">
        {/* Camera controller for seamless movement */}
        {/* <CameraController
          isMovingThrough={isMovingThrough}
          isReturning={isReturning}
          onIntersection={handleIntersection}
          onMovementComplete={handleMovementComplete}
          onReturnComplete={handleReturnComplete}
        /> */}
        {/* <CameraControls /> */}

        {/* Lighting setup to match the screenshot */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <pointLight position={[5, -5, 5]} intensity={0.3} />

        {/* Dark environment */}
        {/* <Environment preset="night" /> */}
        {/* <Environment
          preset="city"
        // files='/images/frustration.jpg'
        /> */}
        <CustomEnvironment
          projectsMainImages={
            projectsMainImages
          }
          currentProjectIndex={
            currentProjectIndex
          }
        />

        {/* Floating mirror */}
        {/* <FloatingMirror onThroughPlane={handleStartMovement} isMovingThrough={isMovingThrough || isReturning} /> */}
        {/* <CustomFrame onThroughPlane={handleStartMovement} isMovingThrough={isMovingThrough || isReturning}
          image={currentProject.images[0]}
        /> */}
        {/* <group rotation={[0, carouselRotation, 0]}>
          {projectsMainImages.map((img, i) => {
            const angle = (i / numFrames) * Math.PI * 2
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius

            return (
              <CustomFrame
                onThroughPlane={handleStartMovement}
                isMovingThrough={isMovingThrough || isReturning}
                image={img}
                key={i}
                position={[x, 0, z]}
                rotation={[0, angle + Math.PI, 0]}
              />
            )
          })}
        </group> */}
        <CarouselFrame projectsMainImages={projectsMainImages}
        onNext={goToNextProject}
        // targetRotation={targetRotation} setTargetRotation={setTargetRotation}
        />


        {/* Controls for interaction - disabled during movement */}
        {/* <OrbitControls
            enabled={!isMovingThrough && !showContent && !isReturning}
            enablePan={false}
            // enableZoom={true}
            enableZoom={false}
            enableRotate={true}
            minDistance={3}
            maxDistance={10}
          />
        */}
      </Canvas>

      {/* Project content overlay */}
      {currentProject && <ProjectContent isVisible={showContent} isClosing={isClosing} onClose={handleClose}
        currentProject={currentProject}
      />}
    </div>
  )
}
