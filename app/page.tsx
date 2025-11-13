"use client"

import Header from "@/components/Header"
import MainScene from "@/components/MainScene"
import { Environment, useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
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
  const texture = useTexture(projectsMainImages[currentProjectIndex])

  texture.mapping = THREE.EquirectangularReflectionMapping

  if (currentProjectIndex === -1) return;
  const currentTexture = textures[currentProjectIndex];

  return (
    <Environment
      map={texture}
    />
  )
}


export default function Component() {
  // const [isMovingThrough, setIsMovingThrough] = useState(false)
  // const [isReturning, setIsReturning] = useState(false)
  // const [showContent, setShowContent] = useState(false)
  // const [isClosing, setIsClosing] = useState(false)

  // // const texture = useTexture("/images/frustration.jpg")


  // const handleStartMovement = () => {
  //   setIsMovingThrough(true)
  // }

  // const handleIntersection = () => {
  //   // Camera has passed through the plane - show content
  //   setShowContent(true)
  // }

  // const handleMovementComplete = () => {
  //   setIsMovingThrough(false)
  // }

  // const handleClose = () => {
  //   // Start closing sequence
  //   setIsClosing(true)

  //   // Hide content immediately and start return animation
  //   setTimeout(() => {
  //     setShowContent(false)
  //     setIsReturning(true)
  //   }, 100)
  // }

  // const handleReturnComplete = () => {
  //   // Reset all states when return is complete
  //   setIsReturning(false)
  //   setIsClosing(false)
  // }

  // const [currentProject, setCurrentProject] = useState<typeof PROJECTS[number]>(PROJECTS[0])

  // //   useEffect(() => {
  // // alert(currentProject.name)
  // //   },[currentProject.name])
  // const projectsMainImages = PROJECTS.map((project) => project.images[0])
  // // const currentProjectIndex = PROJECTS.findIndex((project) => project.id === currentProject.id)

  // const [carouselRotation, setCarouselRotation] = useState(0)


  // const anglePerItem = (2 * Math.PI) / projectsMainImages.length
  // const numFrames = projectsMainImages.length
  // const radius = 2.5

  // const goToNextProject = () => {
  //   setCurrentProject((prev) => {
  //     const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
  //     const nextIndex = (currentIndex + 1) % PROJECTS.length
  //     return PROJECTS[nextIndex]
  //   })
  //   setCarouselRotation((prev) => prev - anglePerItem)
  // }

  // const goToPreviousProject = () => {
  //   setCurrentProject((prev) => {
  //     const currentIndex = PROJECTS.findIndex((project) => project.id === prev.id)
  //     const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length
  //     return PROJECTS[prevIndex]
  //   })
  //   setCarouselRotation((prev) => prev + anglePerItem)
  // }

  // const [currentProjectIndex, setCurrentProjectIndex] = useState(PROJECTS.findIndex((project) => project.id === currentProject.id))
  // const [nextProjectIndex, setNextProjectIndex] = useState((currentProjectIndex + 1) % PROJECTS.length)

  // useEffect(() => {
  //   const current = PROJECTS.find((p, i) => i === currentProjectIndex)!
  //   setCurrentProject(current)
  // }, [currentProjectIndex])


  return (
    <div className="w-full h-screen bg-black relative">
      <Header />

      <Canvas shadows className="relative z-10">
        <MainScene />
        {/* <CameraController
          isMovingThrough={isMovingThrough}
          isReturning={isReturning}
          onIntersection={handleIntersection}
          onMovementComplete={handleMovementComplete}
          onReturnComplete={handleReturnComplete}
        /> */}
      </Canvas>
    </div>
  )
}
