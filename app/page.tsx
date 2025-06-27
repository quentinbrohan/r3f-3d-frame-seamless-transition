"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, useTexture } from "@react-three/drei"
import { FloatingMirror } from "@/components/FloatingMirror"
import { ProjectContent } from "@/components/ProjectContent"
import { CameraController } from "@/components/CameraController"
import { CustomFrame } from "@/components/CustomFrame"
import * as THREE from 'three'

export const CustomEnvironment = () => {
  const texture = useTexture("/images/frustration.jpg")
  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <Environment
    // preset="city"
    // background
      map={texture}
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

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Fixed Header - Always visible */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center text-white">
        {/* Left side */}
        <div className="text-white text-sm">Abnalem</div>

        {/* Center elements */}
        <div className="flex items-center space-x-8 text-sm text-white/80">
          <span>04:21 PM, CET</span>
          <span>hello@abnalem.com</span>
        </div>

        <div className="flex items-center space-x-1 text-sm text-white/80">
          <span>About,</span>
          <span>Shop</span>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center space-x-6 text-sm text-white/80">
          {/* <span>About</span>
          <span>Shop</span> */}
          <span>Contact</span>
        </div>
      </nav>

      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/frustration.jpg)",
          filter: "blur(20px) brightness(0.3)",
          transform: "scale(1.2)", // Slightly scale up to hide blur edges
        }}
      />

      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-black/60" /> */}
      <div className="absolute inset-0 bg-black/40" />

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows className="relative z-10">
        {/* Camera controller for seamless movement */}
        <CameraController
          isMovingThrough={isMovingThrough}
          isReturning={isReturning}
          onIntersection={handleIntersection}
          onMovementComplete={handleMovementComplete}
          onReturnComplete={handleReturnComplete}
        />

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
        <CustomEnvironment />

        {/* Floating mirror */}
        {/* <FloatingMirror onThroughPlane={handleStartMovement} isMovingThrough={isMovingThrough || isReturning} /> */}
        <CustomFrame onThroughPlane={handleStartMovement} isMovingThrough={isMovingThrough || isReturning} /> />

        {/* Controls for interaction - disabled during movement */}
        <OrbitControls
          enabled={!isMovingThrough && !showContent && !isReturning}
          enablePan={false}
          // enableZoom={true}
          enableZoom={false}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {/* Project content overlay */}
      <ProjectContent isVisible={showContent} isClosing={isClosing} onClose={handleClose} />
    </div>
  )
}
