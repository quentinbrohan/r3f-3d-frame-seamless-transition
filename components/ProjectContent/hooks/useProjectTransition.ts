import { DEFAULT_FRAME_SCALE } from "@/components/MainScene/components/CustomFrame";
import { MOTION_CONFIG, animateFadeUpOut } from "@/lib/animations";
import gsap from "gsap";
import { useCallback, useState } from "react";
import * as THREE from "three";

export function useProjectTransition({
  containerRef,
  frameRef,
  isMobile,
  onNext,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  frameRef: React.RefObject<THREE.Group>;
  isMobile: boolean;
  onNext: () => void;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const triggerTransition = useCallback(() => {
    if (!frameRef.current || !containerRef.current) return;

    const container = gsap.utils.selector(containerRef);
    const nextProjectContainerEl = container("[data-next-project-container]");
    const nextProjectTitleEl = container("[data-next-project-title]");
    const nextProjectNameColorEl = container("[data-next-project-name-color]");
    const nextProjectNameStrokeEl = container(
      "[data-next-project-name-stroke]"
    );

    const tl = gsap.timeline({ id: "project-content" });
    const targetScale = 1;
    const transitionTiming = isMobile ? 0.4 : 0.6;

    tl.add(
      gsap.to(containerRef.current, {
        duration: MOTION_CONFIG.DURATION.CTA,
        scrollTo: { y: nextProjectContainerEl[0], offsetY: 0 },
        ease: MOTION_CONFIG.EASING.OUT,
        onStart: () => setIsTransitioning(true),
      })
    )
      .add(
        animateFadeUpOut(nextProjectTitleEl, { y: MOTION_CONFIG.Y_OFFSET.MD })
      )
      .add(
        animateFadeUpOut(nextProjectNameColorEl, {
          y: MOTION_CONFIG.Y_OFFSET.LG,
        }),
        `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`
      )
      .add(
        animateFadeUpOut(nextProjectNameStrokeEl, {
          y: MOTION_CONFIG.Y_OFFSET.LG,
        }),
        `<+=${MOTION_CONFIG.STAGGER_DELAY.MD}`
      )
      .to(
        frameRef.current.scale,
        {
          x: targetScale,
          y: targetScale,
          z: targetScale,
          duration: MOTION_CONFIG.DURATION.FRAME_SCALE,
          ease: MOTION_CONFIG.EASING.FRAME_SCALE,
        },
        0.2
      )
      .add(() => {
        onNext();
        setIsTransitioning(false);
      }, transitionTiming)
      .add(() => {
        gsap.set(frameRef.current!.scale, {
          x: DEFAULT_FRAME_SCALE,
          y: DEFAULT_FRAME_SCALE,
          z: DEFAULT_FRAME_SCALE,
        });
      });
  }, [containerRef, frameRef, isMobile, onNext]);

  return { isTransitioning, triggerTransition };
}
