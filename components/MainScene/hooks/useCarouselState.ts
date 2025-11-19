import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Project, PROJECTS } from "@/app/data";

const CAROUSEL_INITIAL_ROTATION_OFFSET = Math.PI;
// TODO: mvoe to MainScene?
export const CAROUSEL_RADIUS = 5;


export function useCarouselState(textures: THREE.Texture[]) {
  const groupRef = useRef<THREE.Group | null>(null);
  const transitionRef = useRef(0);
  const targetRotation = useRef(CAROUSEL_INITIAL_ROTATION_OFFSET);
  const currentIndexRef = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProject, setCurrentProject] = useState<Project>(PROJECTS[0]);

  const numFrames = useMemo(() => textures.length, [textures.length]);
  const step = useMemo(() => (2 * Math.PI) / numFrames, [numFrames]);

  return {
    groupRef,
    transitionRef,
    targetRotation,
    currentIndexRef,
    currentIndex,
    setCurrentIndex,
    currentProject,
    setCurrentProject,
    numFrames,
    step,
  };
}
