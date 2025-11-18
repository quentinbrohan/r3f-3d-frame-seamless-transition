"use client";

import React, { ButtonHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, CubeCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Project, PROJECTS } from "@/app/data";
import { CustomFrame, FRAME_PLANE_WIDTH, DEFAULT_FRAME_SCALE } from "./webgl/CustomFrame";
import { ProjectContent } from "./ProjectContent";
import "./webgl/shaders/transitionMaterial";
import { ShaderTransitionMaterial } from "./webgl/shaders/transitionMaterial";
import { useGSAP } from "@gsap/react";
import { animateFadeUp, MOTION_CONFIG } from "@/lib/animations";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

const projectsMainImages = PROJECTS.map((project) => project.images[0]);

export const CAROUSEL_RADIUS = 5;
const CAROUSEL_INITIAL_ROTATION_OFFSET = Math.PI;
const NAVIGATION_BUTTON_BASE =
    "z-30 bg-black/60 hover:bg-black/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition";
const NAVIGATION_BUTTON_DESKTOP_POSITION = "absolute top-1/2 -translate-y-1/2";

type FrameRefs = React.RefObject<Array<THREE.Group | null>>;

const normalizeAngle = (angle: number) => {
    const twoPi = 2 * Math.PI;
    return ((angle + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
};

const useProjectTextures = (imageUrls: string[]) => {
    const textures = useTexture(imageUrls);

    useEffect(() => {
        textures.forEach((texture) => {
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
        });
    }, [textures]);

    return textures;
};

const MainScene: React.FC = () => {
    const textures = useProjectTextures(projectsMainImages);
    const viewportWidth = useThree((state) => state.size.width);
    const gl = useThree((state) => state.gl);
    const isMobile = useIsMobile();

    const frameRefs = useRef<Array<THREE.Group | null>>([]);
    const viewedIndexRef = useRef(0);
    const meshRefFront = useRef<ShaderTransitionMaterial | null>(null);
    const meshRefBack = useRef<THREE.ShaderMaterial | null>(null);
    const groupRef = useRef<THREE.Group | null>(null);
    const transitionRef = useRef(0);
    const targetRotation = useRef(CAROUSEL_INITIAL_ROTATION_OFFSET);
    const currentIndexRef = useRef(0);
    const swipeStateRef = useRef({
        startX: 0,
        startY: 0,
        isSwiping: false,
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentProject, setCurrentProject] = useState<Project>(PROJECTS[0]);
    const [showContent, setShowContent] = useState(false);

    const numFrames = useMemo(() => projectsMainImages.length, []);
    const step = useMemo(() => (2 * Math.PI) / numFrames, [numFrames]);
    const carouselRadius = useMemo(
        () => CAROUSEL_RADIUS,
        [isMobile]
    );

    useEffect(() => {
        frameRefs.current = frameRefs.current.slice(0, PROJECTS.length);
    }, []);

    const updateTransitionTextures = useCallback(
        (fromIndex: number, toIndex: number, transitionValue = 0) => {
            if (!meshRefFront.current || !meshRefBack.current || !textures.length) return;

            meshRefFront.current.uniforms.texture1.value = textures[fromIndex];
            meshRefFront.current.uniforms.texture2.value = textures[toIndex];
            meshRefFront.current.uniforms.transition.value = transitionValue;

            meshRefBack.current.uniforms.texture1.value = textures[fromIndex];
            meshRefBack.current.uniforms.texture2.value = textures[toIndex];
            meshRefBack.current.uniforms.transition.value = transitionValue;
        },
        [textures]
    );

    const setTransitionValue = useCallback((value: number) => {
        if (!meshRefFront.current || !meshRefBack.current) return;
        meshRefFront.current.uniforms.transition.value = value;
        meshRefBack.current.uniforms.transition.value = value;
    }, []);

    const setTargetRotationForIndex = useCallback(
        (nextIndex: number, direction: 1 | -1, skipAnimation = false) => {
            const current = targetRotation.current;
            const desired = nextIndex * step + CAROUSEL_INITIAL_ROTATION_OFFSET;
            let delta = normalizeAngle(desired - current);

            if (direction > 0 && delta < 0) delta += 2 * Math.PI;
            if (direction < 0 && delta > 0) delta -= 2 * Math.PI;

            if (skipAnimation) {
                targetRotation.current = current + delta;
                if (groupRef.current) {
                    groupRef.current.rotation.y = current + delta;
                }
                return;
            }

            gsap.to(targetRotation, {
                current: current + delta,
                duration: MOTION_CONFIG.DURATION.CAROUSEL,
                ease: MOTION_CONFIG.EASING.CAROUSEL,
            });
        },
        [step]
    );

    const animateTransition = useCallback(
        (next: number, direction: 1 | -1, skipAnimation = false) => {
            if (!textures.length) return;

            const current = currentIndexRef.current;
            updateTransitionTextures(current, next, 0);
            setTargetRotationForIndex(next, direction, skipAnimation);

            if (skipAnimation) {
                currentIndexRef.current = next;
                transitionRef.current = 0;
                updateTransitionTextures(next, next, 0);
                setCurrentIndex(next);
                setCurrentProject(PROJECTS[next]);
                return;
            }

            gsap.to(transitionRef, {
                current: 1,
                duration: MOTION_CONFIG.DURATION.CAROUSEL,
                ease: MOTION_CONFIG.EASING.CAROUSEL,
                onUpdate: () => {
                    setTransitionValue(transitionRef.current);
                },
                onComplete: () => {
                    currentIndexRef.current = next;
                    transitionRef.current = 0;
                    updateTransitionTextures(next, next, 0);
                    setCurrentIndex(next);
                    setCurrentProject(PROJECTS[next]);
                },
            });
        },
        [setTargetRotationForIndex, setTransitionValue, textures.length, updateTransitionTextures]
    );

    const setIsListFrameHovered = useStore((state) => state.setIsListFrameHovered)
    const resetListFrameHover = () => setIsListFrameHovered(false)

    const handleNext = useCallback(() => {
        if (!textures.length) return;
        const next = (currentIndexRef.current + 1) % textures.length;
        const resetListFrameHover = () => setIsListFrameHovered(false)
        resetListFrameHover()
        animateTransition(next, 1);
    }, [animateTransition, textures.length]);

    const handlePrev = useCallback(() => {
        if (!textures.length) return;
        const prev = (currentIndexRef.current - 1 + textures.length) % textures.length;
        resetListFrameHover()
        animateTransition(prev, -1);
    }, [animateTransition, textures.length]);

    const handleStartMovement = useCallback(
        (skipAnimation = false) => {
            const activeFrame = frameRefs.current[currentIndexRef.current];
            if (!activeFrame) return;

            viewedIndexRef.current = currentIndexRef.current;
            const targetScale = ((viewportWidth / FRAME_PLANE_WIDTH) * DEFAULT_FRAME_SCALE) / 2;

            resetListFrameHover()


            if (skipAnimation) {
                activeFrame.scale.set(targetScale, targetScale, targetScale);
                setShowContent(true);
                return;
            }

            const tl = gsap.timeline();
            tl.to(activeFrame.scale, {
                x: targetScale,
                y: targetScale,
                z: targetScale,
                duration: MOTION_CONFIG.DURATION.FRAME_SCALE,
                ease: MOTION_CONFIG.EASING.FRAME_SCALE,
                onUpdate: () => {
                    if (activeFrame.scale.x > targetScale * 0.7) {
                        setShowContent(true);
                    }
                },
            });
        },
        [viewportWidth]
    );

    const handleNextFromOverlay = useCallback(() => {
        const nextIndex = (viewedIndexRef.current + 1) % PROJECTS.length;
        animateTransition(nextIndex, 1, true);
        currentIndexRef.current = nextIndex;
        handleStartMovement(true);
        viewedIndexRef.current = nextIndex;
        setCurrentProject(PROJECTS[nextIndex]);
    }, [animateTransition, handleStartMovement]);

    const handleClose = useCallback(() => {
        const activeFrame = frameRefs.current[viewedIndexRef.current];
        if (!activeFrame) return;

        if (viewedIndexRef.current !== currentIndexRef.current) {
            animateTransition(
                viewedIndexRef.current,
                viewedIndexRef.current > currentIndexRef.current ? 1 : -1
            );
            currentIndexRef.current = viewedIndexRef.current;
        }

        setShowContent(false);

        const tl = gsap.timeline();
        frameRefs.current.forEach((frame) => {
            if (frame && frame.scale.x > DEFAULT_FRAME_SCALE) {
                tl.to(
                    frame.scale,
                    {
                        x: DEFAULT_FRAME_SCALE,
                        y: DEFAULT_FRAME_SCALE,
                        z: DEFAULT_FRAME_SCALE,
                        duration: MOTION_CONFIG.DURATION.FRAME_SCALE,
                        ease: MOTION_CONFIG.EASING.FRAME_SCALE,
                    },
                    0
                );
            }
        });
    }, [animateTransition]);

    const handleSelectProject = useCallback(
        (index: number) => {
            if (!textures.length) return;
            const total = textures.length;
            const current = currentIndexRef.current;
            const diff = index - current;
            const shortest = ((diff + total / 2) % total) - total / 2;
            const direction = shortest > 0 ? 1 : -1;

            animateTransition(index, direction);
        },
        [animateTransition, textures.length]
    );

    useEffect(() => {
        if (!textures.length) return;
        const initial = 0;
        const next = (initial + 1) % textures.length;
        updateTransitionTextures(initial, next, 0);
    }, [textures.length, updateTransitionTextures]);

    useEffect(() => {
        if (!isMobile || showContent) return;
        const element = gl?.domElement;
        if (!element) return;

        const swipeState = swipeStateRef.current;

        const handleTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) return;
            swipeState.startX = event.touches[0].clientX;
            swipeState.startY = event.touches[0].clientY;
            swipeState.isSwiping = true;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!swipeState.isSwiping || event.touches.length !== 1) return;
            const deltaX = event.touches[0].clientX - swipeState.startX;
            const deltaY = event.touches[0].clientY - swipeState.startY;

            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                swipeState.isSwiping = false;
                return;
            }

            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    handlePrev();
                } else {
                    handleNext();
                }
                swipeState.isSwiping = false;
            }
        };

        const handleTouchEnd = () => {
            swipeState.isSwiping = false;
        };

        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchmove", handleTouchMove);
        element.addEventListener("touchend", handleTouchEnd);

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchmove", handleTouchMove);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [gl, handleNext, handlePrev, isMobile, showContent]);

    useFrame(() => {
        if (!groupRef.current) return;
        const rot = groupRef.current.rotation.y;
        groupRef.current.rotation.y += (targetRotation.current - rot) * 0.08;
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (showContent) return;
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Enter") handleStartMovement();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleNext, handlePrev, handleStartMovement, showContent]);

    return (
        <>
            <EnvironmentPlanes frontRef={meshRefFront} backRef={meshRefBack} />

            <FramesCarousel
                images={projectsMainImages}
                numFrames={numFrames}
                frameRefs={frameRefs}
                groupRef={groupRef}
                showContent={showContent}
                radius={carouselRadius}
                isMobile={isMobile}
                shouldFollowCursor={!showContent}
                onFrameClick={handleStartMovement}
            />

            <LightingRig />

            <InterfaceOverlay
                currentIndex={currentIndex}
                currentProject={currentProject}
                onClose={handleClose}
                onNext={handleNext}
                onPrev={handlePrev}
                onSelectProject={handleSelectProject}
                onNextFromOverlay={handleNextFromOverlay}
                onProjectClick={handleStartMovement}
                showContent={showContent}
                isMobile={isMobile}
            />
        </>
    );
};

export default MainScene;

interface EnvironmentPlanesProps {
    frontRef: React.RefObject<THREE.ShaderMaterial | null>;
    backRef: React.RefObject<THREE.ShaderMaterial | null>;
}

const EnvironmentPlanes: React.FC<EnvironmentPlanesProps> = ({ frontRef, backRef }) => (
    <group name="Environments">
        <mesh position={[0, 0, -5]}>
            <planeGeometry args={[20, 20]} />
            <transitionMaterial ref={backRef} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 5]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[20, 20]} />
            <transitionMaterial ref={frontRef} toneMapped={false} />
        </mesh>
    </group>
);

interface FramesCarouselProps {
    images: string[];
    numFrames: number;
    showContent: boolean;
    frameRefs: FrameRefs;
    groupRef: React.RefObject<THREE.Group>;
    radius: number;
    isMobile: boolean;
    shouldFollowCursor: boolean;
    onFrameClick: () => void;
}

const FramesCarousel: React.FC<FramesCarouselProps> = ({
    images,
    numFrames,
    showContent,
    frameRefs,
    groupRef,
    radius,
    isMobile,
    shouldFollowCursor,
    onFrameClick,
}) => (
    <CubeCamera
        frames={Infinity}
        resolution={isMobile ? 256 : 512}
        near={0.1}
        far={1000}
        position={[0, 0, 2]}
    >
        {(texture) => (
            <group ref={groupRef}>
                {images.map((img, i) => {
                    const angle = -(i / numFrames) * Math.PI * 2;
                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;
                    const rotationY = angle + Math.PI;

                    return (
                        <CustomFrame
                            key={i}
                            image={img}
                            position={[x, 0, z]}
                            rotation={[0, rotationY, 0]}
                            envMap={texture}
                            onClick={() => onFrameClick()}
                            isFollowingCursor={shouldFollowCursor}
                            ref={(el) => {
                                frameRefs.current[i] = el;
                            }}
                            isFloating={!showContent}
                            index={i}
                        />
                    );
                })}
            </group>
        )}
    </CubeCamera>
);

const LightingRig = () => (
    <group name="Lights">
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[0, 5, -5]} intensity={0.8} />
    </group>
);

interface InterfaceOverlayProps {
    currentIndex: number;
    currentProject: Project | null;
    showContent: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSelectProject: (index: number) => void;
    onClose: () => void;
    onNextFromOverlay: () => void;
    onProjectClick: () => void;
    isMobile: boolean;
}

// TODO: move to dom
const InterfaceOverlay: React.FC<InterfaceOverlayProps> = ({
    currentIndex,
    currentProject,
    showContent,
    onPrev,
    onNext,
    onSelectProject,
    onClose,
    onNextFromOverlay,
    onProjectClick,
    isMobile,
}) => {
    if (!currentProject) return null;

    return (
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
                {
                    // isMobile ? (
                    //     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4">
                    //         <NavigationButton
                    //             direction="prev"
                    //             onClick={onPrev}
                    //             isInline
                    //             className="backdrop-blur-md border border-white/20 bg-white/10"
                    //         />
                    //         <NavigationButton
                    //             direction="next"
                    //             onClick={onNext}
                    //             isInline
                    //             className="backdrop-blur-md border border-white/20 bg-white/10"
                    //         />
                    //     </div>
                    // ) :
                    !isMobile && (
                        <>
                            <NavigationButton direction="prev" onClick={onPrev} />
                            <NavigationButton direction="next" onClick={onNext} />
                        </>
                    )}

                <ProjectContent
                    isVisible={showContent}
                    onClose={onClose}
                    currentProject={currentProject}
                    onNext={onNextFromOverlay}
                />

                <ProjectList
                    currentIndex={currentIndex}
                    onSelectProject={onSelectProject}
                    isMobile={isMobile}
                    onPrev={onPrev}
                    onNext={onNext}
                    onOpenProject={onProjectClick}
                />
            </>
        </Html>
    );
};

const NavigationButton = ({
    direction,
    onClick,
    isInline = false,
    className,
}: {
    direction: "prev" | "next";
    onClick: () => void;
    isInline?: boolean;
    className?: string;
}) => (
    <button
        onClick={onClick}
        className={cn(
            NAVIGATION_BUTTON_BASE,
            !isInline && NAVIGATION_BUTTON_DESKTOP_POSITION,
            !isInline && (direction === "prev" ? "left-4" : "right-4"),
            isInline && "relative",
            className
        )}
        aria-label={direction === "prev" ? "Previous project" : "Next project"}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
        </svg>
    </button>
);


const ViewProjectButton: React.FC<Partial<ButtonHTMLAttributes<any>>> = ({ className, ...props }) => {
    return (
        <button {...props} data-view-project-cta className={cn("p-4 px-4 w-full border border-white/20 bg-black/60 overflow-hidden", className)}>
            <span data-view-project-cta-text className={cn("flex justify-between uppercase text-xs gap-2 w-full")} >
                VIEW PROJECT
                <span aria-hidden="true">→</span>
            </span>
        </button>
    )
}

const ProjectList = ({
    currentIndex,
    onSelectProject,
    onNext,
    onPrev,
    onOpenProject,
    isMobile,
}: {
    currentIndex: number;
    onSelectProject: (index: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onOpenProject: () => void;
    isMobile: boolean;
}) => {
    const containerDesktopRef = useRef<HTMLDivElement>(null)
    const projectContainerMobileRef = useRef<HTMLDivElement>(null)

    const [isLoaderLoaded, isListFrameHovered] = useStore(useShallow((state) => [state.isLoaderLoaded, state.isListFrameHovered]))
    const tlRef = useRef<gsap.core.Timeline | null>(null)

    useGSAP(() => {
        if (isMobile && !projectContainerMobileRef.current) return;
        if (!isMobile && !containerDesktopRef.current) return;

        let itemEls: HTMLElement[] = [];
        let currentProjectNameEl: HTMLElement[] = [];
        let viewProjectEl: HTMLElement[] = [];

        if (isMobile) {
            const containerMobile = gsap.utils.selector(projectContainerMobileRef)

            currentProjectNameEl = containerMobile('[data-current-project-name]')
            viewProjectEl = containerMobile('[data-view-project-cta]')
            itemEls = containerMobile('li')
        } else {
            const container = gsap.utils.selector(containerDesktopRef)
            itemEls = container('li')
            currentProjectNameEl = container('[data-current-project-name]')
            viewProjectEl = container('[data-view-project-cta]')
        }

        if (itemEls.length === 0) return;


        const tl = gsap.timeline({ id: 'project-list', paused: true });

        if (isMobile) {
            tl.add(animateFadeUp(currentProjectNameEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }), `<+=${MOTION_CONFIG.STAGGER_DELAY.LG}`)
            tl.add(animateFadeUp(viewProjectEl, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
            }), `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`)
        }
        tl.add(
            animateFadeUp(itemEls, {
                y: MOTION_CONFIG.Y_OFFSET.MD,
                stagger: MOTION_CONFIG.STAGGER.MD,
            }), `<+=${MOTION_CONFIG.STAGGER_DELAY.LG}`
        )

        tlRef.current = tl;
    }, {
        dependencies: [isLoaderLoaded, isMobile]
    })

    useEffect(() => {
        if (isLoaderLoaded && tlRef.current)
            tlRef.current.play()
    }, [isLoaderLoaded, isMobile])

    useGSAP(() => {
        if (!isMobile || !projectContainerMobileRef.current) return;

        const container = gsap.utils.selector(projectContainerMobileRef);
        const currentProjectNameEl = container('[data-current-project-name]');
        const viewProjectEl = container('[data-view-project-cta-text]');

        if (!currentProjectNameEl.length || !viewProjectEl.length) return;

        const tl = gsap.timeline();

        tl.add(animateFadeUp(currentProjectNameEl, {
            y: MOTION_CONFIG.Y_OFFSET.MD,
            duration: MOTION_CONFIG.DURATION.CTA,
        }))
        tl.add(animateFadeUp(viewProjectEl, {
            y: MOTION_CONFIG.Y_OFFSET.MD,
            duration: MOTION_CONFIG.DURATION.CTA,
        }),
            `<${MOTION_CONFIG.STAGGER_DELAY.MD}`
        );

    }, [currentIndex, isMobile]);

    const currentProject = PROJECTS[currentIndex]


    const viewProjectCtaRef = useRef<HTMLButtonElement>(null)
    const tl = useRef<gsap.core.Timeline | null>(null)

    useGSAP(() => {
        tl.current = gsap.timeline({ paused: true })
            .fromTo(
                viewProjectCtaRef.current,
                { opacity: 0, y: MOTION_CONFIG.Y_OFFSET.MD },
                { opacity: 1, y: 0, duration: MOTION_CONFIG.DURATION.CTA }
            )
    }, [isMobile])

    useEffect(() => {
        if (!tl.current) return

        if (isListFrameHovered) {
            tl.current.play()
        } else {
            tl.current.reverse()
        }
    }, [isListFrameHovered])


    return (
        <>
            <>
                {isMobile && <div
                    ref={projectContainerMobileRef}
                    className={cn(
                        "fixed w-full px-4 mb-2 bottom-6 text-left text-2xl leading-none",
                        "text-white",
                    )}
                    aria-label={`Open ${currentProject.name} project`}
                >
                    <p className="mb-4 text-left text-2xl leading-none" data-current-project-name>
                        {currentProject.name}
                    </p>
                    <ViewProjectButton onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject()
                    }}
                        className="mb-4"
                    />
                    <nav
                        className={cn("w-full")}
                        aria-label="Project list">
                        <ul className="flex gap-3 items-center text-white" role="list">
                            {/* <li className="flex-2">
                            <NavigationButton
                                direction="prev"
                                onClick={onPrev}
                                isInline
                                className="backdrop-blur-md border border-white/20 bg-white/10"
                            />
                        </li> */}
                            {PROJECTS.map((project, i) => (
                                <li key={project.name} className="flex-1">
                                    <button
                                        className={cn(
                                            "w-full min-h-10 flex items-center",
                                        )}
                                        onClick={() => onSelectProject(i)}
                                        aria-label={`View ${project.name} project`}
                                        aria-current={currentIndex === i ? "page" : undefined}
                                    >
                                        <span className={cn(
                                            "w-full h-4 rounded-sm border transition",
                                            currentIndex === i
                                                ? "bg-black/100 border-white/60"
                                                : "bg-black/25 border-white/20"
                                        )}></span>
                                    </button>
                                </li>
                            ))}
                            {/* <li className="flex-2">
                            <NavigationButton
                                direction="next"
                                onClick={onNext}
                                isInline
                                className="backdrop-blur-md border border-white/20 bg-white/10"
                            />
                        </li> */}
                        </ul>
                    </nav>
                </div>}
            </>

            {!isMobile && <nav ref={containerDesktopRef} className={cn("grid grid-cols-12 px-8 w-full z-100 pt-32",
            )}
                aria-label="Project list">
                <ul className="col-start-9 col-end-13 text-white" role="list">
                    {PROJECTS.map((project, i) => (
                        <li key={project.name} className="mb-0.5 last:mb-0">
                            <button
                                className={`text-2xl text-left ${currentIndex === i ? "opacity-100" : "opacity-60"
                                    } transition hover:opacity-100 leading-none`}
                                onClick={() => onSelectProject(i)}
                                aria-label={`View ${project.name} project`}
                                aria-current={currentIndex === i ? "page" : undefined}
                            >
                                {project.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>}
            {!isMobile && <ViewProjectButton
                ref={viewProjectCtaRef}
                className={cn("opacity-0 z-100 absolute bottom-20 left-1/2 -translate-x-[50%] w-fit text-2xl text-white",
                )}
            />}
        </>
    )
};
