'use client'

import { useStore } from '@/lib/store'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { CubeCamera, WebGLCubeRenderTarget } from 'three'
import { useShallow } from 'zustand/react/shallow'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'

export function Preload() {
    const gl = useThree((state) => state.gl)
    const camera = useThree((state) => state.camera)
    const scene = useThree((state) => state.scene)
    const [isLoaderLoaded, setIsLoaderLoader] = useStore(useShallow((state) => [state.isLoaderLoaded, state.setIsLoaderLoaded]))

    useEffect(() => {
        if (isLoaderLoaded) return


        async function load() {
            console.log('WebGL: Preloading...')
            console.time('WebGL: Preload took:')

            // Preload HDR environment used in nested canvas
            await new Promise((resolve, reject) => {
                new HDRLoader().load(
                    '/webgl/hdri/potsdamer_platz_1k.hdr',
                    resolve,
                    undefined,
                    reject
                )
            })

            const invisible: THREE.Object3D[] = []
            scene.traverse((object: THREE.Object3D) => {
                if (object.visible === false && !object.userData?.debug) {
                    invisible.push(object)
                    object.visible = true
                }
            })
            await gl.compileAsync(scene, camera)
            const cubeRenderTarget = new WebGLCubeRenderTarget(128)
            const cubeCamera = new CubeCamera(0.01, 100000, cubeRenderTarget)
            cubeCamera.update(gl as THREE.WebGLRenderer, scene as THREE.Scene)
            cubeRenderTarget.dispose()

            for (const object of invisible) {
                object.visible = false
            }

            setIsLoaderLoader(true)
            console.timeEnd('WebGL: Preload took:')
        }

        load()
    }, [
        camera,
        gl,
        scene,
        isLoaderLoaded,
        setIsLoaderLoader,
    ])

    return null
}
