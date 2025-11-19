"use client";

import { PROJECTS } from "@/app/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "../webgl/shaders/transitionMaterial";
import { EnvironmentPlanes } from "./components/EnvironmentPlanes";
import { FramesCarousel } from "./components/FramesCarousel";
import { InterfaceOverlay } from "./components/InterfaceOverlay";
import { LightingRig } from "./components/LightingRig";
import { CAROUSEL_RADIUS, useCarouselState } from "./hooks/useCarouselState";
import { useCarouselTransition } from "./hooks/useCarouselTransition";
import { useFrameAnimation } from "./hooks/useFrameAnimation";
import { useProjectNavigation } from "./hooks/useProjectNavigation";
import { useProjectTextures } from "./hooks/useProjectTextures";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

const projectsMainImages = PROJECTS.map((project) => project.images[0]);

export type FrameRefs = React.RefObject<Array<THREE.Group | null>>;

const MainScene: React.FC = () => {
    const textures = useProjectTextures(projectsMainImages)
    const viewportWidth = useThree((state) => state.size.width)
    const isMobile = useIsMobile()

    const frameRefs = useRef<Array<THREE.Group | null>>([])
    const viewedIndexRef = useRef(0)
    const facingFrameMeshMaterialRef = useRef<THREE.ShaderMaterial>(null)
    const facingCameraMeshMaterialRef = useRef<THREE.ShaderMaterial>(null)

    useEffect(() => {
        frameRefs.current = frameRefs.current.slice(0, PROJECTS.length)
    }, [])

    const {
        groupRef,
        currentIndexRef,
        currentIndex,
        setCurrentIndex,
        currentProject,
        setCurrentProject,
        numFrames,
        step,
    } = useCarouselState(textures)

    const {
        targetRotation,
        animateTransition,
        resetListFrameHover,
        updateTransitionTextures
    } = useCarouselTransition({
        textures,
        meshRefFront: facingFrameMeshMaterialRef,
        meshRefBack: facingCameraMeshMaterialRef,
        groupRef,
        currentIndexRef,
        setCurrentIndex,
        setCurrentProject,
        step
    })

    const { handleNext, handlePrev, handleSelectProject } = useProjectNavigation({
        textures,
        currentIndexRef,
        animateTransition,
        resetListFrameHover,
    })

    const { handleStartMovement,
        handleClose,
        handleNextFromOverlay,
        showContent,
    } = useFrameAnimation({
        frameRefs,
        currentIndexRef,
        viewedIndexRef,
        viewportWidth,
        animateTransition,
        resetListFrameHover,
        setCurrentProject,
    })

    useEffect(() => {
        if (!textures.length) return
        const initial = 0
        const next = (initial + 1) % textures.length
        updateTransitionTextures(initial, next, 0)
    }, [textures.length, updateTransitionTextures])

    useFrame(() => {
        if (!groupRef.current) return
        const rot = groupRef.current.rotation.y
        const delta = targetRotation.current - rot

        if (Math.abs(delta) > 0.001) {
            groupRef.current.rotation.y += delta * 0.08
        }
    })

    useKeyboardNavigation({
        showContent,
        handleNext,
        handlePrev,
        handleStartMovement,
    })

    return (
        <>
            <EnvironmentPlanes facingFrameMeshMaterialRef={facingFrameMeshMaterialRef} facingCameraMeshMaterialRef={facingCameraMeshMaterialRef} isVisible={!showContent} />

            <FramesCarousel
                images={projectsMainImages}
                numFrames={numFrames}
                frameRefs={frameRefs}
                groupRef={groupRef}
                showContent={showContent}
                radius={CAROUSEL_RADIUS}
                isMobile={isMobile}
                shouldFollowCursor={!showContent}
                onFrameClick={handleStartMovement}
                currentIndex={currentIndex}
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
