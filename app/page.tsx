"use client"

import { Preload } from "@/components/webgl/Preload"
import { Loader, Stats } from "@react-three/drei"
import { Canvas, CanvasProps } from "@react-three/fiber"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const MainScene = dynamic(() => import('@/components/MainScene'), {
  ssr: false,
})

export const SHARED_CANVAS_PROPS: CanvasProps = {
  linear: true,
  shadows: true,
  camera: {
    position: [0, 0, 0]
  },
  gl: {
    precision: 'highp',
    powerPreference: 'high-performance',
    // alpha: false,
  },
  // style: {
  //   position: 'fixed',
  //   inset: 0,
  //   maxWidth: '100vw',
  //   maxHeight: '100vh',
  //   pointerEvents: 'all'
  // }
}

export default function Component() {
  const params = useSearchParams();
  const showDebug = params.get('debug') === 'true'

  return (
    <>
      <div className="w-full h-[100svh] bg-black relative">
        <Canvas
          {...SHARED_CANVAS_PROPS}
          className="relative z-10"
        >
          <Suspense>
            <MainScene />
            {showDebug && < Stats />}
            <Preload />
          </Suspense>
        </Canvas>
      </div>
      <Loader />
    </>

  )
}
