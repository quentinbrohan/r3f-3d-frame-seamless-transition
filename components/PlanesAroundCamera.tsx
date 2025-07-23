import * as THREE from 'three'
import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, extend, useLoader } from '@react-three/fiber'
import { shaderMaterial, useTexture } from '@react-three/drei'
import { TextureLoader } from 'three'
import { useControls } from 'leva'

// 1. Define your shader material with two textures and a transition factor
const TransitionMaterial = shaderMaterial(
    {
        texture1: null,
        texture2: null,
        transition: 0,
    },
    // vertex shader (basic passthrough)
    `
  varying vec2 vUv;
  void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
  `,
    // fragment shader (blend two textures)
    `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float transition;
  varying vec2 vUv;

  void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec4 color1 = texture2D(texture1, uv);
    vec4 color2 = texture2D(texture2, uv);
    gl_FragColor = mix(color1, color2, transition);
  }
  `
)

extend({ TransitionMaterial })

export function PlanesAroundCamera({ projectsMainImages, currentProjectIndex, nextProjectIndex, transition }) {
    const ref = useRef()
    const ref2 = useRef()


    // const [progress, set] = useControls(() => ({
    //     value: { value: transition, min: 0, max: 1, step: 0.01 }
    // }))

    // useEffect(() => {
    //     set({
    //         value: transition
    //     })
    // }, [transition, set])


    // // Load current and next textures
    const texture1 = useTexture(projectsMainImages[currentProjectIndex])
    const texture2 = useTexture(projectsMainImages[nextProjectIndex])
    // texture1.mapping = THREE.EquirectangularReflectionMapping
    // texture2.mapping = THREE.EquirectangularReflectionMapping
    const textures = useTexture(projectsMainImages)
    // const texture1 = textures[currentProjectIndex]
    // const texture2 = textures[nextProjectIndex]

    // textures.forEach((tex) => {
    //     tex.mapping = THREE.EquirectangularReflectionMapping
    //     tex.flipY = false;
    //     tex.colorSpace = THREE.SRGBColorSpace
    //     // tex.encoding = THREE.LinearEncoding
    //     // tex.needsUpdate = true
    // })

    // useEffect(() => {
    //     if (ref.current) {
    //         ref.current.uniforms.texture1.value = textures[currentProjectIndex]
    //         ref.current.uniforms.texture2.value = textures[nextProjectIndex]
    //     }
    //     if (ref2.current) {
    //         ref2.current.uniforms.texture1.value = textures[currentProjectIndex]
    //         ref2.current.uniforms.texture2.value = textures[nextProjectIndex]
    //     }
    // }, [textures])

    // Update uniforms
    useFrame(() => {
        if (ref.current) {
            ref.current.uniforms.transition.value = transition
        }
        if (ref2.current) {
            ref2.current.uniforms.transition.value = transition
        }
    })

    return (
        <>
        {/* background behind frame */}
            <mesh position={[0, 0, -5]}
            >
                <planeGeometry args={[20, 20]} />
                <transitionMaterial
                    ref={ref2}
                    texture1={texture1}
                    texture2={texture2}
                    transition={transition}
                    toneMapped={false} // optional, if you want raw colors
                />
            </mesh>
            {/* background behind camera */}
            <mesh position={[0, 0, 5]}
                rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[20, 20]} />
                <transitionMaterial
                    ref={ref}
                    texture1={texture1}
                    texture2={texture2}
                    transition={transition}
                    toneMapped={false} // optional, if you want raw colors
                />
            </mesh>
        </>
    )
}
