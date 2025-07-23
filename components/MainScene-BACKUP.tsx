import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/app/data';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { CustomFrame } from './CustomFrame';
import { shaderMaterial, useTexture, CubeCamera } from '@react-three/drei';
import { useControls } from 'leva';

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

interface MainScene {

}

const MainScene: React.FC<MainScene> = ({ }) => {
    const [currentProject, setCurrentProject] = useState<typeof PROJECTS[number]>(PROJECTS[0])
    const projectsMainImages = PROJECTS.map((project) => project.images[0])

    const currentProjectIndex = PROJECTS.findIndex((p) => p.id === currentProject.id)
    const nextProjectIndex = currentProjectIndex + 1 % PROJECTS.length


    // progress
    const [transition, setTransition] = useState(0)
    const [progress, set] = useControls(() => ({
        value: { value: transition, min: 0, max: 1, step: 0.01 }
    }))

    useEffect(() => {
        set({
            value: transition
        })
    }, [transition])



    // planes around camera
    const meshRef = useRef()
    const meshRef2 = useRef()

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
        if (meshRef.current) {
            meshRef.current.uniforms.transition.value = transition
        }
        if (meshRef2.current) {
            meshRef2.current.uniforms.transition.value = transition
        }
    })


    // carousel frame logic
    const numFrames = projectsMainImages.length
    const radius = 2.5 * 2

    const initialRotationOffset = Math.PI // 180°

    // Start with targetRotation so frame 0 is in front
    const [targetRotation, setTargetRotation] = useState(-initialRotationOffset)
    const groupRef = useRef()

    // const handlePrev = () => {
    //     setTargetRotation(prev => prev - (Math.PI) / numFrames)
    // }

    // const handleNext = () => {
    //     setTargetRotation(prev => prev + (Math.PI) / numFrames)
    //     onNext()
    // }
    const handleNext = () => {
        // TODO:FIXME: wrong going L to R the projects are in the wrong order
        setTargetRotation(prev => prev + (Math.PI) / numFrames)
        // onNext?.()          // call parent callback if needed
        // start transition
        setTransition(0)    // reset transition to 0 → will animate to 1 in useFrame
    }

    const handlePrev = () => {
        setTargetRotation(prev => prev - (Math.PI) / numFrames)
        // onPrev?.()
        setTransition(0)
    }

    // Center camera at origin
    const { camera } = useThree()
    camera.position.set(0, 0, 0)

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = targetRotation;
        }
    }, []); // run once on mount

    useFrame((state, frameDelta) => {
        if (!groupRef.current) return;


        const currentY = groupRef.current.rotation.y;
        const delta = targetRotation - currentY;

        // Smooth rotation
        groupRef.current.rotation.y += delta * 0.05;

        const isRotating = Math.abs(delta) > 0.001;
        const targetZ = isRotating
            ? -0.5 - 0.5 * Math.min(Math.abs(delta) * 20, 1)
            : 0;

        // Only increase transition while rotating
        // FIXME:
        // if (isRotating && Math.abs(frameDelta) > 0.001) {
        if (isRotating && Math.abs(frameDelta) > 0.001) {
            setTransition((prev) => Math.min(prev + frameDelta / 0.5, 1));
        } else {
            // Reset transition when rotation ends
            setTransition(0);
        }


        // Smooth camera zoom interpolation (lerp)
        // camera.position.z += (targetZ - camera.position.z) * 0.1;
    });



    return (
        <>
            {/* The thing that should be reflected: a plane around camera */}
            {/* background behind frame */}
            <mesh position={[0, 0, -5]}
            >
                <planeGeometry args={[20, 20]} />
                <transitionMaterial
                    ref={meshRef2}
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
                    ref={meshRef}
                    texture1={texture1}
                    texture2={texture2}
                    transition={transition}
                    toneMapped={false} // optional, if you want raw colors
                />
            </mesh>


            <CubeCamera frames={Infinity} resolution={256} near={0.1} far={1000}
                position={[0, 0, 2]}
            >
                {(texture) => (
                    <>
                        <group ref={groupRef}>
                            {projectsMainImages.map((img, i) => {
                                const angle = (i / numFrames) * Math.PI * 2
                                const x = Math.sin(angle) * radius
                                const z = Math.cos(angle) * radius
                                const y = 0

                                // Each frame faces inward to camera
                                const rotationY = angle + Math.PI

                                return (
                                    <CustomFrame
                                        key={i}
                                        image={img}
                                        position={[x, y, z]}
                                        rotation={[0, rotationY, 0]}
                                        onClick={handleNext}
                                        envMap={texture}
                                    />
                                )
                            })}
                        </group>

                    </>
                )}
            </CubeCamera>

            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <pointLight position={[0, 5, -5]} intensity={0.8} />

            {/* <CameraControls/> */}
        </>
    );
}

export default MainScene;