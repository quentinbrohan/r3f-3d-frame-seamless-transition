import React, { Dispatch, SetStateAction, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { Project, PROJECTS } from '@/app/data';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { CustomFrame } from './CustomFrame';
import { shaderMaterial, useTexture, CubeCamera, CameraControls, Html } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three'
import { CameraController } from './CameraController';
import { ProjectContent } from './ProjectContent';

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
    // fragment shader (blend two textures and darken)
    `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float transition;
  varying vec2 vUv;

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec4 color1 = texture2D(texture1, uv);
    vec4 color2 = texture2D(texture2, uv);
    vec4 blended = mix(color1, color2, transition);
    // blended.rgb *= 1.0; // darken by 0%
    blended.rgb *= 0.6; // darken by 40% !!! INFLUENCE REFLECTIONS IN FRAME
    gl_FragColor = blended;
  }
  `
)

extend({ TransitionMaterial })

interface MainScene {
}

const projectsMainImages = PROJECTS.map((project) => project.images[0])
const MainScene: React.FC<MainScene> = ({
}) => {

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

    const [currentIndex, setCurrentIndex] = useState(
        0
    );


    const nextIndex = (currentIndex + 1) % projectsMainImages.length;
    // const currentProject = useMemo(() => PROJECTS[currentIndex], [currentIndex])
    const [currentProject, setCurrentProject] = useState(PROJECTS[0])

    // useEffect(() => {
    //     setCurrentProject(PROJECTS[currentIndex])
    // }, [currentIndex])

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

    // zoom in details
    const [isMovingThrough, setIsMovingThrough] = useState(false)
    const [isReturning, setIsReturning] = useState(false)
    const [showContent, setShowContent] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
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

    //   const { camera } = useThree()
    // const startPosition = useRef(new THREE.Vector3(0, 0, 5)) // Initial position
    const startPosition = useRef(new THREE.Vector3(0, 0, 0)) // Initial position
    const throughPosition = useRef(new THREE.Vector3(0, 0, -3)) // Through the plane
    const returnStartPosition = useRef(new THREE.Vector3(0, 0, -3)) // Close but visible frame position
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
            // camera.lookAt(0, 0, 0)
            progress.current = 0
        }
    }, [isReturning, camera])


    const updateCurrentIndex = (index: number) => {
        // alert(index)
        setCurrentIndex((prev) => {
            const newIndex = (prev + 1) % textures.length;
            setCurrentProject(PROJECTS[index])
            return newIndex;
        });
    }



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
            updateCurrentIndex(currentIndexRef.current);
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

        // --- Zoom In ---
        // camera.position.set(0, 0, -2);
        if (isMovingThrough && !isReturning && progress.current < 1) {
            progress.current += delta / 0.7; // Smooth speed
            const easeProgress = 1 - Math.pow(1 - progress.current, 3);

            // Move camera from start to through
            camera.position.lerpVectors(startPosition.current, throughPosition.current, easeProgress);
            // camera.lookAt(0, 0, 0);

            // Get world position of the target frame
            const frameWorldPos = new THREE.Vector3(0, 0, -2.75); // Assuming frame is at Z = -2.5 in world space

            // Intersection check: when camera Z <= frame's Z in world space
            if (!hasIntersected.current && camera.position.z <= frameWorldPos.z) {
                hasIntersected.current = true;
                handleIntersection();
            }

            if (progress.current >= 1) {
                handleMovementComplete();
            }
        }

        // // --- Return / Zoom Out ---
        if (isReturning && progress.current < 1) {
            progress.current += delta / 1.2
            const easeProgress = 1 - Math.pow(1 - progress.current, 3)
            camera.position.lerpVectors(returnStartPosition.current, startPosition.current, easeProgress)
            // camera.lookAt(0, 0, 0)

            if (progress.current >= 1) {
                handleReturnComplete()
            }
        }
    });



    // TODO: reverse order here + in images
    const handleNext = () => {
        // setTargetRotation((prev) => prev + (Math.PI) / numFrames);
        setTargetRotation((prev) => prev - (Math.PI) / numFrames);
        transitionRef.current = 0
        // setTransition(0); // Reset transition to animate forward
    };

    const invalidate = useThree((state) => state.invalidate);

    function setTargetRotationForIndex(nextIndex: number, direction = 1) {
        const step = (2 * Math.PI) / numFrames;
        const current = targetRotation;
        const desired = -(nextIndex * step + initialRotationOffset);

        // Compute angular difference
        let delta = desired - current;
        delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

        // Force rotation direction if desired
        if (direction > 0 && delta < 0) delta += 2 * Math.PI;   // ensure clockwise
        if (direction < 0 && delta > 0) delta -= 2 * Math.PI;   // ensure counterclockwise

        setTargetRotation(current + delta);
    }



    const handleNextFromDom = () => {
        // Compute next index
        const next = (currentIndexRef.current + 1) % textures.length;

        // Reset animation state
        transitionRef.current = 0;
        hasCommittedRef.current = false;
        nextIndexRef.current = next;

        // Update current index AFTER commit
        currentIndexRef.current = next;

        // Compute new target rotation
        // setTargetRotation(-(next * (2 * Math.PI / numFrames) + initialRotationOffset));
        setTargetRotationForIndex(next, -1);
        // setTargetRotation((next * (2 * Math.PI / numFrames) + initialRotationOffset));

        // Force a render for immediate effect
        invalidate();
    };


    const handlePrev = () => {
        // setTargetRotation((prev) => prev - (Math.PI) / numFrames);
        setTargetRotation((prev) => prev + (Math.PI) / numFrames);
        // setTransition(0);
        transitionRef.current = 0
    };

    const handlePrevFromDom = () => {
        // Compute previous index
        const prev = (currentIndexRef.current - 1 + textures.length) % textures.length;
        nextIndexRef.current = prev;

        // Reset animation state
        transitionRef.current = 0;
        hasCommittedRef.current = false;

        // Update target rotation immediately
        setTargetRotationForIndex(prev, 1);

        // Optionally update current index now or after commit
        currentIndexRef.current = prev;

        // Force R3F to render this frame
        invalidate();
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrevFromDom();
            } else if (e.key === 'ArrowRight') {
                handleNextFromDom();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);



    return (
        <>
            {/* <CameraController
                isMovingThrough={isMovingThrough}
                isReturning={isReturning}
                onIntersection={handleIntersection}
                onMovementComplete={handleMovementComplete}
                onReturnComplete={handleReturnComplete}
            /> */}
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


            <CubeCamera
                frames={Infinity}
                resolution={256} near={0.1} far={1000}
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
                                        // onreddit her kClick={handleNext}
                                        onClick={() => {
                                            setIsMovingThrough(true)
                                        }}
                                        envMap={texture}
                                        isMovingThrough={isMovingThrough || isReturning}
                                        onThroughPlane={handleStartMovement}

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
            {currentProject && <Html
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: '100vw',
                    zIndex: 10,
                    // background:'red'
                }}
            // fullscreen
            >
                <>
                    <button
                        onClick={handlePrevFromDom}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        aria-label="Previous Project"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNextFromDom}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        aria-label="Next Project"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <ProjectContent
                        isVisible={showContent} isClosing={isClosing}
                        onClose={() => {
                            setIsClosing(true)
                            setTimeout(() => {
                                setShowContent(false)
                                setIsReturning(true)
                            }, 100)
                        }}
                        currentProject={currentProject}
                    />
                </>
                <div className="grid grid-cols-12 px-8 w-full z-100 pt-32">
                    <div
                        className="col-start-9 col-end-13 text-white"
                    >
                        {PROJECTS.map((project, i) => (

                            <div className="text-2xl cursor-pointer"
                                key={project.name}
                                style={{ opacity: currentIndex === i ? 1 : 0.6 }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                                onMouseLeave={e => (e.currentTarget.style.opacity = currentIndex === i ? "1" : "0.6")}
                            >{project.name}</div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-12 px-8 w-full absolute bottom-0 left-0 z-100 mb-16">
                    <div
                        className={`col-start-3 col-end-6 text-white text-4xl cursor-pointer transition-all duration-700 delay-100 ${!showContent ? 'visible' : 'hidden'}`}
                        onClick={() => {
                            setIsMovingThrough(true)
                        }}
                    >
                        {/* {currentProject.name} */}
                        {/* View Details */}
                    </div>
                </div>

            </Html>
            }
        </>
    );
}

export default MainScene;