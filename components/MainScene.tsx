import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/app/data';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { CustomFrame } from './CustomFrame';
import { shaderMaterial, useTexture, CubeCamera, CameraControls } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three'

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
    const projectsMainImages = PROJECTS.map((project) => project.images[0])

    const textures = useTexture(projectsMainImages);

    // Fix flipping and color space after textures load

    useEffect(() => {
        textures.forEach((tex) => {
            tex.flipY = false;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
        });
        // alert(
        //     textures.map((t) => t.source?.data?.src ?? 'unknown').join('/')
        // )
    }, [textures]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const nextIndex = (currentIndex + 1) % projectsMainImages.length;

    // progress
    // const [transition, setTransition] = useState(0)
    // const [progress, set] = useControls(() => ({
    //     value: { value: transition, min: 0, max: 1, step: 0.01 }
    // }))

    // // Sync Leva control with transition state
    // useEffect(() => {
    //     set({
    //         value: transition
    //     })
    // }, [transition, set])



    // planes around camera
    const meshRefFront = useRef();
    const meshRefBack = useRef();
    const groupRef = useRef();


    // carousel frame logic

    const numFrames = projectsMainImages.length
    const radius = 2.5 * 2

    const initialRotationOffset = Math.PI // 180°

    // Start with targetRotation so frame 0 is in front
    const [targetRotation, setTargetRotation] = useState(-initialRotationOffset)

    const transitionRef = useRef(0)
    const currentIndexRef = useRef(0)
    // const nextIndexRef = useRef(1)

    // Center camera at origin
    const { camera } = useThree()
    camera.position.set(0, 0, 0)

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = targetRotation;
        }
    }, []); // run once on mount


    const hasCommittedRef = useRef(false);
    const nextIndexRef = useRef((currentIndexRef.current + 1) % textures.length);

    // TODO: carousel rotation based on transition progress
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const currentY = groupRef.current.rotation.y;
        const deltaRot = targetRotation - currentY;
        groupRef.current.rotation.y += deltaRot * 0.05;

        const isRotating = Math.abs(deltaRot) > 0.001;

        if (isRotating) {
            transitionRef.current = Math.min(transitionRef.current + delta / 0.5, 1);
        } else if (transitionRef.current > 0) {
            transitionRef.current = Math.min(transitionRef.current + delta / 0.5, 1);
        }

        // When transition fully completes, mark as committed
        if (transitionRef.current >= 1 && !hasCommittedRef.current) {
            hasCommittedRef.current = true;
        }

        // When transition resets to 0 (after showing the new texture), update currentIndex
        if (!isRotating && transitionRef.current === 0 && hasCommittedRef.current) {
            currentIndexRef.current = nextIndexRef.current;
            nextIndexRef.current = (currentIndexRef.current + 1) % textures.length;
            hasCommittedRef.current = false;
        }

        if (meshRefFront.current && meshRefBack.current) {
            meshRefFront.current.uniforms.transition.value = transitionRef.current;
            meshRefFront.current.uniforms.texture1.value = textures[currentIndexRef.current];
            meshRefFront.current.uniforms.texture2.value = textures[nextIndexRef.current];

            meshRefBack.current.uniforms.transition.value = transitionRef.current;
            meshRefBack.current.uniforms.texture1.value = textures[currentIndexRef.current];
            meshRefBack.current.uniforms.texture2.value = textures[nextIndexRef.current];
        }
    });


    // TODO: reverse order
    const handleNext = () => {
        // setTargetRotation((prev) => prev + (Math.PI) / numFrames);
        setTargetRotation((prev) => prev - (Math.PI) / numFrames);
        // setTransition(0); // Reset transition to animate forward
        transitionRef.current = 0
    };

    const handlePrev = () => {
        // setTargetRotation((prev) => prev - (Math.PI) / numFrames);
        setTargetRotation((prev) => prev + (Math.PI) / numFrames);
        // setTransition(0);
        transitionRef.current = 0
    };


    return (
        <>
            {/* The thing that should be reflected: a plane around camera */}
            {/* background behind frame */}
            <mesh position={[0, 0, -5]}
            >
                <planeGeometry args={[20, 20]} />
                <transitionMaterial
                    ref={meshRefBack}
                    // transition={transition}
                    toneMapped={false} // optional, if you want raw colors
                />
            </mesh>
            {/* background behind camera */}
            <mesh position={[0, 0, 5]}
                rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[20, 20]} />
                <transitionMaterial
                    ref={meshRefFront}
                    // transition={transition}
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

            <CameraControls />
        </>
    );
}

export default MainScene;