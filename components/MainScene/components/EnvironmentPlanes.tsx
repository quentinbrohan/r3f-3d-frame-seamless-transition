"use client";

import React from "react";
import * as THREE from "three";

interface EnvironmentPlanesProps {
    facingFrameMeshMaterialRef: React.RefObject<THREE.ShaderMaterial | null>;
    facingCameraMeshMaterialRef: React.RefObject<THREE.ShaderMaterial | null>;
    isVisible: boolean;
}
export const EnvironmentPlanes: React.FC<EnvironmentPlanesProps> = ({ facingFrameMeshMaterialRef, facingCameraMeshMaterialRef, isVisible }) => (
    <group name="Environments" visible={isVisible}>
        <mesh position={[0, 0, -5]} name="Plane Facing Frame (behind camera)">
            <planeGeometry args={[20, 20]} />
            <transitionMaterial ref={facingCameraMeshMaterialRef} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 5]} rotation={[0, Math.PI, 0]} name="Plane Facing Camera">
            <planeGeometry args={[20, 20]} />
            <transitionMaterial ref={facingFrameMeshMaterialRef} toneMapped={false} />
        </mesh>
    </group>
);
