"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF, useTexture } from "@react-three/drei"
import { Vector2 } from "three"

interface FloatingMirrorProps {
  onThroughPlane: () => void
  isMovingThrough: boolean
}

export function FloatingMirror({ onThroughPlane, isMovingThrough }: FloatingMirrorProps) {
  const groupRef = useRef()
  const planeRef = useRef()
  const { nodes } = useGLTF("/frame.draco.glb")
  const texture = useTexture("/images/frustration.jpg")
  const { viewport } = useThree()
  const mouse = useRef(new Vector2(0, 0))

  if (texture) texture.flipY = false

  const handleDoubleClick = (event: any) => {
    event.stopPropagation()
    onThroughPlane()
  }

  const handleMouseMove = (event: any) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  useFrame((state) => {
    if (groupRef.current && !isMovingThrough) {
      // Enhanced floating animation when not moving through
      const baseY = Math.sin(state.clock.elapsedTime * 0.6) * 0.15
      const baseRotationY = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
      const baseRotationX = Math.cos(state.clock.elapsedTime * 0.5) * 0.03
      const baseRotationZ = Math.sin(state.clock.elapsedTime * 0.3) * 0.02

      // Add subtle mouse-following rotation
      const mouseInfluence = 0.1 // Adjust this value to control how much the frame follows the mouse
      const targetRotationY = baseRotationY + mouse.current.x * mouseInfluence
      const targetRotationX = baseRotationX + mouse.current.y * mouseInfluence

      // Apply smooth interpolation for natural movement
      groupRef.current.position.y = baseY
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05
      groupRef.current.rotation.z = baseRotationZ
    }
  })

  return (
    <group
      ref={groupRef}
      scale={0.04}
      onPointerMove={handleMouseMove}
    >
      {/* Plane with artwork texture */}
      <mesh
        ref={planeRef}
        geometry={nodes.Plane.geometry}
        position={[0, 0, 0.01]}
        onDoubleClick={handleDoubleClick}
      >
        <meshStandardMaterial
          map={texture}
          transparent={false}
        />
      </mesh>

      {/* Metallic frame meshes (excluding the plane) */}
      {Object.entries(nodes).map(([name, node]) => {
        if (name === "Plane" || !node.geometry) return null
        return (
          <mesh key={name} castShadow receiveShadow geometry={node.geometry}>
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
          </mesh>
        )
      })}
    </group>
  )
}

useGLTF.preload("/frame.draco.glb")
