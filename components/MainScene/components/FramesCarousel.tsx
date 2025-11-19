"use client";

import { CubeCamera } from "@react-three/drei";
import React from "react";
import * as THREE from "three";
import { FrameRefs } from "..";
import { CustomFrame } from "./CustomFrame";

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
    currentIndex: number;
}
export const FramesCarousel: React.FC<FramesCarouselProps> = ({
    images, numFrames, showContent, frameRefs, groupRef, radius, isMobile, shouldFollowCursor, onFrameClick, currentIndex,
}) => (
    <CubeCamera
        frames={showContent ? 1 : Infinity}
        // resolution={showContent ? 32 : isMobile ? 64 : 128}
        resolution={showContent
            ? (isMobile ? 256 : 384) // Higher for scaled-up frame
            : (isMobile ? 64 : 128) // Lower for carousel
        } near={0.1}
        far={1000}
        position={[0, 0, 2]}
    >
        {(texture) => (
            <group ref={groupRef} name="Frames Carousel">
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
                            // envMap={texture}
                            envMap={(!showContent || i === currentIndex) ? texture : null}
                            onClick={() => onFrameClick()}
                            isFollowingCursor={shouldFollowCursor}
                            ref={(el) => {
                                frameRefs.current[i] = el;
                            }}
                            isFloating={!showContent}
                            index={i}
                            isListPage
                            visible={!showContent || i === currentIndex}
                            skipUpdates={showContent && i !== currentIndex} />
                    );
                })}
            </group>
        )}
    </CubeCamera>
);
