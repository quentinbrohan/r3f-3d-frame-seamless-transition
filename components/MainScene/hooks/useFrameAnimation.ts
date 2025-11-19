import { useCallback, useState } from "react";
import gsap from "gsap";
import { MOTION_CONFIG } from "@/lib/animations";
import { PROJECTS } from "@/app/data";
import type * as THREE from "three";
import { FRAME_PLANE_WIDTH, DEFAULT_FRAME_SCALE } from "../components/CustomFrame";

interface FrameAnimationDeps {
  frameRefs: React.RefObject<Array<THREE.Group | null>>;
  currentIndexRef: React.MutableRefObject<number>;
  viewedIndexRef: React.MutableRefObject<number>;
  viewportWidth: number;
  animateTransition: (
    next: number,
    direction: 1 | -1,
    skipAnimation?: boolean
  ) => void;
  resetListFrameHover: () => void;
  setCurrentProject: (project: any) => void;
}

export function useFrameAnimation({
  frameRefs,
  currentIndexRef,
  viewedIndexRef,
  viewportWidth,
  animateTransition,
  resetListFrameHover,
  setCurrentProject,
}: FrameAnimationDeps) {
  const [showContent, setShowContent] = useState(false);


  const handleStartMovement = useCallback(
    (skipAnimation = false) => {
      const activeFrame = frameRefs.current?.[currentIndexRef.current];
      if (!activeFrame) return;

      viewedIndexRef.current = currentIndexRef.current;
      const targetScale =
        ((viewportWidth / FRAME_PLANE_WIDTH) * DEFAULT_FRAME_SCALE) / 2;

      resetListFrameHover();

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
    [
      frameRefs,
      currentIndexRef,
      viewedIndexRef,
      viewportWidth,
      resetListFrameHover,
      setShowContent,
    ]
  );

  const handleNextFromOverlay = useCallback(() => {
    const nextIndex = (viewedIndexRef.current + 1) % PROJECTS.length;
    animateTransition(nextIndex, 1, true);
    currentIndexRef.current = nextIndex;
    handleStartMovement(true);
    viewedIndexRef.current = nextIndex;
    setCurrentProject(PROJECTS[nextIndex]);
  }, [
    viewedIndexRef,
    currentIndexRef,
    animateTransition,
    handleStartMovement,
    setCurrentProject,
  ]);

  const handleClose = useCallback(() => {
    const activeFrame = frameRefs.current?.[viewedIndexRef.current];
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
    frameRefs.current?.forEach((frame) => {
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
  }, [
    frameRefs,
    viewedIndexRef,
    currentIndexRef,
    animateTransition,
    setShowContent,
  ]);

  return {
    handleClose,
    handleNextFromOverlay,
    handleStartMovement,
    showContent,
    setShowContent,
  };
}
