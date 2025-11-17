"use client"

import MainScene from "@/components/MainScene"
import { Stats } from "@react-three/drei"
import { Canvas, CanvasProps } from "@react-three/fiber"

export const SHARED_CANVAS_PROPS: CanvasProps = {
  linear: true,
  shadows: true,
  camera: {
    position: [0, 0, 0]
  }
}

export default function Component() {

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        {...SHARED_CANVAS_PROPS}
        className="relative z-10">
        <MainScene />
        {/* <Stats /> */}
      </Canvas>
    </div>
  )
}
