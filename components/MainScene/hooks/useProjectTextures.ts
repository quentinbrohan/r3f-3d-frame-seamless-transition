import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export const useProjectTextures = (imageUrls: string[]) => {
  const textures = useTexture(imageUrls);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });

    return () => {
      textures.forEach((texture) => {
        texture.dispose();
      });
    };
  }, [textures]);

  return textures;
};
