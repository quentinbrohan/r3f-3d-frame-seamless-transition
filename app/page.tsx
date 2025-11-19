"use client"

import { Loader } from "@/components/dom/Loader"
import MainScene from "@/components/MainScene"
import { Preload } from "@/components/webgl/Preload"
import { useStore } from "@/lib/store"
import { Stats } from "@react-three/drei"
import { Canvas, CanvasProps } from "@react-three/fiber"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export const SHARED_CANVAS_PROPS: CanvasProps = {
  linear: true,
  shadows: true,
  dpr: [1, 2],
  camera: {
    position: [0, 0, 0]
  },
  gl: {
    precision: 'highp',
    powerPreference: 'high-performance',
  },
  style: {
    pointerEvents: 'all'
  }
}

// Separate component that uses useSearchParams
function SceneWithDebug() {
  const params = useSearchParams();
  const showDebug = params.get('debug') === 'true'

  return (
    <Canvas
      {...SHARED_CANVAS_PROPS}
      className="relative z-10"
    >
      <Suspense>
        <MainScene />
        {showDebug && <Stats />}
        <Preload />
      </Suspense>
    </Canvas>
  )
}

export default function Component() {
  const isLoaderLoaded = useStore((state) => state.isLoaderLoaded)

  return (
    <>
      <div className="w-full h-dvh bg-black relative overflow-hidden">
        <Suspense fallback={<div className="w-full h-dvh bg-black" />}>
          <SceneWithDebug />
        </Suspense>
      </div>
      <Loader isLoading={!isLoaderLoaded} />
    </>
  )
}