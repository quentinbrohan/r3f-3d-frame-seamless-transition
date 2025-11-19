"use client";

import React from "react";

export const LightingRig = () => (
    <group name="Main Scene Lights">
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[0, 5, -5]} intensity={0.8} />
    </group>
);
