import { useCallback, MutableRefObject } from "react";
import * as THREE from "three";
import { PROJECTS } from "@/app/data";

interface NavigationDeps {
  textures: THREE.Texture[];
  currentIndexRef: MutableRefObject<number>;
  animateTransition: (nextIndex: number, direction: number) => void;
  resetListFrameHover: () => void;
}

export function useProjectNavigation({
  textures,
  currentIndexRef,
  animateTransition,
  resetListFrameHover,
}: NavigationDeps) {
  const handleNext = useCallback(() => {
    if (!textures.length) return;
    const next = (currentIndexRef.current + 1) % textures.length;
    resetListFrameHover();
    animateTransition(next, 1);
  }, [
    animateTransition,
    textures.length,
    resetListFrameHover,
    currentIndexRef,
  ]);

  const handlePrev = useCallback(() => {
    if (!textures.length) return;
    const prev =
      (currentIndexRef.current - 1 + textures.length) % textures.length;
    resetListFrameHover();
    animateTransition(prev, -1);
  }, [
    animateTransition,
    textures.length,
    resetListFrameHover,
    currentIndexRef,
  ]);

  const handleSelectProject = useCallback(
    (index: number) => {
      if (index === currentIndexRef.current) return;
      const direction = index > currentIndexRef.current ? 1 : -1;
      resetListFrameHover();
      animateTransition(index, direction);
    },
    [animateTransition, resetListFrameHover, currentIndexRef]
  );

  return { handleNext, handlePrev, handleSelectProject };
}
