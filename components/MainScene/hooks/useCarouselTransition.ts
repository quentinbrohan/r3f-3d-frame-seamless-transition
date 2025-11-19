import { useCallback, useRef } from "react";
import { useStore } from "@/lib/store";
import gsap from "gsap";
import { MOTION_CONFIG } from "@/lib/animations";
import { PROJECTS } from "@/app/data";
import * as THREE from "three";

const CAROUSEL_INITIAL_ROTATION_OFFSET = Math.PI;

const normalizeAngle = (angle: number) => {
  const twoPi = 2 * Math.PI;
  return ((((angle + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
};

interface TransitionDeps {
  textures: THREE.Texture[];
  meshRefFront: React.RefObject<any>;
  meshRefBack: React.RefObject<any>;
  groupRef: React.RefObject<THREE.Group>;
  currentIndexRef: React.MutableRefObject<number>;
  setCurrentIndex: (index: number) => void;
  setCurrentProject: (project: any) => void;
  step: number;
}

export function useCarouselTransition({
  textures,
  meshRefFront,
  meshRefBack,
  groupRef,
  currentIndexRef,
  setCurrentIndex,
  setCurrentProject,
  step,
}: TransitionDeps) {
  const transitionRef = useRef(0);
  const targetRotation = useRef(CAROUSEL_INITIAL_ROTATION_OFFSET);
  const setIsListFrameHovered = useStore(
    (state) => state.setIsListFrameHovered
  );

  const updateTransitionTextures = useCallback(
    (fromIndex: number, toIndex: number, transitionValue = 0) => {
      if (!meshRefFront.current || !meshRefBack.current || !textures.length)
        return;

      meshRefFront.current.uniforms.texture1.value = textures[fromIndex];
      meshRefFront.current.uniforms.texture2.value = textures[toIndex];
      meshRefFront.current.uniforms.transition.value = transitionValue;

      meshRefBack.current.uniforms.texture1.value = textures[fromIndex];
      meshRefBack.current.uniforms.texture2.value = textures[toIndex];
      meshRefBack.current.uniforms.transition.value = transitionValue;
    },
    [textures, meshRefFront, meshRefBack]
  );

  const setTransitionValue = useCallback(
    (value: number) => {
      if (!meshRefFront.current || !meshRefBack.current) return;
      meshRefFront.current.uniforms.transition.value = value;
      meshRefBack.current.uniforms.transition.value = value;
    },
    [meshRefFront, meshRefBack]
  );

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
    [step, groupRef]
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
    [
      textures.length,
      currentIndexRef,
      updateTransitionTextures,
      setTargetRotationForIndex,
      setTransitionValue,
      setCurrentIndex,
      setCurrentProject,
    ]
  );

  const resetListFrameHover = useCallback(() => {
    setIsListFrameHovered(false);
  }, [setIsListFrameHovered]);

  return {
    targetRotation,
    transitionRef,
    animateTransition,
    resetListFrameHover,
    updateTransitionTextures,
  };
}
