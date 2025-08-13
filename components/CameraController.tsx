"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"

interface CameraControllerProps {
  isMovingThrough: boolean
  isReturning: boolean
  onIntersection: () => void
  onMovementComplete: () => void
  onReturnComplete: () => void
  lookAt?: [number, number, number]
}

export function CameraController({
  isMovingThrough,
  isReturning,
  onIntersection,
  onMovementComplete,
  onReturnComplete,
}: CameraControllerProps) {
  const { camera } = useThree()
  const startPosition = useRef(new Vector3(0, 0, 5)) // Initial position
  const throughPosition = useRef(new Vector3(0, 0, -2)) // Through the plane
  const returnStartPosition = useRef(new Vector3(0, 0, 2)) // Close but visible frame position
  const progress = useRef(0)
  const hasIntersected = useRef(false)

  useEffect(() => {
    if (isMovingThrough) {
      // Store current camera position and reset progress
      progress.current = 0
      hasIntersected.current = false
    }
  }, [isMovingThrough])

  useEffect(() => {
    if (isReturning) {
      // Immediately position camera at a close but visible distance
      camera.position.copy(returnStartPosition.current)
      camera.lookAt(0, 0, 0)
      progress.current = 0
    }
  }, [isReturning, camera])

  useFrame(() => {
    // return
    // if (lookAt) {
    //   camera.lookAt(...lookAt) // Ensure camera always looks at the center
    // }

    // Forward movement through the plane
    if (isMovingThrough && !isReturning && progress.current < 1) {
      progress.current += 0.015 // Smooth movement speed

      // Ease out cubic for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress.current, 3)

      // Interpolate camera position from start to through
      camera.position.lerpVectors(startPosition.current, throughPosition.current, easeProgress)
      camera.lookAt(0, 0, 0)

      // Calculate plane position in world space (accounting for scale and position)
      const planeWorldZ = 0.01 * 0.04 // plane position * group scale

      // Check if camera has passed through the plane
      if (!hasIntersected.current && camera.position.z <= planeWorldZ) {
        hasIntersected.current = true
        onIntersection()
      }

      // Complete forward movement
      if (progress.current >= 1) {
        onMovementComplete()
      }
    }

    // Return movement - smooth zoom out from close position to default
    if (isReturning && progress.current < 1) {
      progress.current += 0.025 // Smooth return speed

      // Ease out cubic for smooth return animation
      const easeProgress = 1 - Math.pow(1 - progress.current, 3)

      // Interpolate camera position from close position to default
      camera.position.lerpVectors(returnStartPosition.current, startPosition.current, easeProgress)
      camera.lookAt(0, 0, 0)

      // Complete return movement
      if (progress.current >= 1) {
        onReturnComplete()
      }
    }
  })

  return null
}
