"use client"

import Header from "@/components/Header"
import MainScene from "@/components/MainScene"
import { ProjectContent } from "@/components/ProjectContent"
import { Environment, useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect, useState } from "react"
import * as THREE from 'three'
import { PROJECTS } from "./data"
import { CameraController } from "@/components/CameraController"

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

// function PlanesAroundCamera({
//   projectsMainImages,
//   currentProjectIndex,
// }) {
//   const frontPlaneRef = useRef()
//   const backPlaneRef = useRef()

//   const texture = useTexture(projectsMainImages[currentProjectIndex])
//   console.log({ texture, projectsMainImages });

//   texture.mapping = THREE.EquirectangularReflectionMapping


//   return (
//     <>
//       {/* Front plane: in front of camera, facing camera */}
//       <mesh ref={frontPlaneRef} position={[0, 0, 5]} rotation={[0, 0, 0]}>
//         <planeGeometry args={[2, 2]} />
//         <meshBasicMaterial color="orange" />
//       </mesh>

//       {/* Back plane: behind camera, facing camera */}
//       <mesh ref={backPlaneRef} position={[0, 0, 5]} rotation={[0, Math.PI, 0]}>
//         <planeGeometry args={[10, 10]} />
//         <meshBasicMaterial
//         // color="blue"
//         map={texture}

//         />
//       </mesh>
//     </>
//   )
// }

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

  //   useEffect(() => {
  // alert(currentProject.name)
  //   },[currentProject.name])
  const projectsMainImages = PROJECTS.map((project) => project.images[0])
  // const currentProjectIndex = PROJECTS.findIndex((project) => project.id === currentProject.id)

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

  //
  const [transition, setTransition] = useState(0)
  // const [progress, set] = useControls(() => ({
  //   value: { value: transition, min: 0, max: 1, step: 0.01 }
  // }))

  // useEffect(() => {
  //   set({
  //     value: transition
  //   })
  // }, [transition])

  const [currentProjectIndex, setCurrentProjectIndex] = useState(PROJECTS.findIndex((project) => project.id === currentProject.id))
  const [nextProjectIndex, setNextProjectIndex] = useState((currentProjectIndex + 1) % PROJECTS.length)

  useEffect(() => {
    const current = PROJECTS.find((p, i) => i === currentProjectIndex)
    setCurrentProject(current)
  }, [currentProjectIndex])


  return (
    <div className="w-full h-screen bg-black relative">
      <Header />

      {/* Blurred background image */}
      {/* <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // backgroundImage: "url(/images/frustration.jpg)",
          backgroundImage: `url(${currentProject.images[0]})`,
          filter: "blur(20px) brightness(0.3)",
          transform: "scale(1.2)", // Slightly scale up to hide blur edges
        }}
      /> */}

      {/* Previous and Next arrows */}
      {/* <button
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
      </button> */}

      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-black/60" /> */}
      <div className="absolute inset-0 bg-black/40" />

      {/* <Canvas shadows className="relative z-10">
        <PlanesAroundCamera
          projectsMainImages={projectsMainImages}
          currentProjectIndex={currentProjectIndex}
          // nextProjectIndex={(currentProjectIndex + 1) % projectsMainImages.length}
          // nextProjectIndex={nextProjectIndex}
          nextProjectIndex={(currentProjectIndex -1 + projectsMainImages.length) % projectsMainImages.length}
          transition={progress.value}
          // transition={transition}
        />

        <CubeCamera frames={1} resolution={256} near={0.1} far={1000}
          position={[0, 0, 2]}
        >
          {(texture) => (
            <>
              <CarouselFrame
                projectsMainImages={projectsMainImages}
                // onNext={goToNextProject}
                envMap={texture}
                transition={progress.value}
                // transition={transition}
                setTransition={setTransition}
                // setTransition={set}
                onNext={() => {
                  setTransition(0)
                  set({
                    value: 0
                  })                   // start new transition
                  setCurrentProjectIndex(prev => {
                    const next = (prev + 1) % projectsMainImages.length
                    // setNextProjectIndex((next + 1) % projectsMainImages.length)
                    setNextProjectIndex(next)
                    return next
                  })
                }}
                onPrev={() => {
                  setTransition(0)
                  set({
                    value: 0
                  })
                  setCurrentProjectIndex(prev => {
                    const next = (prev - 1 + projectsMainImages.length) % projectsMainImages.length
                    // setNextProjectIndex((next + 1) % projectsMainImages.length)
                    setNextProjectIndex(next)
                    return next
                  })
                }}


              />
            </>
          )}
        </CubeCamera>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[0, 5, -5]} intensity={0.8} />
      </Canvas> */}

      {/* <div
        className={`absolute bottom-0 left-0 z-[100] text-white mb-16 ml-16 text-4xl cursor-pointer transition-all duration-700 delay-100 ${!showContent ? 'visible' : 'hidden'}`}
        onClick={handleStartMovement}
        key={currentProject.name}
      >
        {currentProject.name}
      </div> */}

      <Canvas shadows className="relative z-10"
      >
        <MainScene
        />
        <CameraController
          isMovingThrough={isMovingThrough}
          isReturning={isReturning}
          onIntersection={handleIntersection}
          onMovementComplete={handleMovementComplete}
          onReturnComplete={handleReturnComplete}
        />
      </Canvas>

      {/* Project content overlay */}
      {/* {currentProject && <ProjectContent isVisible={showContent} isClosing={isClosing} onClose={handleClose}
        currentProject={currentProject}
      />} */}
    </div>
  )
}
