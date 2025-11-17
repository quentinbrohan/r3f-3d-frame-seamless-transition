import React, { useEffect, useRef, useState } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial, useTexture, CubeCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Project, PROJECTS } from "@/app/data";
import { CustomFrame, FRAME_PLANE_WIDTH, DEFAULT_FRAME_SCALE } from "./webgl/CustomFrame";
import { ProjectContent } from "./ProjectContent";
import './webgl/shaders/transitionMaterial'

const projectsMainImages = PROJECTS.map((p) => p.images[0]);

export const CAROUSEL_RADIUS = 5;
const CAROUSEL_INITIAL_ROTATION_OFFSET = Math.PI;

const MainScene: React.FC = () => {
    const textures = useTexture(projectsMainImages);
    const { size: {
        width: viewportWidth
    } } = useThree();

    useEffect(() => {
        textures.forEach((t) => {
            t.flipY = false;
            t.colorSpace = THREE.SRGBColorSpace;
            t.needsUpdate = true;
        });
    }, [textures]);

    const frameRefs = useRef<Array<THREE.Group | null>>([]);
    const viewedIndexRef = useRef(0);

    useEffect(() => {
        frameRefs.current = frameRefs.current.slice(0, PROJECTS.length);
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentProject, setCurrentProject] = useState(PROJECTS[0]);
    const [showContent, setShowContent] = useState(false);

    const meshRefFront = useRef<THREE.Mesh>(null);
    const meshRefBack = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const numFrames = projectsMainImages.length;

    const transitionRef = useRef(0);
    const targetRotation = useRef(CAROUSEL_INITIAL_ROTATION_OFFSET);
    const currentIndexRef = useRef(0);

    function setTargetRotationForIndex(nextIndex: number, direction = 1, skipAnimation = false) {
        const step = (2 * Math.PI) / numFrames;
        const current = targetRotation.current;

        const desired = (nextIndex * step + CAROUSEL_INITIAL_ROTATION_OFFSET); // Remove the negative

        let delta = desired - current;
        delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

        if (direction > 0 && delta < 0) delta += 2 * Math.PI;
        if (direction < 0 && delta > 0) delta -= 2 * Math.PI;


        if (skipAnimation) {
            // Instant rotation - set both target AND actual rotation
            targetRotation.current = current + delta;
            if (groupRef.current) {
                groupRef.current.rotation.y = current + delta; // Add this line
            }
            return;
        } else {
            gsap.to(targetRotation, {
                current: current + delta,
                duration: 1,
                ease: "power2.inOut",
            });
        }

    }

    const animateTransition = (next: number, direction: 1 | -1, skipAnimation = false) => {
        const current = currentIndexRef.current;

        if (meshRefFront.current && meshRefBack.current) {
            meshRefFront.current.uniforms.texture1.value = textures[current];
            meshRefFront.current.uniforms.texture2.value = textures[next];
            meshRefFront.current.uniforms.transition.value = 0;

            meshRefBack.current.uniforms.texture1.value = textures[current];
            meshRefBack.current.uniforms.texture2.value = textures[next];
            meshRefBack.current.uniforms.transition.value = 0;
        }

        setTargetRotationForIndex(next, direction, skipAnimation);

        if (skipAnimation) {
            // Instant state change - no GSAP animation
            currentIndexRef.current = next;
            transitionRef.current = 0;

            if (meshRefFront.current && meshRefBack.current) {
                meshRefFront.current.uniforms.texture1.value = textures[next];
                meshRefFront.current.uniforms.texture2.value = textures[next];
                meshRefFront.current.uniforms.transition.value = 0;

                meshRefBack.current.uniforms.texture1.value = textures[next];
                meshRefBack.current.uniforms.texture2.value = textures[next];
                meshRefBack.current.uniforms.transition.value = 0;
            }

            setCurrentIndex(next);
            setCurrentProject(PROJECTS[next]);
            return;
        } else {
            // Normal animated transition
            gsap.to(transitionRef, {
                current: 1,
                duration: 0.8,
                ease: "power2.inOut",
                onUpdate: () => {
                    const t = transitionRef.current;
                    if (meshRefFront.current && meshRefBack.current) {
                        meshRefFront.current.uniforms.transition.value = t;
                        meshRefBack.current.uniforms.transition.value = t;
                    }
                },
                onComplete: () => {
                    currentIndexRef.current = next;
                    transitionRef.current = 0;

                    if (meshRefFront.current && meshRefBack.current) {
                        meshRefFront.current.uniforms.texture1.value = textures[next];
                        meshRefFront.current.uniforms.texture2.value = textures[next];
                        meshRefFront.current.uniforms.transition.value = 0;

                        meshRefBack.current.uniforms.texture1.value = textures[next];
                        meshRefBack.current.uniforms.texture2.value = textures[next];
                        meshRefBack.current.uniforms.transition.value = 0;
                    }

                    setCurrentIndex(next);
                    setCurrentProject(PROJECTS[next]);
                },
            });
        }

    };

    const handleNext = () => {
        const next = (currentIndexRef.current + 1) % textures.length;
        animateTransition(next, 1);
    };

    const handlePrev = () => {
        const prev = (currentIndexRef.current - 1 + textures.length) % textures.length;
        animateTransition(prev, -1);
    };

    const handleStartMovement = (skipAnimation = false) => {
        const activeFrame = frameRefs.current[currentIndexRef.current];
        if (!activeFrame) return;

        viewedIndexRef.current = currentIndexRef.current;

        const targetScale = ((viewportWidth / FRAME_PLANE_WIDTH) * DEFAULT_FRAME_SCALE) / 2;

        if (skipAnimation) {
            // Instant state change - no animation
            activeFrame.scale.set(targetScale, targetScale, targetScale);
            setShowContent(true);
            return;
        } else {
            // Normal animated transition
            const tl = gsap.timeline();
            tl.to(activeFrame.scale, {
                x: targetScale,
                y: targetScale,
                z: targetScale,
                duration: 0.8,
                ease: "cubic.inOut",
                onUpdate: () => {
                    if (activeFrame.scale.x > targetScale * 0.7) {
                        setShowContent(true);
                    }
                }
            });
        }

    };

    const handleNextFromOverlay = () => {
        const nextIndex = (viewedIndexRef.current + 1) % PROJECTS.length;

        // Step 1: Rotate main canvas carousel (instant, no animation)
        animateTransition(nextIndex, 1, true);

        // Step 2: Update main canvas to new project state (skip animation)
        currentIndexRef.current = nextIndex;
        handleStartMovement(true); // Skip animation - instant scale up

        // Step 3: Trigger overlay canvas animation
        // (This happens in the separate Canvas in ProjectContent)
        // The overlay canvas frame scales up with animation

        // Step 4: Update state to trigger overlay content refresh
        viewedIndexRef.current = nextIndex;
        setCurrentProject(PROJECTS[nextIndex]);

        // Step 5: Scroll overlay to top
        const overlayContainer = document.querySelector('[data-overlay-container]');
        if (overlayContainer) {
            overlayContainer.scrollTop = 0;
        }
    };

    const handleClose = () => {
        const activeFrame = frameRefs.current[viewedIndexRef.current];
        if (!activeFrame) return;

        // Sync carousel if user navigated while in overlay
        if (viewedIndexRef.current !== currentIndexRef.current) {
            animateTransition(viewedIndexRef.current,
                viewedIndexRef.current > currentIndexRef.current ? 1 : -1);
            currentIndexRef.current = viewedIndexRef.current;
        }

        setShowContent(false);

        const tl = gsap.timeline();

        // Scale down ALL frames to ensure no leftover scaled frames
        frameRefs.current.forEach((frame) => {
            if (frame && frame.scale.x > DEFAULT_FRAME_SCALE) {
                tl.to(frame.scale, {
                    x: DEFAULT_FRAME_SCALE,
                    y: DEFAULT_FRAME_SCALE,
                    z: DEFAULT_FRAME_SCALE,
                    duration: 0.8,
                    ease: "cubic.inOut"
                }, 0); // Start all at same time
            }
        });
    };

    useEffect(() => {
        if (!meshRefFront.current || !meshRefBack.current || textures.length === 0) return;

        const initial = 0; // start from first project
        const next = (initial + 1) % textures.length;

        meshRefFront.current.uniforms.texture1.value = textures[initial];
        meshRefFront.current.uniforms.texture2.value = textures[next];
        meshRefFront.current.uniforms.transition.value = 0;

        meshRefBack.current.uniforms.texture1.value = textures[initial];
        meshRefBack.current.uniforms.texture2.value = textures[next];
        meshRefBack.current.uniforms.transition.value = 0;
    }, [textures]);

    const handleSelectProject = (index: number) => {
        const total = textures.length;
        const current = currentIndexRef.current;
        const diff = index - current;
        const shortest = ((diff + total / 2) % total) - total / 2;

        const direction = shortest > 0 ? 1 : -1; // Remove the inversion

        animateTransition(index, direction);
    };

    useFrame(() => {
        if (!groupRef.current) return;

        // Smoothly ease group rotation toward target
        const rot = groupRef.current.rotation.y;
        groupRef.current.rotation.y += (targetRotation.current - rot) * 0.08;
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === 'Enter') handleStartMovement()
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            <group name="Environments">
                <mesh position={[0, 0, -5]}>
                    <planeGeometry args={[20, 20]} />
                    <transitionMaterial ref={meshRefBack} toneMapped={false} />
                </mesh>

                <mesh position={[0, 0, 5]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <transitionMaterial ref={meshRefFront} toneMapped={false} />
                </mesh>
            </group>


            <CubeCamera frames={Infinity} resolution={512} near={0.1} far={1000} position={[0, 0, 2]}>
                {(texture) => (
                    <group ref={groupRef}>
                        {projectsMainImages.map((img, i) => {
                            const angle = -(i / numFrames) * Math.PI * 2;
                            const x = Math.sin(angle) * CAROUSEL_RADIUS;
                            const z = Math.cos(angle) * CAROUSEL_RADIUS;
                            const rotationY = angle + Math.PI;

                            return (
                                <CustomFrame
                                    key={i}
                                    image={img}
                                    position={[x, 0, z]}
                                    rotation={[0, rotationY, 0]}
                                    envMap={texture}
                                    onClick={() => handleStartMovement()}
                                    isFollowingCursor={!showContent}
                                    ref={(el) => (frameRefs.current[i] = el)}
                                    isFloating={!showContent}
                                    index={i}
                                />
                            );
                        })}
                    </group>
                )}
            </CubeCamera>

            <group name="Lights">
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={2} />
                <pointLight position={[0, 5, -5]} intensity={0.8} />
            </group>

            {currentProject && (
                <Html
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100vh",
                        width: "100vw",
                        zIndex: 10,
                    }}
                >
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <ProjectContent
                            isVisible={showContent}
                            onClose={handleClose}
                            currentProject={currentProject}
                            onNext={handleNextFromOverlay}
                            viewportWidth={viewportWidth}
                        />

                        <div className="grid grid-cols-12 px-8 w-full z-100 pt-32">
                            <ul className="col-start-9 col-end-13 text-white">
                                {PROJECTS.map((project, i) => (
                                    <li
                                        key={project.name}
                                        className="mb-0.5 last:mb-0"
                                    >
                                        <button
                                            className={`text-2xl text-left ${currentIndex === i ? 'opacity-100' : 'opacity-60'} transition hover:opacity-100 leading-none`}
                                            onClick={() => handleSelectProject(i)}
                                        >
                                            {project.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                </Html>
            )}
        </>
    );
};

export default MainScene;
